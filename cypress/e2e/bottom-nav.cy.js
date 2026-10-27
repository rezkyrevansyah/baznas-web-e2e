import bottomNav from '../pages/BottomNav'

describe('Bottom Navigation (Quick Menu)', () => {
  beforeEach(() => {
    cy.fixture('navigation').as('nav')
  })

  it('TC-BNAV-001 | Quick menu bawah tampil di semua halaman utama', { tags: ['@smoke', '@P1'] }, function () {
    this.nav.bottomNavPages.forEach((page) => {
      cy.visit(page)
      bottomNav.container().should('be.visible')
      this.nav.bottomNav.forEach(({ href }) => {
        bottomNav.linkTo(href).should('exist')
      })
    })
  })

  it("TC-BNAV-002 | Tombol 'Bayar Zakat' membuka form pembayaran", { tags: ['@smoke', '@P1'] }, () => {
    cy.visit('/')
    bottomNav.linkTo('https://baznas.go.id/bayarzakat').click()
    cy.origin('https://bayarzakat.baznas.go.id', () => {
      cy.location('pathname').should('eq', '/bayarzakat')
      cy.get('#type_of_fund').should('be.visible')
    })
  })

  it('TC-BNAV-003 | Item PPID, Layanan Mustahik, Konfirmasi, Transfer mengarah ke tujuan benar', { tags: ['@regression', '@P1'] }, function () {
    cy.visit('/')
    this.nav.bottomNav
      .filter(({ label }) => label !== 'Bayar Zakat')
      .forEach(({ href }) => {
        bottomNav.linkTo(href).should('exist')
        cy.checkUrlStatus(href).its('status').should('be.lessThan', 400)
      })
  })
})
