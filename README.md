# BAZNAS Web E2E

[![E2E Tests](https://github.com/<username>/baznas-web-e2e/actions/workflows/e2e.yml/badge.svg)](https://github.com/<username>/baznas-web-e2e/actions/workflows/e2e.yml)

Test automation end-to-end (E2E) dengan **Cypress** untuk website publik **BAZNAS RI** – [baznas.go.id](https://baznas.go.id), termasuk form pembayaran ZIS di [bayarzakat.baznas.go.id](https://bayarzakat.baznas.go.id/bayarzakat).

Suite ini adalah regression test dan monitoring harian. Fokusnya pada fitur yang paling sering dipakai muzaki: navigasi, kalkulator zakat, form bayar zakat, form jemput zakat, informasi rekening, dan integritas link.

---

## Daftar Isi

- [Cakupan Pengujian](#cakupan-pengujian)
- [Prinsip Pengujian di Production](#prinsip-pengujian-di-production)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Instalasi](#instalasi)
- [Menjalankan Test](#menjalankan-test)
- [Tag Test](#tag-test)
- [Daftar Test Case (Fase 1)](#daftar-test-case-fase-1)
- [Known Issues](#known-issues)
- [Report & CI/CD](#report--cicd)
- [Pemeliharaan Data Uji](#pemeliharaan-data-uji)
- [Roadmap](#roadmap)

---

## Cakupan Pengujian

Test plan lengkap ada di [`docs/Test_Plan_Cypress_BAZNAS.xlsx`](docs/Test_Plan_Cypress_BAZNAS.xlsx) dan berisi:

| Item | Jumlah |
|---|---|
| Modul | 22 |
| Test scenario | 34 |
| Test case | 112 |
| Diotomasi (Fase 1: P1 + smoke) | 41 test case |

Modul yang sudah diotomasi pada Fase 1:

| Modul | Halaman | Spec |
|---|---|---|
| Homepage | `/` | `home.cy.ts` |
| Header & menu navigasi | Menu hamburger | `navigation.cy.ts` |
| Bottom navigation | Quick menu bawah | `bottom-nav.cy.ts` |
| Kalkulator zakat | `/kalkulatorzakat` | `kalkulator-zakat.cy.ts` |
| Form bayar zakat | `bayarzakat.baznas.go.id/bayarzakat` | `bayar-zakat.cy.ts` |
| Form jemput zakat | `/form-jemput-zakat` | `jemput-zakat.cy.ts` |
| Rekening zakat | `/rekening` | `rekening.cy.ts` |
| Integritas link | Homepage & menu | `broken-links.cy.ts` |

**Di luar cakupan:** transaksi pembayaran nyata, penyelesaian captcha, load/stress test, security test, serta isi situs pihak ketiga (PPID, bazn.as, media sosial). Untuk situs pihak ketiga, yang dicek hanya ketersediaan link-nya.

## Prinsip Pengujian di Production

Website yang diuji adalah sistem production yang menerima donasi. Karena itu suite ini mengikuti aturan berikut:

1. **Tidak ada data yang terkirim.** Semua request tulis (`POST/PUT/PATCH/DELETE`) dari halaman diblokir oleh `cy.intercept` global di `cypress/support/e2e.ts`. Endpoint sensitif seperti `submit_customer` dan `submit_jemput_zakat` juga di-stub di masing-masing spec.
2. **Tidak ada transaksi.** Alur pembayaran berhenti sebelum metode pembayaran diproses.
3. **Data dummy.** Semua input memakai data uji di `cypress/fixtures`, bukan data pribadi asli.
4. **Beban minimal.** Test dijalankan saat push dan satu kali sehari. Pemeriksaan link memakai jeda antar request.

## Tech Stack

- [Cypress](https://www.cypress.io/) 16 (TypeScript)
- Page Object Model (`cypress/pages`)
- [@cypress/grep](https://github.com/cypress-io/cypress/tree/develop/npm/grep) untuk menjalankan test berdasarkan tag
- [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter) untuk report HTML
- GitHub Actions untuk CI dan jadwal harian

## Struktur Project

```
baznas-web-e2e/
├── .github/workflows/e2e.yml      # CI: push, PR, jadwal harian, manual
├── cypress/
│   ├── e2e/                       # Spec test per modul
│   │   ├── home.cy.ts
│   │   ├── navigation.cy.ts
│   │   ├── bottom-nav.cy.ts
│   │   ├── kalkulator-zakat.cy.ts
│   │   ├── bayar-zakat.cy.ts
│   │   ├── jemput-zakat.cy.ts
│   │   ├── rekening.cy.ts
│   │   └── broken-links.cy.ts
│   ├── fixtures/                  # Data uji & nilai acuan (nisab, fidyah, menu, dll.)
│   ├── pages/                     # Page Object
│   └── support/
│       ├── commands.ts            # Custom command & helper
│       ├── e2e.ts                 # Setup global (grep, reporter, blocker request tulis)
│       └── types.d.ts             # Deklarasi tipe untuk plugin tanpa types
├── docs/
│   └── Test_Plan_Cypress_BAZNAS.xlsx
├── cypress.config.ts
├── tsconfig.json
└── package.json
```

## Instalasi

Prasyarat: Node.js 20 atau lebih baru.

```bash
git clone https://github.com/<username>/baznas-web-e2e.git
cd baznas-web-e2e
npm ci
```

## Menjalankan Test

| Perintah | Keterangan |
|---|---|
| `npm run cy:open` | Membuka Cypress App (mode interaktif) |
| `npm test` | Menjalankan semua test kecuali `@known-bug` |
| `npm run test:smoke` | Hanya smoke test |
| `npm run test:p1` | Semua test prioritas P1 kecuali `@known-bug` |
| `npm run test:known-bug` | Hanya test untuk bug yang sudah diketahui |
| `npm run test:links` | Hanya pemeriksaan broken link |
| `npm run test:spec -- cypress/e2e/kalkulator-zakat.cy.ts` | Menjalankan satu spec |
| `npm run test:chrome` | Menjalankan di browser Chrome |
| `npm run typecheck` | Cek tipe TypeScript tanpa menjalankan test |

## Tag Test

Setiap test diberi ID sesuai test plan, misalnya `TC-CALC-003 | ...`, dan tag berikut:

| Tag | Arti |
|---|---|
| `@smoke` | Cek cepat fungsi utama |
| `@regression` | Regression lengkap |
| `@P1` | Prioritas kritikal |
| `@negative` / `@boundary` | Negative test dan boundary value |
| `@links` | Pemeriksaan link |
| `@known-bug` | Test untuk bug yang sudah ditemukan. Tidak dijalankan secara default agar pipeline tetap hijau, tetapi bug tetap terdokumentasi dan bisa diverifikasi setelah perbaikan |

## Daftar Test Case (Fase 1)

| ID | Test Case | Tag |
|---|---|---|
| TC-HOME-001 | Homepage berhasil dimuat | smoke |
| TC-HOME-002 | Logo BAZNAS tampil dan mengarah ke beranda | smoke |
| TC-HOME-004 | Kartu Zakat, Infak, Sedekah, Fidyah tampil | smoke |
| TC-HOME-005 | Tombol "Selengkapnya" mengarah ke halaman yang benar | regression |
| TC-NAV-001 | Menu hamburger dapat dibuka dan ditutup | smoke |
| TC-NAV-002 | Sub-menu dapat di-expand | regression |
| TC-NAV-003..005 | Sub-menu Tentang BAZNAS, Zakat, Layanan mengarah ke halaman benar | regression |
| TC-BNAV-001 | Quick menu bawah tampil di halaman utama | smoke |
| TC-BNAV-002 | Tombol "Bayar Zakat" membuka form pembayaran | smoke |
| TC-BNAV-003 | Link PPID, Layanan Mustahik, Konfirmasi, Transfer valid | regression |
| TC-CALC-001 | Nilai nisab sesuai ketetapan | smoke |
| TC-CALC-002 | Jumlah penghasilan = gaji + penghasilan lain | regression |
| TC-CALC-003 | Penghasilan di atas nisab menghasilkan zakat 2,5% | smoke |
| TC-CALC-004 | Penghasilan di bawah nisab tidak wajib zakat | regression |
| TC-CALC-005 / 006 | Boundary tepat nisab dan 1 rupiah di bawah nisab | boundary |
| TC-CALC-007 | Gabungan gaji + lain-lain melewati nisab | regression |
| TC-CALC-009 | Input huruf ditolak | negative |
| TC-CALC-013 | Tombol Reset mengosongkan input dan hasil | regression |
| TC-CALC-014 | Hasil diperbarui saat input diubah setelah Hitung | known-bug |
| TC-CALC-015a / 015b | Bayar Zakat dari kalkulator ke form pembayaran (015b: known-bug) | regression |
| TC-PAY-001 | Form bayar zakat dapat diakses | smoke |
| TC-PAY-002 / 003 | Pilihan jenis dana dan sub-jenis zakat | regression |
| TC-PAY-007 / 008 | Perhitungan nominal fidyah otomatis | regression |
| TC-PAY-010 | Field data muzaki tampil | regression |
| TC-PAY-011 | Nominal kosong tidak bisa diproses | negative |
| TC-PAY-012..014 | Validasi nama, email, nomor HP | known-bug |
| TC-PAY-017 | Daftar metode pembayaran lengkap | regression |
| TC-JMP-004 / 005 | Validasi field wajib dan format email | negative |
| TC-JMP-007 | Nominal di bawah minimum Rp1.000.000 | known-bug |
| TC-REK-001 / 002 | Halaman dan daftar rekening | smoke, regression |
| TC-LINK-001 / 002 | Tidak ada broken link di homepage dan menu | regression |

## Known Issues

Detail lengkap ada di sheet **Temuan Eksplorasi** pada test plan. Temuan yang memiliki test otomatis bertag `@known-bug`:

| ID | Ringkasan | Test |
|---|---|---|
| F-01 | Hasil kalkulator tidak dihitung ulang saat input diubah setelah klik Hitung | TC-CALC-014 |
| F-12 | Jenis dana dan nominal dari kalkulator tidak terbawa ke form pembayaran | TC-CALC-015b |
| F-14 | Form bayar zakat lanjut ke metode pembayaran walaupun data muzaki kosong/tidak valid | TC-PAY-012..014 |
| F-15 | Tidak ada validasi nominal minimum pada form jemput zakat di sisi klien | TC-JMP-007 |

Setelah perbaikan dirilis, jalankan `npm run test:known-bug`. Test yang sudah lulus bisa dilepas dari tag `@known-bug`.

## Report & CI/CD

- **Report lokal:** `cypress/reports/index.html` (Mochawesome, dengan screenshot saat gagal).
- **GitHub Actions** (`.github/workflows/e2e.yml`) berjalan saat:
  - push dan pull request ke `main`
  - terjadwal setiap hari pukul 08.00 WIB
  - manual lewat *Run workflow*, dengan input tag (contoh: `@smoke`)
- Report HTML dan screenshot diunggah sebagai artifact di setiap run.

## Pemeliharaan Data Uji

Nilai yang bisa berubah karena kebijakan disimpan di fixture, jadi cukup diperbarui di satu tempat:

| File | Isi |
|---|---|
| `fixtures/zakat.json` | Nisab per tahun/bulan (SK Ketua BAZNAS), tarif zakat, tarif fidyah |
| `fixtures/bayar-zakat.json` | Jenis dana, sub-jenis, metode pembayaran, pesan validasi |
| `fixtures/menu.json` | Struktur menu dan URL tujuan |
| `fixtures/navigation.json` | Kartu homepage dan quick menu |
| `fixtures/rekening.json` | Jenis dana rekening dan contoh nomor rekening |
| `fixtures/jemput-zakat.json` | Field wajib dan minimal nominal jemput zakat |

## Roadmap

- **Fase 1 (selesai):** test P1 dan smoke, Page Object, report, CI.
- **Fase 2:** test P2/P3, yaitu kalkulator perusahaan/perdagangan/emas, multi-bahasa, berita, laporan PDF, profil, program, responsive, SEO, aksesibilitas (`cypress-axe`), dan performa dasar.
