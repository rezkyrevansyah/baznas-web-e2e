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
  // Layar Metode Pembayaran (#nextstep)
  logoMetode: '#nextstep img.bankimg, #nextstep img[id$="imgid"]',
  metodeBank: '#nextstep input.bank',
  ikonMetodeNonaktif: '#nextstep img.bankdisabledid',
  // Tab "Kalkulator" (#tab2)
  tabKalkulator: '#tab2',
  opsiZakatPenghasilan: '#opt-zakat-penghasilan',
  opsiZakatMaal: '#opt-zakat-maal',
  calcPendapatan: '#pendapatan',
  calcLainnya: '#lainnya',
  calcHasilPenghasilan: '#valuepenghasilan',
  calcTotalPenghasilan: '#totalpendapatanlabel',
  calcBayarPenghasilan: '#bayarpenghasilan',
  calcEmasPerak: '#emasperak',
  calcTabungan: '#tabungan',
  calcKendaraan: '#kendaraan',
  calcHutang: '#hutang',
  calcHasilMaal: '#valuemaal',
  calcTotalMaal: '#jumlahmaallabel',
  calcBayarMaal: '#bayarmaal',
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

  bukaTabKalkulator() {
    cy.contains('button.tablinks', 'Kalkulator').click()
    this.get('tabKalkulator').should('be.visible')
  }

  /** Isi field kalkulator (default "0") lalu biarkan formatter halaman berjalan. */
  isiKalkulator(key: keyof typeof sel, value: number) {
    this.get(key).clear().type(String(value))
  }

  /** Klik tombol kalkulator berdasarkan fungsi onclick-nya, mis. 'hitungmaal'. */
  klikKalkulator(fungsi: string) {
    this.get('tabKalkulator').find(`button[onclick^="${fungsi}("]`).filter(':visible').click()
  }

  /** Halaman tidak berpindah ke langkah pemilihan metode pembayaran. */
  assertTetapDiFormulir() {
    this.get('tombolBayar').should('not.be.visible')
    this.get('tombolPilihPembayaran').should('be.visible')
  }
}

export default new BayarZakatPage()
