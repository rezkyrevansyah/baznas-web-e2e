import kalkulator from '../pages/KalkulatorZakatPage'
import { toNumber, formatRibuan } from '../support/commands'
import zakat from '../fixtures/zakat.json'

describe('Kalkulator Zakat – Penghasilan', () => {
  beforeEach(() => {
    kalkulator.visit()
  })

  /** Zakat yang diharapkan: 2,5% dibulatkan ke atas (sesuai perilaku kalkulator). */
  const expectedZakat = (penghasilan: number) => Math.ceil(penghasilan * zakat.tarifZakat)

  const assertZakat = (nominal: number) => {
    kalkulator.hasilZakat().should('be.visible')
    kalkulator.totalZakat().should('have.value', formatRibuan(nominal))
  }

  it('TC-CALC-001 | Nilai nisab tampil sesuai ketetapan', { tags: ['@smoke', '@P1'] }, () => {
    kalkulator.jenisZakat().find('option').then(($opts) => {
      const labels = [...$opts].map((o) => o.text.trim())
      expect(labels).to.deep.eq(zakat.jenisKalkulator)
    })
    kalkulator.nisabPerTahun().should('have.value', formatRibuan(zakat.nisabPerTahun)).and('have.attr', 'readonly')
    kalkulator.nisabPerBulan().should('have.value', formatRibuan(zakat.nisabPerBulan)).and('have.attr', 'readonly')
    kalkulator.form().should('contain.text', zakat.sumberNisab)
  })

  it('TC-CALC-002 | Jumlah penghasilan = gaji + penghasilan lain', { tags: ['@regression', '@P1'] }, () => {
    kalkulator.isiPenghasilan(8000000, 2000000)
    kalkulator.gaji().should('have.value', '8.000.000')
    kalkulator.jumlahPenghasilan().should('have.value', '10.000.000')
  })

  it('TC-CALC-003 | Penghasilan di atas nisab menghasilkan zakat 2,5%', { tags: ['@smoke', '@P1'] }, () => {
    kalkulator.isiPenghasilan(10000000)
    kalkulator.hitung()
    assertZakat(250000)
    kalkulator.button('Bayar Zakat').should('be.visible')
    kalkulator.pesanBelumNisab().should('not.be.visible')
  })

  it('TC-CALC-004 | Penghasilan di bawah nisab tidak wajib zakat', { tags: ['@regression', '@P1'] }, () => {
    kalkulator.isiPenghasilan(5000000)
    kalkulator.hitung()
    kalkulator.pesanBelumNisab().should('be.visible').and('contain.text', zakat.pesanBelumNisab)
    kalkulator.pesanBelumNisab().contains('button', 'Sedekah').should('be.visible')
    kalkulator.hasilZakat().should('not.be.visible')
  })

  it('TC-CALC-005 | Boundary: penghasilan tepat sama dengan nisab', { tags: ['@regression', '@P1', '@boundary'] }, () => {
    kalkulator.isiPenghasilan(zakat.nisabPerBulan)
    kalkulator.hitung()
    // 7.640.114 x 2,5% = 191.002,85 -> dibulatkan ke atas = 191.003
    assertZakat(expectedZakat(zakat.nisabPerBulan))
  })

  it('TC-CALC-006 | Boundary: penghasilan 1 rupiah di bawah nisab', { tags: ['@regression', '@P1', '@boundary'] }, () => {
    kalkulator.isiPenghasilan(zakat.nisabPerBulan - 1)
    kalkulator.hitung()
    kalkulator.pesanBelumNisab().should('be.visible')
    kalkulator.hasilZakat().should('not.be.visible')
  })

  it('TC-CALC-007 | Gabungan gaji + lain-lain melewati nisab', { tags: ['@regression', '@P1'] }, () => {
    kalkulator.isiPenghasilan(6000000, 2000000)
    kalkulator.jumlahPenghasilan().should('have.value', '8.000.000')
    kalkulator.hitung()
    assertZakat(200000)
  })

  it('TC-CALC-009 | Input huruf ditolak', { tags: ['@regression', '@P1', '@negative'] }, () => {
    kalkulator.gaji().clear().type('abc')
    kalkulator.gaji().invoke('val').then((val) => {
      expect(val, 'field gaji tidak berisi huruf').not.to.match(/[a-z]/i)
    })
  })

  it('TC-CALC-013 | Tombol Reset mengosongkan semua input & hasil', { tags: ['@regression', '@P1'] }, () => {
    kalkulator.isiPenghasilan(10000000, 500000)
    kalkulator.hitung()
    assertZakat(262500)
    kalkulator.reset()
    ;(['gaji', 'penghasilanLain', 'jumlahPenghasilan', 'totalZakat'] as const).forEach((field) => {
      kalkulator[field]().invoke('val').then((val) => expect(toNumber(val), field).to.eq(0))
    })
    kalkulator.button('Hitung Zakat').should('be.visible')
    kalkulator.hasilZakat().should('not.be.visible')
    kalkulator.pesanBelumNisab().should('not.be.visible')
  })

  // Temuan F-01: setelah klik Hitung, tombol berubah menjadi "Bayar Zakat" dan
  // hasil lama tetap tampil walaupun input penghasilan diubah.
  it('TC-CALC-014 | Hasil diperbarui saat input diubah setelah Hitung', { tags: ['@regression', '@P1', '@known-bug'] }, () => {
    kalkulator.isiPenghasilan(10000000)
    kalkulator.hitung()
    assertZakat(250000)

    kalkulator.gaji().typeNominal(5000000)

    // Hasil tidak boleh tetap 250.000: harus dihitung ulang, di-reset,
    // atau tombol kembali menjadi "Hitung Zakat".
    cy.get('form#form_penghasilan').then(($form) => {
      const hitungVisible = Cypress.$($form).find('.btn_hitung_penghasilan:visible').length > 0
      const zakatVal = toNumber(Cypress.$($form).find('input[name="total_zakat"]').val())
      expect(hitungVisible || zakatVal !== 250000, 'hasil zakat lama tidak lagi berlaku').to.be.true
    })
  })

  it("TC-CALC-015a | Tombol 'Bayar Zakat' setelah hitung membawa ke form pembayaran", { tags: ['@regression', '@P1'] }, () => {
    kalkulator.isiPenghasilan(10000000)
    kalkulator.hitung()
    kalkulator.button('Bayar Zakat').click()
    cy.origin('https://bayarzakat.baznas.go.id', () => {
      cy.location('pathname').should('eq', '/bayarzakat')
      cy.get('#type_of_fund').should('be.visible')
    })
  })

  // Temuan F-12: parameter jenis & jumlah dari kalkulator hilang saat redirect
  // ke bayarzakat.baznas.go.id, sehingga nominal tidak terisi otomatis.
  it('TC-CALC-015b | Nominal zakat dari kalkulator terisi di form pembayaran', { tags: ['@regression', '@P1', '@known-bug'] }, () => {
    kalkulator.isiPenghasilan(10000000)
    kalkulator.hitung()
    kalkulator.button('Bayar Zakat').click()
    cy.origin('https://bayarzakat.baznas.go.id', () => {
      cy.get('#nominal').invoke('val').then((val) => {
        expect(Number(String(val).replace(/[^0-9]/g, ''))).to.eq(250000)
      })
    })
  })
})
