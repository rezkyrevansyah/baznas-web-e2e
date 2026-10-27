/**
 * Pemeriksaan broken link. Request dikirim berurutan dengan jeda (lihat
 * assertNoBrokenLinks) agar tidak membebani server.
 */
const BASE = 'https://baznas.go.id'

const collectInternalLinks = (selector: string) =>
  cy.get<HTMLAnchorElement>(selector).then(($links) => {
    const urls = [...$links]
      .map((a) => a.href)
      .filter((href) => href.startsWith(BASE))
      .map((href) => href.split('#')[0])
      .filter((href) => href && href !== `${BASE}/`)
    return [...new Set(urls)]
  })

describe('Integritas Link', () => {
  it('TC-LINK-001 | Tidak ada broken link internal di homepage', { tags: ['@regression', '@P1', '@links'] }, () => {
    cy.visit('/')
    collectInternalLinks('a[href]').then((urls) => {
      cy.log(`Memeriksa ${urls.length} link internal`)
      expect(urls.length, 'jumlah link internal').to.be.greaterThan(10)
      cy.assertNoBrokenLinks(urls)
    })
  })

  it('TC-LINK-002 | Tidak ada broken link pada menu navigasi', { tags: ['@regression', '@P1', '@links'] }, () => {
    cy.visit('/')
    collectInternalLinks('ul.nav-sidebar a[href]').then((urls) => {
      cy.log(`Memeriksa ${urls.length} link menu`)
      expect(urls.length, 'jumlah link menu').to.be.greaterThan(20)
      cy.assertNoBrokenLinks(urls)
    })
  })
})
