import bayar, { sel } from '../pages/BayarZakatPage'
import { toNumber } from '../support/commands'
import data from '../fixtures/bayar-zakat.json'
import zakat from '../fixtures/zakat.json'

const { fidyahPerHari, fidyahMaksHari } = zakat

/**
 * Form Bayar Zakat Online – https://bayarzakat.baznas.go.id/bayarzakat
 *
 * PENTING: pengujian berhenti sebelum transaksi. Seluruh request tulis diblokir
 * (lihat support/e2e.ts) dan endpoint data muzaki di-stub, sehingga tidak ada
 * data donasi yang terkirim ke server.
 */
describe('Form Bayar Zakat Online', () => {
  beforeEach(() => {
    bayar.stubSubmitCustomer()
    bayar.visit(data.url)
  })

  const assertSubmitTidakTerkirim = () => {
    cy.get('@submitCustomer.all').should('have.length', 0)
  }

  it('TC-PAY-001 | Form bayar zakat dapat diakses', { tags: ['@smoke', '@P1'] }, () => {
    // /bayarzakat di domain utama harus diarahkan ke subdomain pembayaran
    cy.request(`${Cypress.config('baseUrl')}/bayarzakat`).then((res) => {
      expect(res.status).to.eq(200)
      expect((res.redirects ?? []).join(' '), 'redirect ke bayarzakat.baznas.go.id').to.contain('bayarzakat.baznas.go.id')
    })
    cy.contains('TUNAIKAN ZAKAT, INFAK, DAN SEDEKAH').should('be.visible')
    cy.contains('button', 'Isi Formulir').should('be.visible')
    cy.contains('button', 'Kalkulator').should('be.visible')
  })

  it('TC-PAY-002 | Dropdown Jenis Dana berisi 4 pilihan', { tags: ['@regression', '@P1'] }, () => {
    bayar.get('jenisDana').should('have.value', 'zakat')
    bayar.get('jenisDana').find<HTMLOptionElement>('option').then(($opts) => {
      const actual = [...$opts].map((o) => ({ value: o.value, label: o.text.trim() }))
      expect(actual).to.deep.eq(data.jenisDana)
    })
  })

  it('TC-PAY-003 | Sub-jenis Zakat sesuai', { tags: ['@regression', '@P1'] }, () => {
    bayar.pilihJenisDana('zakat')
    bayar.get('subJenis').find<HTMLOptionElement>('option').then(($opts) => {
      expect([...$opts].map((o) => o.text.trim())).to.deep.eq(data.subJenisZakat)
    })
  })

  it('TC-PAY-007 | Fidyah 1 hari = Rp 65.000', { tags: ['@regression', '@P1'] }, () => {
    bayar.pilihJenisDana('fidyah')
    bayar.get('jumlahHari').should('be.visible').select('1')
    bayar.get('nominal').should('have.attr', 'readonly')
    bayar.get('nominal').invoke('val').then((val) => expect(toNumber(val)).to.eq(fidyahPerHari))
  })

  it('TC-PAY-008 | Fidyah dihitung berdasarkan jumlah hari', { tags: ['@regression', '@P1'] }, () => {
    bayar.pilihJenisDana('fidyah')
    // pilihan hari 1..30 (+ 1 opsi placeholder)
    bayar.get('jumlahHari').find('option').should('have.length', fidyahMaksHari + 1)
    ;[5, fidyahMaksHari].forEach((hari) => {
      bayar.get('jumlahHari').select(String(hari))
      bayar.get('nominal').invoke('val').then((val) => expect(toNumber(val), `${hari} hari`).to.eq(hari * fidyahPerHari))
    })
  })

  it('TC-PAY-010 | Field data muzaki tampil', { tags: ['@regression', '@P1'] }, () => {
    cy.contains('Silahkan lengkapi data di bawah ini').should('be.visible')
    bayar.get('sapaan').should('have.length', 2).then(($r) => {
      expect([...$r].map((r) => (r as HTMLInputElement).value)).to.deep.eq(['Bapak', 'Ibu'])
    })
    ;(['nama', 'handphone', 'email'] as const).forEach((key) => bayar.get(key).should('be.visible'))
    bayar.get('persetujuan').should('exist')
    // nama hanya menerima huruf, spasi, titik dan koma
    bayar.get('nama').type('Pengujian 123 Otomatis').should('have.value', 'Pengujian  Otomatis')
  })

  it('TC-PAY-011 | Nominal kosong tidak bisa diproses', { tags: ['@regression', '@P1', '@negative'] }, () => {
    bayar.get('nominal').clear()
    bayar.klikPilihPembayaran()
    bayar.get('nominalError').should('be.visible').and('contain.text', data.pesanValidasi.nominal)
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  // Temuan F-14: dengan nominal terisi, form langsung lanjut ke pemilihan metode
  // pembayaran walaupun nama / HP / email kosong atau tidak valid. Aturan
  // validasinya ada di halaman, tetapi belum dijalankan pada langkah ini.
  it('TC-PAY-012 | Nama lengkap wajib diisi', { tags: ['@regression', '@P1', '@negative', '@known-bug'] }, () => {
    bayar.isiNominal(data.dataDummy.nominal)
    bayar.get('nama').clear()
    bayar.get('handphone').type(data.dataDummy.handphone)
    bayar.get('email').type(data.dataDummy.email)
    bayar.klikPilihPembayaran()
    bayar.get('namaError').should('be.visible').and('contain.text', data.pesanValidasi.nama)
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  it('TC-PAY-013 | Format email tidak valid ditolak', { tags: ['@regression', '@P1', '@negative', '@known-bug'] }, () => {
    bayar.isiNominal(data.dataDummy.nominal)
    bayar.get('nama').type(data.dataDummy.nama)
    bayar.get('handphone').type(data.dataDummy.handphone)
    bayar.get('email').type('test@')
    bayar.klikPilihPembayaran()
    bayar.get('emailError').should('be.visible').and('contain.text', data.pesanValidasi.email)
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  it('TC-PAY-014 | Nomor HP tidak valid ditolak', { tags: ['@regression', '@P1', '@negative', '@known-bug'] }, () => {
    bayar.isiNominal(data.dataDummy.nominal)
    bayar.get('nama').type(data.dataDummy.nama)
    bayar.get('handphone').type('123')
    bayar.get('email').type(data.dataDummy.email)
    bayar.klikPilihPembayaran()
    bayar.get('handphoneError').should('be.visible')
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  it('TC-PAY-017 | Daftar metode pembayaran lengkap', { tags: ['@regression', '@P1'] }, () => {
    cy.get<HTMLInputElement>(sel.metode).then(($radios) => {
      const values = [...new Set([...$radios].map((r) => r.value))]
      data.metodePembayaran.forEach((m) => expect(values, `metode ${m}`).to.include(m))
    })
  })
})
