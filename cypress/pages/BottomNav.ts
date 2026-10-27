/**
 * Quick menu yang menempel di bagian bawah layar (footer.main-footer).
 */
class BottomNav {
  container() {
    return cy.get('footer.main-footer')
  }

  linkTo(href: string) {
    return this.container().find(`a[href^="${href}"]`).first()
  }
}

export default new BottomNav()
