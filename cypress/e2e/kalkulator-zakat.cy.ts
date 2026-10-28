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

  it('TC-CALC-008 | Nominal besar diformat dan dihitung dengan benar', { tags: ['@regression', '@P2', '@boundary'] }, () => {
    kalkulator.isiPenghasilan(1000000000)
    kalkulator.gaji().should('have.value', '1.000.000.000')
    kalkulator.hitung()
    assertZakat(25000000)
    kalkulator.totalZakat().invoke('val').should('not.match', /e/i)
  })

  it('TC-CALC-009 | Input huruf ditolak', { tags: ['@regression', '@P1', '@negative'] }, () => {
    kalkulator.gaji().clear().type('abc')
    kalkulator.gaji().invoke('val').then((val) => {
      expect(val, 'field gaji tidak berisi huruf').not.to.match(/[a-z]/i)
    })
  })

  // Temuan F-19: mask input (formatRupiah) mempertahankan koma, sehingga "1,5"
  // diterima; minus dan karakter spesial sudah dibuang.
  it('TC-CALC-010 | Input karakter spesial & minus ditolak', { tags: ['@regression', '@P2', '@negative', '@known-bug'] }, () => {
    ;['-5000000', '1,5', '@#$'].forEach((input) => {
      kalkulator.gaji().clear().type(input)
      // hanya digit (dengan pemisah ribuan ".") yang boleh tersisa
      kalkulator.gaji().invoke('val').should((val) => expect(String(val), `input "${input}"`).to.match(/^[\d.]*$/))
    })
  })

  it('TC-CALC-011 | Hitung dengan field kosong / nol', { tags: ['@regression', '@P2', '@negative'] }, () => {
    // Catat hanya error dari script halaman kalkulator, bukan dari script pihak ketiga.
    const errors: string[] = []
    cy.on('uncaught:exception', (err) => {
      if (String(err.stack).includes('kalkulatorzakat')) errors.push(err.message)
      return false
    })
    kalkulator.gaji().clear()
    kalkulator.penghasilanLain().clear()
    kalkulator.hitung()
    kalkulator.pesanBelumNisab().should('be.visible')
    kalkulator.hasilZakat().should('not.be.visible')
    cy.then(() => expect(errors, 'error JavaScript halaman').to.be.empty)
  })

  it('TC-CALC-012 | Field hasil tidak dapat diedit pengguna', { tags: ['@regression', '@P2', '@negative'] }, () => {
    kalkulator.nisabPerTahun().should('have.prop', 'readOnly', true)
    kalkulator.nisabPerBulan().should('have.prop', 'readOnly', true)
    kalkulator.totalZakat().should('be.disabled')
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

  it("TC-CALC-016 | Tombol 'Sedekah' saat di bawah nisab membawa ke form sedekah", { tags: ['@regression', '@P2'] }, () => {
    kalkulator.isiPenghasilan(5000000)
    kalkulator.hitung()
    kalkulator.pesanBelumNisab().contains('button', 'Sedekah').click()
    cy.origin('https://bayarzakat.baznas.go.id', () => {
      cy.location('pathname').should('eq', '/sedekahbaznas')
      cy.get('#type_of_fund').should('have.value', 'sedekah')
    })
  })
})

/**
 * Jenis zakat selain penghasilan. Rumus diambil dari script halaman
 * (fungsi hitungZakperJasa, hitungZakperNiaga, hitungZakPerdagangan,
 * hitungZakEmas) dan perlu dikonfirmasi tim bisnis.
 */
