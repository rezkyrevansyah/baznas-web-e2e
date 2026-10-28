# CLAUDE.md – baznas-web-e2e

Test automation E2E Cypress untuk website publik BAZNAS RI (https://baznas.go.id) dan form pembayaran https://bayarzakat.baznas.go.id/bayarzakat. Ini deliverable kerja QA yang dipublikasikan di repo GitHub publik.

**Panduan kerja lengkap ada di `PANDUAN-LANJUTAN.md`.** Bagian 3 berisi aturan, selector, dan Definition of Done. Bagian 4 berisi daftar test case yang belum diotomasi. Baca file itu sebelum mengerjakan tugas apa pun.

## Aturan wajib

- **Production safety:** jangan pernah mengirim data ke server (form, transaksi, newsletter, konfirmasi).
  - Blocker request tulis di `cypress/support/e2e.ts` tidak boleh dihapus atau dilemahkan.
  - Alur bayar zakat berhenti paling jauh di `#next-button` ("Pilih Pembayaran"). Jangan klik `#pay-button` atau tombol pembayaran lain.
  - Captcha tidak boleh di-bypass.
- **Konten repo:** jangan menulis bahwa project ini adalah portfolio, latihan, atau demo. Jangan menyertakan data pribadi atau kredensial.
- **Bahasa Indonesia** untuk README, dokumen, komentar, dan judul test.
- **Test plan adalah sumber kebenaran:** `docs/Test_Plan_Cypress_BAZNAS.xlsx`. Judul test `'<TC-ID> | <judul>'` harus cocok dengan sheet Test Case.
- **Bug website:** pertahankan expected result yang benar, beri tag `@known-bug` dan komentar `// Temuan F-xx`, lalu catat di sheet Temuan Eksplorasi. ID temuan baru dimulai dari F-21.
- **Jangan menebak selector.** Verifikasi dari HTML asli (`curl -sL <url>`) atau Cypress App.
- Minta konfirmasi pengguna sebelum `git push` atau menghapus file.

## Perintah

```bash
npm ci                         # install
npm run cy:open                # Cypress App
npm test                       # semua kecuali @known-bug
npm run test:smoke             # smoke
npm run test:p1                # P1 kecuali @known-bug
npm run test:known-bug         # hanya known-bug
npm run typecheck              # cek tipe TypeScript (wajib bersih sebelum commit)
npx cypress run --spec cypress/e2e/<file>.cy.ts
```

## Catatan teknis

- Cypress 16: gunakan `--expose` / `Cypress.expose()`, bukan `--env`.
- `@cypress/grep` v7: `{ tags: [...] }`. Filter negatif tidak kompatibel dengan `grepFilterSpecs`.
- `bayarzakat.baznas.go.id` adalah origin berbeda. Navigasi lewat klik dari `baznas.go.id` membutuhkan `cy.origin()`; `cy.visit` langsung ke subdomain tidak membutuhkannya.
- Struktur kode (TypeScript, `strict`):
  - Page Object di `cypress/pages`, diekspor sebagai instance
  - Nilai acuan (nisab, tarif, opsi, pesan) di `cypress/fixtures`, dipakai lewat `import x from '../fixtures/x.json'`
  - Helper di `cypress/support/commands.ts`; custom command baru wajib ditambahkan ke deklarasi `Cypress.Chainable` di file yang sama
- Shell ekstensi VS Code mewarisi `ELECTRON_RUN_AS_NODE=1` sehingga Cypress gagal start ("bad option: --smoke-test"). Hapus variabel itu sebelum menjalankan Cypress.
- Commit memakai conventional commits (`test:`, `fix(test):`, `docs:`, `chore:`).
