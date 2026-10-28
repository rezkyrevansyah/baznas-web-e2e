import konfirmasi from '../pages/KonfirmasiZisPage'
import data from '../fixtures/konfirmasi-zis.json'

describe('Konfirmasi ZIS', () => {
  beforeEach(() => {
    konfirmasi.visit()
  })

  // Temuan F-02: heading tertulis "INFOMASI UNTUK MUZAKI" (kurang huruf R).
  it('TC-KONF-001 | Halaman konfirmasi ZIS tampil', { tags: ['@regression', '@P2', '@known-bug'] }, () => {
    konfirmasi.heading().should('be.visible').and('have.text', data.heading)
    konfirmasi.tombolKonfirmasi().should('be.visible').and('contain.text', data.tombol)
  })

  it("TC-KONF-002 | Tombol 'Konfirmasi Sekarang' mengarah ke form konfirmasi", { tags: ['@regression', '@P2'] }, () => {
    konfirmasi.tombolKonfirmasi()
      .should('have.attr', 'href', data.urlKonfirmasi)
      .and('have.attr', 'target', '_blank')
    // Hanya cek respons tautan (redirect ke WhatsApp), tidak membuka situs pihak ketiga.
    cy.request({ url: data.urlKonfirmasi, followRedirect: false, failOnStatusCode: false })
      .its('status')
      .should('be.within', 200, 399)
  })
})
