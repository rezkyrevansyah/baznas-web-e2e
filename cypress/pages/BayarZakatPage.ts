/**
 * Selector form bayar zakat (https://bayarzakat.baznas.go.id/bayarzakat).
 *
 * Catatan: domain bayarzakat.baznas.go.id berbeda origin dengan baznas.go.id.
 * Spec yang langsung cy.visit() ke URL ini tidak perlu cy.origin(), tetapi
 * navigasi dari baznas.go.id (klik tombol) membutuhkan cy.origin().
 */
export const sel = {
  jenisDana: '#type_of_fund',
  subJenis: '#jenis',
  jumlahHari: '#hariid',
  nominal: '#nominal',
  nominalError: 'label#nominal-error',
  nama: '#name',
  namaError: 'label#name-error',
  sapaan: 'input[name="user_title"]',
  handphone: '#handphone',
  handphoneError: 'label#handphone-error',
  email: '#email',
  emailError: 'label#email-error',
  persetujuan: '#cookies',
  tombolPilihPembayaran: '#next-button',
  tombolBayar: '#pay-button',
  metode: 'input[name="metode"]',
}

class BayarZakatPage {
  visit(url: string) {
    cy.visit(url)
    cy.get(sel.jenisDana).should('be.visible')
  }

  get(key: keyof typeof sel) {
    return cy.get(sel[key])
  }

  /**
   * Stub endpoint data muzaki agar tidak ada data yang terkirim ke server.
   * (Lapisan pengaman tambahan di atas blocker global di support/e2e.ts.)
   */
  stubSubmitCustomer() {
    cy.intercept('POST', '**/pembayaran/submit_customer', { statusCode: 200, body: {} }).as('submitCustomer')
  }

  pilihJenisDana(value: string) {
    this.get('jenisDana').select(value)
  }

  isiNominal(value: number | string) {
    this.get('nominal').clear().type(String(value))
  }

  klikPilihPembayaran() {
    this.get('tombolPilihPembayaran').should('be.visible').click()
  }

  /** Halaman tidak berpindah ke langkah pemilihan metode pembayaran. */
  assertTetapDiFormulir() {
    this.get('tombolBayar').should('not.be.visible')
    this.get('tombolPilihPembayaran').should('be.visible')
  }
}

export default new BayarZakatPage()
