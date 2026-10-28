class JemputZakatPage {
  visit() {
    cy.visit('/form-jemput-zakat')
    this.form().should('be.visible')
  }

  form() {
    return cy.get<HTMLFormElement>('form#formjemputzakat')
  }

  field(name: string) {
    return this.form().find<HTMLInputElement>(`[name="${name}"]`)
  }

  submitButton() {
    return cy.get('#btn-submit-data')
  }

  captchaImage() {
    return cy.get<HTMLImageElement>('img#captchaimg')
  }

  refreshCaptchaLink() {
    return cy.get('a[href*="refreshCaptcha"]')
  }

  /** true jika form valid menurut constraint validation browser. */
  isValid() {
    return this.form().then(($form) => $form[0].checkValidity())
  }
}

export default new JemputZakatPage()
