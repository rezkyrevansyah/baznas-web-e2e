import home from '../pages/HomePage'
import nav from '../fixtures/navigation.json'

describe('Homepage', () => {
  it('TC-HOME-001 | Homepage berhasil dimuat', { tags: ['@smoke', '@P1'] }, () => {
    cy.request('/').its('status').should('eq', 200)
    home.visit()
    cy.title().should('contain', 'BAZNAS')
    cy.get('body').should('be.visible')
  })

  it('TC-HOME-002 | Logo BAZNAS tampil dan mengarah ke beranda', { tags: ['@smoke', '@P1'] }, () => {
    cy.visit('/zakat')
    home.logo()
      .should('be.visible')
      .and(($img) => expect($img[0].naturalWidth, 'logo ter-load').to.be.greaterThan(0))
    home.logo().closest('a').click()
    cy.location('pathname').should('eq', '/')
  })

  it('TC-HOME-004 | Kartu Zakat, Infak, Sedekah, Fidyah tampil', { tags: ['@smoke', '@P1'] }, () => {
    home.visit()
    home.zisCards().should('have.length', nav.homeCards.length)
    nav.homeCards.forEach(({ title }) => {
      home.zisCards().contains(title).should('be.visible')
    })
  })

  it("TC-HOME-005 | Tombol 'Selengkapnya' di setiap kartu mengarah ke halaman yang benar", { tags: ['@regression', '@P1'] }, () => {
    nav.homeCards.forEach(({ path }) => {
      home.visit()
      home.detailLink(path).should('contain.text', 'Selengkapnya').click()
      cy.location('pathname').should('eq', path)
      cy.request(path).its('status').should('eq', 200)
    })
  })
})
