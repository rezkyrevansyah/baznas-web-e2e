/**
 * Halaman /kalkulatorzakat. Jenis PENGHASILAN ada di form#form_penghasilan;
 * jenis lain (perusahaan, perdagangan, emas) memakai selector di `sel`.
 */
export const sel = {
  // Perusahaan – tab Jasa
  pendapatanSebelumPajak: '#pdp_pre_pajak',
  zakatPerusahaanJasa: 'input[name="zakper_jasa"]',
  hasilPerusahaanJasa: '.total_zakper_jasa',
  // Perusahaan – tab Dagang/Industri
  tabDagangIndustri: '#custom-tabs-three-profile-tab',
  aktivaLancar: 'input[name="zakper_aktiva"]',
  pasivaLancar: 'input[name="zakper_pasiva"]',
  jumlahAktivaBersih: 'input[name="jml_omset"]',
  zakatPerusahaanNiaga: '#jml_zakper_niaga',
  hasilPerusahaanNiaga: '.total_zakper_niaga',
  // Perdagangan
  asetLancar: '#aset_lancar',
  laba: '#laba',
  jumlahAset: '#jumlah_aset',
  nisabPerdagangan: '#haul_nishab',
  zakatPerdagangan: '#jml_zak_per',
  hasilPerdagangan: '.zakat_perdagangan',
  belumNisabPerdagangan: '.nishab_zak',
  // Emas
  jumlahEmas: '#txt_emas',
  hargaEmas: '#harga_emas',
  zakatEmas: 'input#jml_zak_ms',
  hasilEmas: 'div.jml_zak_ms',
  belumNisabEmas: '.info_nishab',
}

class KalkulatorZakatPage {
  visit() {
    cy.visit('/kalkulatorzakat')
    this.form().should('be.visible')
  }

  jenisZakat() {
    return cy.get('select[name="calculator_type"]')
  }

  pilihJenis(value: string) {
    this.jenisZakat().select(value)
    this.section(value).should('be.visible')
  }

  /** Kontainer per jenis zakat: #penghasilan, #perusahaan, #perdagangan, #emas_perak. */
  section(jenis: string) {
    return cy.get(`#${jenis}`)
  }

  get(key: keyof typeof sel) {
    return cy.get(sel[key])
  }

  /** Klik tombol berdasarkan fungsi onclick-nya, mis. 'hitungZakEmas'. */
  klikTombol(fungsi: string) {
    cy.get(`button[onclick^="${fungsi}("]`).should('be.visible').click()
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
