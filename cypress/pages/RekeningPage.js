class RekeningPage {
  visit() {
    cy.visit('/rekening')
  }

  jenisDana() {
    return cy.get('select#account_type')
  }

  tabel(jenis) {
    return cy.get(`table#${jenis}`)
  }

  barisRekening(jenis) {
    return this.tabel(jenis).find('tbody tr')
  }
}

export default new RekeningPage()
