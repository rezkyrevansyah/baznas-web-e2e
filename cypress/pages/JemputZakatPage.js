class JemputZakatPage {
  visit() {
    cy.visit('/form-jemput-zakat')
    this.form().should('be.visible')
  }

  form() {
    return cy.get('form#formjemputzakat')
  }

  field(name) {
    return this.form().find(`[name="${name}"]`)
  }

  submitButton() {
    return cy.get('#btn-submit-data')
  }

  /** true jika form valid menurut constraint validation browser. */
  isValid() {
    return this.form().then(($form) => $form[0].checkValidity())
  }
}

export default new JemputZakatPage()
