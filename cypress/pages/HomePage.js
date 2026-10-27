class HomePage {
  visit() {
    cy.visit('/')
  }

  logo() {
    return cy.get('img.brand-image').first()
  }

  zisCards() {
    return cy.get('.card.card-homepage')
  }

  detailLink(path) {
    return cy.get(`a.detail-card[href$="${path}"]`)
  }
}

export default new HomePage()
