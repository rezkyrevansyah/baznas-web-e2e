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

  // Catatan F-04: beberapa sub-jenis Infak berlabel "Sedekah ..." (perlu konfirmasi).
  it('TC-PAY-004 | Sub-jenis Infak sesuai', { tags: ['@regression', '@P2'] }, () => {
    bayar.pilihJenisDana('infak')
    bayar.get('subJenis').find<HTMLOptionElement>('option').then(($opts) => {
      expect([...$opts].map((o) => o.text.trim())).to.deep.eq(data.subJenisInfak)
    })
  })

  it('TC-PAY-005 | Sub-jenis Sedekah sesuai', { tags: ['@regression', '@P2'] }, () => {
    bayar.pilihJenisDana('sedekah')
    bayar.get('subJenis').find<HTMLOptionElement>('option').then(($opts) => {
      expect([...$opts].map((o) => o.text.trim())).to.deep.eq(data.subJenisSedekah)
    })
  })

  // Temuan F-05: nominal fidyah (65.000) tetap terisi setelah jenis dana diganti.
  it('TC-PAY-006 | Nominal tidak terbawa saat berganti jenis dana', { tags: ['@regression', '@P2', '@negative', '@known-bug'] }, () => {
    bayar.pilihJenisDana('fidyah')
    bayar.get('nominal').invoke('val').then((val) => expect(toNumber(val)).to.eq(fidyahPerHari))
    bayar.pilihJenisDana('infak')
    bayar.get('nominal').should('not.have.attr', 'readonly')
    bayar.get('nominal').invoke('val').then((val) => expect(toNumber(val), 'nominal setelah ganti ke Infak').to.eq(0))
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

  it('TC-PAY-009 | Pilihan jumlah hari fidyah 1–30', { tags: ['@regression', '@P2', '@boundary'] }, () => {
    bayar.pilihJenisDana('fidyah')
    bayar.get('jumlahHari').find<HTMLOptionElement>('option').then(($opts) => {
      const hari = [...$opts].map((o) => o.value).filter((v) => v !== '0')
      expect(hari).to.deep.eq(Array.from({ length: fidyahMaksHari }, (_, i) => String(i + 1)))
    })
  })

  it('TC-PAY-010 | Field data muzaki tampil', { tags: ['@regression', '@P1'] }, () => {
    cy.contains('Silahkan lengkapi data di bawah ini').should('be.visible')
    bayar.get('sapaan').should('have.length', 2).then(($r) => {
      expect([...$r].map((r) => (r as HTMLInputElement).value)).to.deep.eq(['Bapak', 'Ibu'])
    })
    ;(['nama', 'handphone', 'email'] as const).forEach((key) => bayar.get(key).should('be.visible'))
    bayar.get('persetujuan').should('exist')
    // nama hanya menerima huruf, spasi, titik dan koma (difilter saat onchange/blur)
    bayar.get('nama').type('Pengujian 123 Otomatis').blur()
    bayar.get('nama').should('have.value', 'Pengujian  Otomatis')
  })

  it('TC-PAY-011 | Nominal kosong tidak bisa diproses', { tags: ['@regression', '@P1', '@negative'] }, () => {
    bayar.get('nominal').clear()
    bayar.klikPilihPembayaran()
    bayar.get('nominalError').should('be.visible').and('contain.text', data.pesanValidasi.nominal)
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  // Temuan F-14 (form lanjut tanpa validasi nama/HP/email) sudah diperbaiki di situs;
  // diverifikasi 27 Okt 2026: next_step() kini menjalankan validasi seluruh field.
  it('TC-PAY-012 | Nama lengkap wajib diisi', { tags: ['@regression', '@P1', '@negative'] }, () => {
    bayar.isiNominal(data.dataDummy.nominal)
    bayar.get('nama').clear()
    bayar.get('handphone').type(data.dataDummy.handphone)
    bayar.get('email').type(data.dataDummy.email)
    bayar.klikPilihPembayaran()
    bayar.get('namaError').should('be.visible').and('contain.text', data.pesanValidasi.nama)
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  it('TC-PAY-013 | Format email tidak valid ditolak', { tags: ['@regression', '@P1', '@negative'] }, () => {
    bayar.isiNominal(data.dataDummy.nominal)
    bayar.get('nama').type(data.dataDummy.nama)
    bayar.get('handphone').type(data.dataDummy.handphone)
    bayar.get('email').type('test@')
    bayar.klikPilihPembayaran()
    bayar.get('emailError').should('be.visible').and('contain.text', data.pesanValidasi.email)
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  it('TC-PAY-014 | Nomor HP tidak valid ditolak', { tags: ['@regression', '@P1', '@negative'] }, () => {
    bayar.isiNominal(data.dataDummy.nominal)
    bayar.get('nama').type(data.dataDummy.nama)
    bayar.get('handphone').type('123')
    bayar.get('email').type(data.dataDummy.email)
    bayar.klikPilihPembayaran()
    bayar.get('handphoneError').should('be.visible')
    bayar.assertTetapDiFormulir()
    assertSubmitTidakTerkirim()
  })

  // Batas minimum diterapkan di layar Metode Pembayaran: metode yang belum
  // memenuhi minimum dinonaktifkan. Tidak ada metode atau tombol bayar yang
  // diklik; request submit_customer di-stub (tidak sampai ke server).
  it('TC-PAY-015 | Nominal minimum / nol ditolak', { tags: ['@regression', '@P2', '@boundary'] }, () => {
    bayar.isiNominal(0)
    bayar.get('nama').type(data.dataDummy.nama)
    bayar.get('handphone').type(data.dataDummy.handphone)
    bayar.get('email').type(data.dataDummy.email)
    bayar.klikPilihPembayaran()
    cy.contains(data.pesanMinimalVirtualAccount).should('be.visible')
    bayar.get('metodeBank').should('have.length.at.least', 1).each(($radio) => expect($radio, 'metode bank').to.be.disabled)
    bayar.get('ikonMetodeNonaktif').should('be.visible')
  })

  it('TC-PAY-016 | Checkbox pernyataan muzaki', { tags: ['@regression', '@P2'] }, () => {
    cy.contains('span', data.pernyataanMuzaki[0])
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        const normal = text.replace(/\s+/g, ' ')
        data.pernyataanMuzaki.forEach((frasa) => expect(normal).to.contain(frasa))
      })
    bayar.get('persetujuan').should('have.attr', 'type', 'checkbox').check().should('be.checked')
  })

  it('TC-PAY-017 | Daftar metode pembayaran lengkap', { tags: ['@regression', '@P1'] }, () => {
    cy.get<HTMLInputElement>(sel.metode).then(($radios) => {
      const values = [...new Set([...$radios].map((r) => r.value))]
      data.metodePembayaran.forEach((m) => expect(values, `metode ${m}`).to.include(m))
    })
  })

  it('TC-PAY-018 | Logo metode pembayaran ter-load', { tags: ['@regression', '@P3'] }, () => {
    cy.get<HTMLImageElement>(sel.logoMetode).should(($imgs) => {
      expect($imgs.length, 'jumlah logo').to.be.at.least(data.metodePembayaran.length)
      const rusak = [...$imgs].filter((img) => !(img.complete && img.naturalWidth > 0)).map((img) => img.src)
      expect(rusak, `logo gagal dimuat:\n${rusak.join('\n')}`).to.be.empty
    })
  })

  it('TC-PAY-019 | Tab Kalkulator di halaman bayar zakat', { tags: ['@regression', '@P2'] }, () => {
    bayar.bukaTabKalkulator()
    bayar.get('opsiZakatPenghasilan').click()
    bayar.isiKalkulator('calcPendapatan', 10000000)
    bayar.klikKalkulator('hitungpenghasilan')
    bayar.get('calcHasilPenghasilan').should('be.visible')
    bayar.get('calcTotalPenghasilan').should('have.text', 'Rp 250.000')
    bayar.get('calcBayarPenghasilan').should('be.visible')
  })

  // Rumus (script halaman, fungsi hitungmaal): 2,5% x (emas/perak + tabungan +
  // kendaraan/aset - hutang). Perlu konfirmasi tim bisnis; lihat temuan F-18
  // tentang nilai nisab yang dipakai. Data uji melewati kedua nilai nisab.
  it('TC-PAY-020 | Tab Kalkulator - Zakat Maal', { tags: ['@regression', '@P2'] }, () => {
    bayar.bukaTabKalkulator()
    bayar.get('opsiZakatMaal').click()
    bayar.isiKalkulator('calcEmasPerak', 50000000)
    bayar.isiKalkulator('calcTabungan', 40000000)
    bayar.isiKalkulator('calcKendaraan', 20000000)
    bayar.isiKalkulator('calcHutang', 10000000)
    bayar.klikKalkulator('hitungmaal')
    bayar.get('calcHasilMaal').should('be.visible')
    bayar.get('calcTotalMaal').should('have.text', 'Rp 2.500.000')
    bayar.get('calcBayarMaal').should('be.visible')
  })
})
