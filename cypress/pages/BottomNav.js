/**
 * Quick menu yang menempel di bagian bawah layar (footer.main-footer).
 */
class BottomNav {
  container() {
    return cy.get('footer.main-footer')
  }

  linkTo(href) {
    return this.container().find(`a[href^="${href}"]`).first()
  }
}

export default new BottomNav()
