import menu from '../pages/NavigationMenu'

/** Mengubah path relatif menjadi URL absolut untuk cy.request. */
const absolute = (path) => (path.startsWith('http') ? path : `${Cypress.config('baseUrl')}${path}`)

describe('Header & Menu Navigasi', () => {
  beforeEach(() => {
    cy.fixture('menu').as('menu')
    cy.visit('/')
  })

  it('TC-NAV-001 | Menu hamburger dapat dibuka dan ditutup', { tags: ['@smoke', '@P1'] }, function () {
    menu.open()
    menu.menu().should('be.visible')
    menu.topLevelItems().should('have.length', this.menu.topLevel.length)
    this.menu.topLevel.forEach((label) => {
      menu.topLevelItem(label).should('exist')
    })
    menu.close()
  })

  it('TC-NAV-002 | Sub-menu dapat di-expand', { tags: ['@regression', '@P1'] }, () => {
    menu.open()
    ;['tentang baznas', 'zakat', 'layanan'].forEach((label) => {
      menu.expand(label)
      menu.topLevelItem(label).find('> ul.nav-treeview').should('be.visible')
    })
  })

  const groups = [
    { id: 'TC-NAV-003', label: 'tentang baznas', key: 'tentangBaznas', title: 'Tentang BAZNAS' },
    { id: 'TC-NAV-004', label: 'zakat', key: 'zakat', title: 'Zakat' },
    { id: 'TC-NAV-005', label: 'layanan', key: 'layanan', title: 'Layanan' },
  ]

  groups.forEach(({ id, label, key, title }) => {
    it(`${id} | Sub-menu ${title} mengarah ke halaman benar`, { tags: ['@regression', '@P1'] }, function () {
      menu.open()
      menu.expand(label)
      this.menu[key].forEach(({ label: subLabel, path }) => {
        menu
          .subMenuLink(label, subLabel)
          .should('have.attr', 'href')
          .and((href) => expect(href.replace(Cypress.config('baseUrl'), '')).to.eq(path))
        cy.checkUrlStatus(absolute(path)).its('status').should('be.lessThan', 400)
      })
    })
  })
})
