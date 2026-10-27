/**
 * Menu samping (AdminLTE control-sidebar) yang dibuka lewat ikon hamburger.
 */
class NavigationMenu {
  hamburger() {
    return cy.get('a.nav-link[data-widget="control-sidebar"]')
  }

  open() {
    this.hamburger().click()
    cy.get('body').should('have.class', 'control-sidebar-slide-open')
  }

  close() {
    this.hamburger().click()
    cy.get('body').should('not.have.class', 'control-sidebar-slide-open')
  }

  menu() {
    return cy.get('ul.nav-sidebar')
  }

  /** Item level teratas (li langsung di bawah ul.nav-sidebar). */
  topLevelItems() {
    return cy.get('ul.nav-sidebar > li.nav-item')
  }

  /** li level teratas berdasarkan label (case-insensitive). */
  topLevelItem(label) {
    return this.topLevelItems()
      .filter((_, li) => {
        const a = li.querySelector(':scope > a')
        return a && a.textContent.trim().toLowerCase().startsWith(label.toLowerCase())
      })
      .first()
  }

  expand(label) {
    this.topLevelItem(label).children('a').click()
    this.topLevelItem(label).should('have.class', 'menu-open')
  }

  /** Link sub-menu di dalam sebuah grup menu berdasarkan label. */
  subMenuLink(groupLabel, subLabel) {
    return this.topLevelItem(groupLabel)
      .find('ul a')
      .filter((_, a) => a.textContent.replace(/\s+/g, ' ').trim().toLowerCase() === subLabel.toLowerCase())
      .first()
  }
}

export default new NavigationMenu()
