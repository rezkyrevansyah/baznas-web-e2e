import jemput from '../pages/JemputZakatPage'

/**
 * Form Jemput Zakat – hanya validasi sisi klien. Form tidak pernah benar-benar
 * terkirim: verifikasi captcha di-stub "false" dan endpoint submit diblokir.
 */
describe('Form Jemput Zakat – Validasi', () => {
  let data

  before(() => {
    cy.fixture('jemput-zakat').then((fx) => {
      data = fx
    })
  })

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

  // Temuan F-15: tidak ditemukan validasi nominal minimum Rp1.000.000 di sisi
  // klien (tidak ada atribut min/pattern dan handler submit hanya memeriksa captcha).
  it('TC-JMP-007 | Nominal di bawah minimum Rp1.000.000', { tags: ['@regression', '@P1', '@boundary', '@known-bug'] }, () => {
    isiDataValid()
    jemput.field('nominal').clear().type(String(data.minimalNominal - 500000))
    jemput.isValid().should('eq', false)
  })
})
