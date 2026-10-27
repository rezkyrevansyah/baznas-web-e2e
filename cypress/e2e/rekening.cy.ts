import rekening from '../pages/RekeningPage'
import rek from '../fixtures/rekening.json'

describe('Rekening Zakat', () => {
  it('TC-REK-001 | Halaman rekening dapat diakses', { tags: ['@smoke', '@P1'] }, () => {
    cy.request('/rekening').its('status').should('eq', 200)
    rekening.visit()
    cy.title().should('contain', 'Rekening Zakat BAZNAS')
    cy.contains('Daftar Rekening').should('be.visible')
  })

  it('TC-REK-002 | Daftar rekening bank tampil lengkap', { tags: ['@regression', '@P1'] }, () => {
    rekening.visit()

    // Pilihan jenis dana lengkap
    rekening.jenisDana().find('option').then(($opts) => {
      expect([...$opts].map((o) => (o as HTMLOptionElement).value)).to.deep.eq(rek.jenisDana)
    })

    // Tabel zakat (default) berisi rekening lengkap
    rekening.tabel('zakat').should('be.visible')
    rekening.barisRekening('zakat').should('have.length.at.least', rek.minimalRekeningZakat)
    rekening.tabel('zakat').should('contain.text', rek.contohRekeningZakat)

    // Setiap baris: logo bank, nomor rekening, tombol salin
    rekening.barisRekening('zakat').each(($tr) => {
      cy.wrap($tr).find('img').should('have.length.at.least', 1)
      cy.wrap($tr).find('td').eq(2).invoke('text').should('match', /\d[\d.]{5,}/)
      cy.wrap($tr).contains(/salin/i).should('have.attr', 'onclick').and('match', /copyLink\('\d+'\)/)
    })

    // Setiap jenis dana menampilkan tabel rekening yang tidak kosong
    rek.jenisDana.forEach((jenis) => {
      rekening.jenisDana().select(jenis)
      rekening.tabel(jenis).should('be.visible')
      rekening.barisRekening(jenis).should('have.length.at.least', 1)
    })
  })
})
