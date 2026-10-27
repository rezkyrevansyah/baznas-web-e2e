/**
 * Halaman /kalkulatorzakat – fokus pada jenis PENGHASILAN (form#form_penghasilan).
 */
class KalkulatorZakatPage {
  visit() {
    cy.visit('/kalkulatorzakat')
    this.form().should('be.visible')
  }

  jenisZakat() {
    return cy.get('select[name="calculator_type"]')
  }

  form() {
    return cy.get('form#form_penghasilan')
  }

  field(name: string) {
    return cy.get(`form#form_penghasilan input[name="${name}"]`)
  }

  gaji() {
    return this.field('pendapatan_perbulan')
  }

  penghasilanLain() {
    return this.field('pendapatan_lain')
  }

  jumlahPenghasilan() {
    return this.field('jumlah_penghasilan')
  }

  nisabPerTahun() {
    return this.field('txt_nishab_pertahun')
  }

  nisabPerBulan() {
    return this.field('txt_nishab')
  }

  totalZakat() {
    return this.field('total_zakat')
  }

  button(text: string) {
    return this.form().contains('button', text)
  }

  hitung() {
    this.button('Hitung Zakat').should('be.visible').click()
  }

  reset() {
    this.button('Reset').should('be.visible').click()
  }

  pesanBelumNisab() {
    return this.form().find('.under_nishab')
  }

  hasilZakat() {
    return this.form().find('.zakat_penghasilan')
  }

  isiPenghasilan(gaji: number, lain = 0) {
    this.gaji().typeNominal(gaji)
    this.penghasilanLain().typeNominal(lain)
  }
}

export default new KalkulatorZakatPage()
