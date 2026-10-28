/**
 * Form "Dapatkan Update Berita" (Mailchimp) di bagian bawah halaman.
 *
 * Form memakai target="_blank" dan validasi mc-validate.js. Sebelum tombol
 * subscribe diklik, `amankan()` men-stub semua request ke Mailchimp dan
 * mencegah submit native, sehingga tidak ada email yang terdaftar.
 */
class NewsletterForm {
  form() {
    return cy.get<HTMLFormElement>('form#mc-embedded-subscribe-form')
  }

  email() {
    return cy.get<HTMLInputElement>('#mce-EMAIL')
  }

  tombolSubscribe() {
    return cy.get('#mc-embedded-subscribe')
  }

  amankan() {
    cy.intercept('**list-manage.com/**', { statusCode: 200, body: '' }).as('mailchimp')
    this.form().then(($form) => {
      $form[0].addEventListener('submit', (e) => e.preventDefault(), true)
    })
  }

  /** Pesan error inline yang dibuat mc-validate.js. */
  pesanError() {
    return this.form().find('.mce_inline_error')
  }
}

export default new NewsletterForm()
