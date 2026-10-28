import jemput from '../pages/JemputZakatPage'
import data from '../fixtures/jemput-zakat.json'

/**
 * Form Jemput Zakat – hanya validasi sisi klien. Form tidak pernah benar-benar
 * terkirim: verifikasi captcha di-stub "false" dan endpoint submit diblokir.
 */
describe('Form Jemput Zakat', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/verifycaptcha.php', { statusCode: 200, body: 'false' }).as('verifyCaptcha')
    cy.intercept('POST', '**/submit_jemput_zakat', { statusCode: 204, body: '' }).as('submitJemput')
    cy.on('window:alert', () => true)
    jemput.visit()
  })

  const isiDataValid = () => {
    const besok = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    jemput.field('nama').type(data.dataDummy.nama)
    jemput.field('hp').type(data.dataDummy.hp)
    jemput.field('email').type(data.dataDummy.email)
    jemput.field('tanggal_jemput').type(besok)
    jemput.field('jam_jemput').type(data.dataDummy.jam)
    jemput.field('nominal').type(String(data.minimalNominal))
    jemput.field('alamat').type(data.dataDummy.alamat)
    jemput.field('captcha_code').type('ABCDE')
  }

  const assertTidakTerkirim = () => {
    cy.get('@submitJemput.all').should('have.length', 0)
  }

  it('TC-JMP-001 | Form jemput zakat tampil lengkap', { tags: ['@regression', '@P2'] }, () => {
    data.infoLayanan.forEach((info) => cy.contains('p', info).should('be.visible'))
    data.labels.forEach((label) => jemput.form().contains('label', label).should('be.visible'))
    ;[...data.requiredFields, ...data.requiredSelects].forEach((name) => {
      jemput.field(name).should('be.visible').and('have.attr', 'required')
    })
    data.optionalFields.forEach((name) => {
      jemput.field(name).should('be.visible').and('not.have.attr', 'required')
    })
  })

  it('TC-JMP-002 | Opsi Jenis & Metode Pembayaran sesuai', { tags: ['@regression', '@P2'] }, () => {
    const opsi = (name: string) =>
      jemput.field(name).find<HTMLOptionElement>('option').then(($opts) => [...$opts].map((o) => o.text.trim()))
    opsi('jenis_bayar').should('deep.eq', data.jenisBayar)
    opsi('metode_bayar').should('deep.eq', data.metodeBayar)
  })

  // Captcha tidak diselesaikan otomatis; hanya dicek tampil dan dapat di-refresh.
  // Temuan F-20: captcha.php mengembalikan PHP Fatal error (fungsi GD
  // imagecreatetruecolor() tidak tersedia), sehingga gambar captcha tidak pernah tampil.
  it('TC-JMP-003 | Captcha tampil dan dapat di-refresh', { tags: ['@regression', '@P2', '@known-bug'] }, () => {
    const loaded = ($img: JQuery<HTMLImageElement>) => expect($img[0].naturalWidth, 'captcha ter-load').to.be.greaterThan(0)
    jemput.captchaImage().should('be.visible').and(loaded)
    jemput.captchaImage().invoke('attr', 'src').then((srcAwal) => {
      jemput.refreshCaptchaLink().click()
      jemput.captchaImage().should('not.have.attr', 'src', srcAwal).and(loaded)
    })
  })

  it('TC-JMP-004 | Submit form kosong menampilkan validasi', { tags: ['@regression', '@P1', '@negative'] }, () => {
    jemput.submitButton().click()
    jemput.isValid().should('eq', false)
    data.requiredFields.forEach((name) => {
      jemput.field(name).should('have.attr', 'required')
      jemput.field(name).then(($el) => {
        expect($el[0].validity.valueMissing, `${name} wajib diisi`).to.be.true
      })
    })
    assertTidakTerkirim()
  })

  it('TC-JMP-005 | Format email tidak valid ditolak', { tags: ['@regression', '@P1', '@negative'] }, () => {
    isiDataValid()
    jemput.field('email').clear().type('abc@')
    jemput.field('email').then(($el) => {
      expect($el[0].checkValidity(), 'email "abc@" tidak valid').to.be.false
    })
    jemput.isValid().should('eq', false)
    jemput.submitButton().click()
    assertTidakTerkirim()
  })

  it('TC-JMP-006 | Nomor HP berisi huruf ditolak', { tags: ['@regression', '@P2', '@negative'] }, () => {
    isiDataValid()
    jemput.field('hp').clear().type('abcdef')
    // hanyaAngka() menolak huruf saat diketik, sehingga field tetap kosong dan wajib diisi.
    // Pesan .invalid-feedback baru tampil setelah captcha benar; captcha di-stub "false"
    // (tidak di-bypass), jadi yang diperiksa adalah constraint validation field.
    jemput.field('hp').should('have.value', '').then(($el) => {
      expect($el[0].checkValidity(), 'nomor HP "abcdef" tidak valid').to.be.false
    })
    jemput.submitButton().click()
    assertTidakTerkirim()
  })

  // Temuan F-15: tidak ditemukan validasi nominal minimum Rp1.000.000 di sisi
  // klien (tidak ada atribut min/pattern dan handler submit hanya memeriksa captcha).
  it('TC-JMP-007 | Nominal di bawah minimum Rp1.000.000', { tags: ['@regression', '@P1', '@boundary', '@known-bug'] }, () => {
    isiDataValid()
    jemput.field('nominal').clear().type(String(data.minimalNominal - 500000))
    jemput.isValid().should('eq', false)
  })

  // Temuan F-09: field tanggal penjemputan tidak memiliki atribut min, sehingga
  // tanggal yang sudah lewat tetap diterima.
  it('TC-JMP-008 | Tanggal penjemputan di masa lalu', { tags: ['@regression', '@P2', '@negative', '@known-bug'] }, () => {
    const kemarin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    isiDataValid()
    jemput.field('tanggal_jemput').clear().type(kemarin)
    jemput.field('tanggal_jemput').then(($el) => {
      expect($el[0].checkValidity(), `tanggal ${kemarin} ditolak`).to.be.false
    })
    jemput.submitButton().click()
    assertTidakTerkirim()
  })
})