describe('Kalkulator Zakat – Perusahaan, Perdagangan, Emas', () => {
  beforeEach(() => {
    kalkulator.visit()
  })

  it('TC-CALC-017 | Dropdown Jenis Zakat berisi 4 jenis', { tags: ['@regression', '@P2'] }, () => {
    kalkulator.jenisZakat().find<HTMLOptionElement>('option').then(($opts) => {
      expect([...$opts].map((o) => o.text.trim())).to.deep.eq(zakat.jenisKalkulator)
      expect([...$opts].map((o) => o.value)).to.deep.eq(zakat.jenisKalkulatorValue)
    })
    zakat.jenisKalkulatorValue.forEach((jenis) => {
      kalkulator.pilihJenis(jenis)
      zakat.jenisKalkulatorValue
        .filter((lain) => lain !== jenis)
        .forEach((lain) => kalkulator.section(lain).should('not.be.visible'))
    })
  })

  // Rumus: Jasa = 2,5% x pendapatan sebelum pajak; Dagang/Industri = 2,5% x
  // (aktiva lancar - pasiva lancar). Wajib zakat jika >= nisab per tahun.
  it('TC-CALC-018 | Kalkulator zakat perusahaan', { tags: ['@regression', '@P2'] }, () => {
    kalkulator.pilihJenis('perusahaan')
    kalkulator.get('pendapatanSebelumPajak').typeNominal(1000000000)
    kalkulator.klikTombol('hitungZakperJasa')
    kalkulator.get('hasilPerusahaanJasa').should('be.visible')
    kalkulator.get('zakatPerusahaanJasa').should('have.value', '25.000.000')

    kalkulator.get('tabDagangIndustri').click()
    kalkulator.get('aktivaLancar').typeNominal(1500000000)
    kalkulator.get('pasivaLancar').typeNominal(500000000)
    kalkulator.get('jumlahAktivaBersih').should('have.value', '1.000.000.000')
    kalkulator.klikTombol('hitungZakperNiaga')
    kalkulator.get('hasilPerusahaanNiaga').should('be.visible')
    kalkulator.get('zakatPerusahaanNiaga').should('have.value', '25.000.000')
  })

  // Rumus: 2,5% x (aset lancar + laba), wajib zakat jika >= nisab per tahun.
  it('TC-CALC-019 | Kalkulator zakat perdagangan', { tags: ['@regression', '@P2'] }, () => {
    kalkulator.pilihJenis('perdagangan')
    kalkulator.get('nisabPerdagangan').should('have.value', formatRibuan(zakat.nisabPerTahun))

    kalkulator.get('asetLancar').typeNominal(100000000)
    kalkulator.get('laba').typeNominal(20000000)
    kalkulator.get('jumlahAset').should('have.value', '120.000.000')
    kalkulator.klikTombol('hitungZakPerdagangan')
    kalkulator.get('hasilPerdagangan').should('be.visible')
    kalkulator.get('zakatPerdagangan').should('have.value', '3.000.000')

    // di bawah nisab: tidak wajib zakat
    kalkulator.klikTombol('resetZakPerdagangan')
    kalkulator.get('asetLancar').typeNominal(50000000)
    kalkulator.get('laba').typeNominal(10000000)
    kalkulator.klikTombol('hitungZakPerdagangan')
    kalkulator.get('belumNisabPerdagangan').should('be.visible').and('contain.text', zakat.pesanBelumNisabHarta)
    kalkulator.get('hasilPerdagangan').should('not.be.visible')
  })

  // Rumus: 2,5% x (gram emas x harga per gram), wajib zakat jika >= 85 gram.
  it('TC-CALC-020 | Kalkulator zakat emas', { tags: ['@regression', '@P2'] }, () => {
    kalkulator.pilihJenis('emas_perak')
    kalkulator.get('jumlahEmas').clear().type('100')
    kalkulator.get('hargaEmas').typeNominal(1000000)
    kalkulator.klikTombol('hitungZakEmas')
    kalkulator.get('hasilEmas').should('be.visible')
    kalkulator.get('zakatEmas').should('have.value', '2.500.000')
  })

  it('TC-CALC-021 | Zakat emas di bawah 85 gram', { tags: ['@regression', '@P2', '@boundary'] }, () => {
    kalkulator.pilihJenis('emas_perak')
    kalkulator.get('jumlahEmas').clear().type('50')
    kalkulator.get('hargaEmas').typeNominal(1000000)
    kalkulator.klikTombol('hitungZakEmas')
    kalkulator.get('belumNisabEmas').should('be.visible').and('contain.text', zakat.pesanBelumNisabHarta)
    kalkulator.get('hasilEmas').should('not.be.visible')
  })
})
