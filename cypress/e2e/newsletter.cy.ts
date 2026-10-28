import newsletter from '../pages/NewsletterForm'

/**
 * Subscribe Newsletter – hanya validasi sisi klien. Request ke Mailchimp
 * di-stub dan submit native dicegah, sehingga tidak ada email yang terdaftar.
 */
describe('Subscribe Newsletter', () => {
  beforeEach(() => {
    cy.visit('/')
    newsletter.form().scrollIntoView()
    newsletter.amankan()
  })

  const assertTidakTerkirim = () => {
    cy.get('@mailchimp.all').should('have.length', 0)
  }

  it('TC-NWSL-001 | Email kosong tidak dapat di-subscribe', { tags: ['@regression', '@P3', '@negative'] }, () => {
    newsletter.email().clear()
    newsletter.tombolSubscribe().click()
    newsletter.email().then(($el) => expect($el[0].validity.valueMissing, 'email wajib diisi').to.be.true)
    newsletter.pesanError().should('be.visible')
    assertTidakTerkirim()
  })

  it('TC-NWSL-002 | Format email tidak valid ditolak', { tags: ['@regression', '@P3', '@negative'] }, () => {
    newsletter.email().clear().type('abc')
    newsletter.tombolSubscribe().click()
    newsletter.email().then(($el) => expect($el[0].validity.typeMismatch, 'format email tidak valid').to.be.true)
    newsletter.pesanError().should('be.visible')
    assertTidakTerkirim()
  })
})
