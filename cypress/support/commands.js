/**
 * Mengubah teks nominal format Indonesia ("1.250.000" / "Rp 250.000") menjadi number.
 */
export const toNumber = (text) => Number(String(text).replace(/[^0-9]/g, '')) || 0

/**
 * Memformat number menjadi format ribuan Indonesia: 250000 -> "250.000".
 */
export const formatRibuan = (num) => String(num).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/**
 * Mengetik nominal ke field ber-mask: kosongkan dulu lalu ketik angka.
 */
Cypress.Commands.add('typeNominal', { prevSubject: 'element' }, (subject, value) => {
  cy.wrap(subject).clear().type(String(value))
  // trigger blur agar handler keyup/change halaman dijalankan
  return cy.wrap(subject).blur()
})

/**
 * Request sebuah URL (tanpa membuka di browser) dan kembalikan status code.
 * failOnStatusCode=false supaya status 4xx/5xx bisa di-assert dan dilaporkan.
 */
Cypress.Commands.add('checkUrlStatus', (url) => {
  return cy
    .request({ url, failOnStatusCode: false, followRedirect: true, timeout: 30000 })
    .then((res) => ({ url, status: res.status }))
})

/**
 * Cek sekumpulan URL dan gagal dengan daftar URL rusak (status >= 400).
 * Diberi jeda antar request supaya tidak membebani server.
 */
Cypress.Commands.add('assertNoBrokenLinks', (urls, { delayMs = 300 } = {}) => {
  const broken = []
  cy.wrap(urls, { log: false }).each((url) => {
    cy.checkUrlStatus(url).then(({ status }) => {
      if (status >= 400) broken.push(`${status} ${url}`)
    })
    cy.wait(delayMs, { log: false })
  })
  cy.then(() => {
    expect(broken, `Broken link (${broken.length}):\n${broken.join('\n')}`).to.be.empty
  })
})
