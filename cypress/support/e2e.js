import 'cypress-mochawesome-reporter/register'
import './commands'

const { register: registerCypressGrep } = require('@cypress/grep')
registerCypressGrep()

// Error JavaScript dari script pihak ketiga (analytics, widget, dll.) tidak
// boleh menggagalkan test fungsional. Error tetap dicatat di log Cypress.
Cypress.on('uncaught:exception', (err) => {
  Cypress.log({ name: 'uncaught', message: err.message })
  return false
})

// Pengaman production: SEMUA request tulis (POST/PUT/PATCH/DELETE) dari
// halaman diblokir & dibalas stub, sehingga test tidak pernah mengirim data
// (transaksi, form, tracking) ke server mana pun.
beforeEach(() => {
  cy.intercept({ method: /^(POST|PUT|PATCH|DELETE)$/, url: '**' }, (req) => {
    req.reply({ statusCode: 204, body: '' })
  }).as('blockedWriteRequest')
})
