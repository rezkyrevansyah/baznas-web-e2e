class HomePage {
  visit() {
    cy.visit('/')
  }

  logo() {
    return cy.get<HTMLImageElement>('img.brand-image').first()
  }

  zisCards() {
    return cy.get('.card.card-homepage')
  }

  detailLink(path: string) {
    return cy.get(`a.detail-card[href$="${path}"]`)
  }
}

export default new HomePage()
