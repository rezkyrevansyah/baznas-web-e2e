class KonfirmasiZisPage {
  visit() {
    cy.visit('/konfirmasi-zis')
  }

  heading() {
    return cy.get('h2').first()
  }

  tombolKonfirmasi() {
    return cy.get('a.btn-whatsapp')
  }
}

export default new KonfirmasiZisPage()
