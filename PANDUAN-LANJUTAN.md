# Panduan Melanjutkan Project `baznas-web-e2e`

Panduan ini dipakai bersama **Claude Code di VS Code** untuk menyelesaikan seluruh project, dari stabilisasi Fase 1 sampai semua 112 test case diotomasi dan siap diserahkan.

Dokumen ini dibagi menjadi 4 bagian:

| Bagian | Untuk siapa | Isi |
|---|---|---|
| [Bagian 1](#bagian-1--persiapan-klik-demi-klik) | Kamu | Persiapan software dan VS Code, langkah demi langkah |
| [Bagian 2](#bagian-2--alur-kerja-per-sesi-prompt-siap-pakai) | Kamu | Urutan sesi kerja beserta prompt yang tinggal di-copy ke Claude |
| [Bagian 3](#bagian-3--konteks--aturan-untuk-claude) | Claude | Konteks project, aturan wajib, pengetahuan selector, definition of done |
| [Bagian 4](#bagian-4--daftar-test-case-yang-belum-diotomasi) | Claude | Daftar lengkap 71 test case yang belum diotomasi |

---

## Status Saat Ini

| Item | Status |
|---|---|
| Test plan (22 modul, 34 skenario, 112 test case) | Selesai, ada di `docs/Test_Plan_Cypress_BAZNAS.xlsx` |
| Struktur project, Page Object, fixtures, report, CI | Selesai (TypeScript `strict`) |
| Fase 1: 41 test case P1 + smoke (42 test, 8 spec) | **Stabil** (Sesi 1, 27 Okt 2026): `npm test` 39/39 hijau 2× berturut-turut; 3 test `@known-bug` gagal sesuai temuan F-01, F-12, F-15 |
| Fase 2: 71 test case P2/P3 | Belum dibuat (Batch A–D) |
| Finishing (lint, report online, notifikasi, laporan) | Belum |

> Pada Sesi 1, F-14 terverifikasi sudah diperbaiki di situs sehingga TC-PAY-012..014 tidak lagi bertag `@known-bug`. Jumlah test known-bug sekarang 3, bukan 6.

---

## Bagian 1 – Persiapan (klik demi klik)

Cukup dilakukan sekali.

### 1.1 Install software yang dibutuhkan

| Software | Cara cek sudah terinstall | Kalau belum |
|---|---|---|
| **Node.js 20+** | Buka terminal, ketik `node -v` → muncul `v20.x` atau lebih tinggi | Download versi **LTS** dari https://nodejs.org lalu install (Next → Next → Finish) |
| **Git** | `git --version` | Download dari https://git-scm.com, install dengan opsi default |
| **VS Code** | – | Download dari https://code.visualstudio.com |
| **Google Chrome** | – | Dipakai Cypress sebagai browser utama |
| **Python 3** (opsional) | `python --version` | Hanya dibutuhkan agar Claude bisa mengisi kolom Status di file Excel test plan secara otomatis |

Setelah install Node.js atau Git, **tutup lalu buka lagi** VS Code supaya terminal mengenalinya.

### 1.2 Siapkan folder project

1. Ekstrak `baznas-web-e2e.zip` ke folder kerja, misalnya `D:\Projects\baznas-web-e2e`.
2. Salin file panduan ini (`PANDUAN-LANJUTAN.md`) dan `CLAUDE.md` ke **folder root project**, sejajar dengan `package.json`. Jika keduanya sudah ada di dalam zip, lewati langkah ini.

Struktur akhirnya:

```
baznas-web-e2e/
├── CLAUDE.md               ← dibaca otomatis oleh Claude Code
├── PANDUAN-LANJUTAN.md     ← panduan ini
├── package.json
├── cypress/
└── docs/
```

### 1.3 Buka project di VS Code

1. Buka VS Code.
2. Klik menu **File → Open Folder…** (di Mac: **File → Open…**).
3. Pilih folder `baznas-web-e2e`, klik **Select Folder** / **Open**.
4. Jika muncul pop-up *"Do you trust the authors of the files in this folder?"*, klik **Yes, I trust the authors**.

### 1.4 Install dependency project

1. Klik menu **Terminal → New Terminal**. Terminal akan muncul di bagian bawah.
2. Ketik perintah berikut lalu tekan **Enter**:

   ```bash
   npm ci
   ```

3. Tunggu sampai selesai (pertama kali bisa 2–5 menit karena mengunduh Cypress).
4. Cek instalasi Cypress:

   ```bash
   npx cypress verify
   ```

   Hasil yang benar: `✔ Verified Cypress!`

### 1.5 Install ekstensi Claude Code

1. Klik ikon **Extensions** di sidebar kiri (ikon empat kotak), atau tekan `Ctrl+Shift+X` (Mac: `Cmd+Shift+X`).
2. Di kotak pencarian, ketik **Claude Code**.
3. Pilih ekstensi **Claude Code** dengan publisher **Anthropic** (pastikan publisher-nya benar).
4. Klik **Install**.

### 1.6 Buka panel Claude dan login

1. Buka salah satu file di project (misalnya `README.md`).
2. Klik **ikon Claude** (logo bintang/spark) di pojok kanan atas editor.
   Jika ikonnya tidak terlihat: tekan `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`), ketik **Claude Code**, lalu pilih perintah untuk membuka Claude Code.
3. Pada pertama kali, ikuti langkah **Sign in** di panel. Browser akan terbuka; login dengan akun Claude kamu, lalu kembali ke VS Code.
4. Panel chat Claude siap dipakai. Prompt diketik di kotak input bagian bawah panel.

> Tampilan ekstensi bisa sedikit berbeda antar versi. Kalau ada tombol yang tidak ditemukan, gunakan Command Palette (`Ctrl+Shift+P`) lalu ketik "Claude".

### 1.7 Cara menanggapi permintaan izin Claude

Saat bekerja, Claude akan meminta izin sebelum mengubah file atau menjalankan perintah terminal.

| Claude meminta | Yang perlu kamu lakukan |
|---|---|
| Mengedit / membuat file di project | Baca ringkasan perubahannya, klik **Accept** / **Yes** |
| Menjalankan `npx cypress run …`, `npm run …`, `git add`, `git commit` | Klik **Yes** (boleh pilih opsi "don't ask again" untuk perintah yang sama) |
| Menjalankan `curl https://baznas.go.id/...` (melihat HTML halaman) | Klik **Yes** – ini hanya membaca halaman publik |
| **`git push`**, menghapus file/folder, atau perintah di luar folder project | Baca dulu dengan teliti. Push hanya kalau memang sudah siap |
| Mengirim form / transaksi ke website asli | **Tolak.** Aturan project melarang ini (lihat Bagian 3) |

### 1.8 Tips pemakaian

- **Satu sesi = satu tujuan.** Ikuti urutan sesi di Bagian 2. Setelah satu sesi selesai dan sudah di-commit, mulai percakapan baru (tombol **New chat** / ikon `+` di panel Claude) agar konteks tetap bersih.
- **Lampirkan file atau error.** Ketik `@` di kotak prompt untuk memilih file (misalnya `@PANDUAN-LANJUTAN.md`), atau paste langsung pesan error dari terminal.
- **Lihat test berjalan secara visual.** Jalankan `npm run cy:open` di terminal → pilih **E2E Testing** → pilih **Chrome** → klik **Start E2E Testing in Chrome** → klik nama spec.
- **Lihat report.** Setelah `npm test`, buka `cypress/reports/index.html`. Di VS Code: klik kanan file → **Reveal in File Explorer**, lalu double-click file-nya untuk membuka di browser.

---

## Bagian 2 – Alur Kerja per Sesi (prompt siap pakai)

Kerjakan berurutan. Untuk setiap sesi: buka chat baru di panel Claude → copy prompt → paste → Enter → setujui izin seperlunya → cek hasilnya.

### Sesi 1 – Stabilisasi Fase 1 (wajib pertama)

**Tujuan:** 42 test Fase 1 berjalan di website asli. Semua test hijau, kecuali 6 test `@known-bug` yang memang harus gagal.

Prompt:

```text
Baca @CLAUDE.md dan @PANDUAN-LANJUTAN.md (Bagian 3) terlebih dahulu.

Tugas Sesi 1: stabilkan test Fase 1.
1. Jalankan `npm run test:smoke`, lalu `npm test`.
2. Untuk setiap test yang gagal, cari penyebabnya (selector, timeout, cy.origin, data).
   Periksa HTML halaman dengan `curl -sL <url>` bila perlu. Perbaiki di Page Object/fixture,
   jangan melonggarkan assertion yang benar.
3. Jika kegagalan ternyata bug website (bukan kesalahan test), JANGAN ubah expected result.
   Beri tag @known-bug, tambahkan komentar ID temuan, dan catat temuan baru di bagian
   "Temuan baru" pada laporan akhir sesi.
4. Jalankan `npm run test:known-bug` dan pastikan 6 test known-bug memang gagal karena bug
   yang didokumentasikan, bukan karena selector salah.
5. Ulangi `npm test` sampai hijau 2 kali berturut-turut (cek flaky).
6. Commit dengan pesan: "test: stabilize phase 1 against production site".
Akhiri dengan ringkasan: test yang diperbaiki, penyebabnya, dan temuan baru.
```

**Cek hasil:** `npm test` hijau dan report di `cypress/reports/index.html` terbuka normal.

### Sesi 2 – Push ke GitHub dan aktifkan CI

**Langkah manual (kamu):**
1. Buka https://github.com/new.
2. Isi **Repository name**: `baznas-web-e2e`. Pilih **Public**. **Jangan** centang "Add a README" (README sudah ada).
3. Klik **Create repository** dan salin URL repo (contoh `https://github.com/<username>/baznas-web-e2e.git`).
4. Sebelum push, putuskan dengan atasan apakah bagian **Known Issues** di README boleh tampil di repo publik.

Prompt:

```text
Baca @CLAUDE.md. Tugas Sesi 2: siapkan repo untuk dipublikasikan.
URL repo GitHub saya: <PASTE URL REPO DI SINI>
Username GitHub saya: <USERNAME>
Keputusan Known Issues di README: <TETAP DITAMPILKAN / HAPUS DARI README>

1. Ganti semua placeholder <username> di README.md.
2. Terapkan keputusan Known Issues di atas (jika dihapus, ganti dengan kalimat bahwa temuan
   didokumentasikan di test plan internal, dan hapus juga ringkasan temuan dari README).
3. Periksa seluruh repo: tidak boleh ada kata "portfolio", data pribadi, token, atau
   kredensial. Laporkan hasilnya.
4. Tambahkan remote origin, commit perubahan, lalu tampilkan perintah `git push -u origin main`
   tetapi minta konfirmasi saya dulu sebelum menjalankannya.
```

**Setelah push (kamu):**
1. Buka repo di GitHub → klik tab **Actions**.
2. Jika muncul tombol *"I understand my workflows, go ahead and enable them"*, klik tombol tersebut.
3. Klik workflow **E2E Tests** → tunggu run selesai (ikon hijau ✓ atau merah ✗).
4. Untuk melihat report: klik run → scroll ke bagian **Artifacts** → download `cypress-report-…` → ekstrak → buka `index.html`.
5. Untuk menjalankan manual: tab **Actions** → **E2E Tests** → tombol **Run workflow** → isi `grepTags` (misalnya `@smoke`) → **Run workflow**.

Jika run gagal karena koneksi (timeout / 403 di semua test), kemungkinan website memblokir server GitHub. Paste log error ke Claude dengan prompt:

```text
Run GitHub Actions gagal dengan log berikut. Analisis apakah ini masalah test atau akses
jaringan dari runner GitHub, dan beri opsi solusi (termasuk self-hosted runner).
<PASTE LOG>
```

### Sesi 3 – Fase 2 Batch A: Form & Kalkulator (28 test case)

```text
Baca @CLAUDE.md dan @PANDUAN-LANJUTAN.md (Bagian 3 dan Bagian 4 – Batch A).
Tugas Sesi 3: otomasi semua test case Batch A.

Aturan kerja:
1. Sebelum menulis test, periksa struktur halaman dengan `curl -sL <url>` dan cari selector
   yang stabil (id, name, class semantik). Untuk perilaku JavaScript, baca script inline di
   HTML tersebut. Jangan menebak selector.
2. Tambahkan test ke spec yang tertera di Bagian 4 (buat spec baru bila belum ada).
   Gunakan Page Object di cypress/pages dan simpan data/nilai acuan di cypress/fixtures.
3. Judul test: "<TC-ID> | <judul>" dan tag sesuai Bagian 4 + tag prioritas (@P2/@P3).
4. Patuhi aturan keamanan production (Bagian 3.2): tidak ada submit form/transaksi nyata.
5. Untuk rumus kalkulator perusahaan/perdagangan/emas/zakat maal, ambil rumus dari kode
   JavaScript halaman, tulis di komentar test, dan masukkan ke daftar "perlu konfirmasi
   tim bisnis" di laporan akhir.
6. Jalankan spec yang diubah sampai stabil (2x hijau). Bug website → tag @known-bug + catat.
7. Update docs/Test_Plan_Cypress_BAZNAS.xlsx (lihat Bagian 3.6), update README (tabel
   modul & daftar test case), lalu commit: "test: add phase 2 batch A (forms & calculator)".
Akhiri dengan ringkasan: test yang ditambahkan, yang known-bug, temuan baru, dan hal yang
perlu konfirmasi.
```

### Sesi 4 – Fase 2 Batch B: Konten & Publikasi (16 test case)

Gunakan prompt Sesi 3, dengan perubahan berikut:
- ganti **"Batch A"** menjadi **"Batch B"**
- ganti nomor sesi menjadi **Sesi 4**
- pesan commit: `test: add phase 2 batch B (content & publications)`

Tambahkan kalimat ini di akhir prompt:

```text
Catatan Batch B: konten berita bersifat dinamis – assert struktur dan keberadaan data,
bukan isi teks tertentu. Untuk link PDF gunakan cy.request (cek status & content-type),
jangan mengunduh file ke disk.
```

### Sesi 5 – Fase 2 Batch C: Navigasi, Bahasa & Error (14 test case)

Gunakan prompt Sesi 3, dengan perubahan berikut:
- ganti **"Batch A"** menjadi **"Batch C"**
- ganti nomor sesi menjadi **Sesi 5**
- pesan commit: `test: add phase 2 batch C (navigation, i18n, error page)`

Tambahkan kalimat ini di akhir prompt:

```text
Catatan Batch C: pergantian bahasa memakai fungsi changeLanguage(lang) yang memanggil
GET /bahasa/switch_lang/<lang>, men-set cookie googtrans, lalu reload dan diterjemahkan oleh
Google Translate widget. Pada eksplorasi awal pergantian ke English tidak terlihat berhasil
(temuan F-06) – verifikasi dulu, lalu tentukan apakah test-nya @known-bug. Banner homepage
dinamis: assert keberadaan & gambar ter-load, bukan isi.
```

### Sesi 6 – Fase 2 Batch D: Non-fungsional (13 test case)

Gunakan prompt Sesi 3, dengan perubahan berikut:
- ganti **"Batch A"** menjadi **"Batch D"**
- ganti nomor sesi menjadi **Sesi 6**
- pesan commit: `test: add phase 2 batch D (responsive, SEO, a11y, performance)`

Tambahkan kalimat ini di akhir prompt:

```text
Catatan Batch D: install `cypress-axe` dan `axe-core` sebagai devDependency (tambahkan
"cypress-axe" ke `types` di tsconfig.json agar `cy.checkA11y` bertipe). Test
aksesibilitas dan performa bertag @a11y / @perf dan tidak boleh menggagalkan pipeline
utama: buat script npm terpisah (test:a11y, test:perf), dan default `npm test` tetap
mengecualikan @known-bug saja. Hasil pelanggaran a11y dicetak ke log/report (gunakan
callback violations), assert hanya level critical/serious. Ambang performa 5 detik
disimpan di fixture.
```

### Sesi 7 – Finishing & Kualitas Kode

```text
Baca @CLAUDE.md. Tugas Sesi 7: finishing project.
1. Tambahkan ESLint (flat config) + typescript-eslint + eslint-plugin-cypress dan Prettier.
   Script: lint, format. Perbaiki semua error lint. Tambahkan langkah lint di workflow CI
   sebelum Cypress (setelah langkah typecheck).
2. Publikasikan report HTML ke GitHub Pages lewat workflow (job deploy terpisah setelah
   test, hanya untuk branch main dan jadwal harian). Tambahkan link report di README.
   Tuliskan langkah manual yang harus saya klik di Settings → Pages.
3. Tambahkan notifikasi saat run terjadwal gagal: buat GitHub Issue otomatis berlabel
   "e2e-failure" berisi link run (pakai GITHUB_TOKEN bawaan, tanpa secret tambahan).
4. Review seluruh test: hapus duplikasi, pastikan semua TC-ID unik dan cocok dengan
   test plan, dan semua nilai acuan ada di fixture.
5. Jalankan `npm run lint` dan `npm test`, lalu commit: "chore: add lint, report publishing, failure alerts".
```

**Langkah manual setelah Sesi 7 (kamu):**
1. Repo GitHub → **Settings** → **Pages**.
2. Pada **Source**, pilih **GitHub Actions**.
3. Jalankan workflow sekali (tab **Actions** → **Run workflow**), lalu buka link report yang muncul di halaman Pages.

### Sesi 8 – Laporan untuk Direktur

```text
Baca @CLAUDE.md. Tugas Sesi 8: siapkan bahan laporan.
1. Jalankan `npm test` dan `npm run test:known-bug`.
2. Isi kolom Status di sheet "Test Case" pada docs/Test_Plan_Cypress_BAZNAS.xlsx
   berdasarkan hasil run (Pass/Fail/Skipped), dan tambahkan tanggal eksekusi di sheet Ringkasan.
3. Buat docs/LAPORAN-EKSEKUSI.md: ringkasan cakupan, hasil eksekusi (pass/fail per modul),
   daftar temuan beserta severity dan rekomendasi, serta cara mengakses report dan CI.
   Gunakan Bahasa Indonesia formal.
4. Commit: "docs: add execution report".
```

---

## Bagian 3 – Konteks & Aturan untuk Claude

### 3.1 Konteks project

- **Tujuan:** regression test dan monitoring harian website publik BAZNAS RI (`https://baznas.go.id`) serta form pembayaran `https://bayarzakat.baznas.go.id/bayarzakat`. Ini deliverable kerja QA yang dilaporkan ke direktur dan dipublikasikan di repo GitHub publik.
- **Bahasa:** README, komentar, judul test, dan dokumen ditulis dalam Bahasa Indonesia. Nama variabel dan fungsi dalam Bahasa Inggris atau Indonesia, mengikuti kode yang sudah ada.
- **Larangan konten:** jangan pernah menulis bahwa project ini dibuat sebagai portfolio, latihan, atau demo. Jangan menyertakan data pribadi atau kredensial.
- **Sumber kebenaran:** `docs/Test_Plan_Cypress_BAZNAS.xlsx` berisi sheet Ringkasan, Modul & Cakupan, Test Scenario, Test Case, dan Temuan Eksplorasi. Setiap test otomatis harus memetakan ke satu TC-ID di sheet Test Case.

### 3.2 Aturan keamanan production (WAJIB)

1. **Jangan pernah** mengirim data ke server: tidak ada submit form, transaksi, pendaftaran newsletter, atau konfirmasi pembayaran sungguhan.
2. `cypress/support/e2e.ts` sudah memblokir semua request `POST/PUT/PATCH/DELETE` dari halaman. **Jangan hapus atau melemahkan blocker ini.**
3. Untuk endpoint spesifik, tambahkan stub eksplisit dengan alias, lalu assert endpoint tersebut **tidak** terpanggil. Contoh:
   - `POST **/pembayaran/submit_customer`
   - `POST **/verifycaptcha.php` (stub body `'false'`)
   - `POST **/submit_jemput_zakat`
4. Alur bayar zakat berhenti paling jauh di tombol **"Pilih Pembayaran"** (`#next-button`). **Jangan** klik `#pay-button`, metode pembayaran + "Bayar", atau tombol `SUBMIT`/`Lanjut Pembayaran` mana pun.
5. Gunakan data dummy dari fixtures (`qa.automation@example.com`, `081200000000`, nama "Pengujian Otomatis").
6. Jangan membuat load test. Request berulang (cek link/PDF) harus berurutan dengan jeda (lihat `cy.assertNoBrokenLinks`).
7. Captcha tidak boleh di-bypass atau diselesaikan otomatis.

### 3.3 Konvensi kode

| Hal | Aturan |
|---|---|
| Judul test | `'<TC-ID> \| <Judul Test Case>'`, persis seperti di test plan |
| Tag | `{ tags: ['@regression', '@P2', ...] }`, dengan opsi `@smoke`, `@regression`, `@P1/@P2/@P3`, `@negative`, `@boundary`, `@links`, `@a11y`, `@perf`, `@known-bug` |
| Bug website | Expected result tetap sesuai perilaku yang benar. Tambahkan tag `@known-bug` dan komentar `// Temuan F-xx: ...` di atas test. Catat temuannya di sheet Temuan Eksplorasi |
| Page Object | Satu class per halaman di `cypress/pages`, diekspor sebagai instance (`export default new XPage()`) |
| Nilai acuan | Nisab, tarif, daftar opsi, URL, dan pesan validasi disimpan di `cypress/fixtures/*.json`, bukan di-hardcode di spec |
| Helper | `toNumber`, `formatRibuan` dari `cypress/support/commands.ts`; custom command `typeNominal`, `checkUrlStatus`, `assertNoBrokenLinks` |
| Assertion | Gunakan assertion yang retry (`should`). Hindari `cy.wait(<ms>)` kecuali jeda antar request |
| Konten dinamis | Assert struktur dan keberadaan data, bukan isi teks berita/banner tertentu |
| Commit | Conventional commits: `test: …`, `fix(test): …`, `docs: …`, `chore: …` |

### 3.4 Catatan teknis Cypress 16 & plugin

- Variabel publik memakai **`expose`**, bukan `env`. CLI: `--expose grepTags=@smoke`. Di kode: `Cypress.expose('key')`.
- `@cypress/grep` v7:
  - support: `const { register } = require('@cypress/grep'); register()`
  - config: `const { plugin } = require('@cypress/grep/plugin'); plugin(config)`
  - Filter negatif (`-@tag`) **tidak kompatibel** dengan `grepFilterSpecs`.
- Default di `cypress.config.ts`: `grepTags: '-@known-bug'`.
- **Subdomain berbeda origin.** `baznas.go.id` dan `bayarzakat.baznas.go.id` adalah origin berbeda (injectDocumentDomain = false):
  - Test yang langsung `cy.visit('https://bayarzakat.baznas.go.id/bayarzakat')` tidak butuh `cy.origin`.
  - Navigasi lewat klik dari `baznas.go.id` ke subdomain membutuhkan `cy.origin('https://bayarzakat.baznas.go.id', () => {...})`. Di dalam callback tidak bisa memakai import/closure luar; kirim data lewat `args`.
- `uncaught:exception` di-ignore secara global (error script pihak ketiga), tetapi tetap dicatat di log.
- Reporter: `cypress-mochawesome-reporter`, output di `cypress/reports/`.

### 3.5 Pengetahuan halaman & selector (hasil inspeksi 27 Okt 2026)

Verifikasi ulang dengan `curl -sL <url>` sebelum dipakai, karena website bisa berubah.

**Global (template AdminLTE)**

| Elemen | Selector / perilaku |
|---|---|
| Logo | `img.brand-image` di dalam `a` menuju `https://baznas.go.id/` (alt masih "AdminLTE Logo" → kandidat temuan a11y) |
| Hamburger | `a.nav-link[data-widget="control-sidebar"]`. Saat terbuka `body` mendapat class `control-sidebar-slide-open` |
| Menu | `ul.nav-sidebar`; item teratas `ul.nav-sidebar > li.nav-item`; grup memiliki class `has-treeview`, dan saat dibuka mendapat `menu-open`. Teks huruf kecil di DOM (uppercase via CSS) |
| Quick menu bawah | `footer.main-footer`, 5 kolom `.col`: PPID, Layanan Mustahik (label tertulis "Layanan Mustahk"), Bayar Zakat, Konfirmasi Zakat, Transfer Zakat (→ `/rekening`) |
| Bahasa | `select#languageSelect` (opsi `id`, `en`, `ar`), `onchange="changeLanguage(this.value)"` → GET `/bahasa/switch_lang/<lang>`, cookie `googtrans`, reload |
| Newsletter | Form Mailchimp `form#mc-embedded-subscribe-form`, input `#mce-EMAIL`, submit `#mc-embedded-subscribe`, `target="_blank"`. Jangan submit; cukup validasi atribut/constraint |
| Footer link | Kebijakan Privasi `/kebijakan-privasi`, Syarat & Ketentuan `/syarat-ketentuan`, FAQ `/faq-baznas`; copyright `p.text-warning` "Copyright © 2026 BAZNAS" |

**Homepage `/`**

| Elemen | Selector |
|---|---|
| Kartu ZIS | `.card.card-homepage` (4 kartu), link `a.detail-card[href$="/zakat"]` dst., teks "Selengkapnya" |
| Slider banner | `#owl-carousel.owl-carousel` (Owl Carousel) |
| Berita program | Container `#owl-program`, link `a[href*="pendistribusian-show"]`, judul di `p.font-weight-bold` |
| Load more | `a.btn.btn-main` → `/news-all`, `/berita-pendistribusian`, `/berkah-zakat-all`, `/video-all` |
| Sosial media | `a[target=_blank]`: facebook.com/badanamilzakat, instagram.com/baznasindonesia, twitter.com/baznasindonesia, linkedin.com/company/baznas-indonesia, youtube channel UCmY29I5na-P9Q108PY5By4w, vt.tiktok.com/ZSJhFdqLC |

**Kalkulator zakat `/kalkulatorzakat`**

| Elemen | Selector / perilaku |
|---|---|
| Jenis | `select[name=calculator_type]`: `penghasilan`, `perusahaan`, `perdagangan`, `emas_perak` |
| Penghasilan | `form#form_penghasilan`; input `pendapatan_perbulan`, `pendapatan_lain`, `jumlah_penghasilan` (bisa diedit → F-16), `txt_nishab_pertahun` (readonly, 91.681.728), `txt_nishab` (readonly, 7.640.114), `total_zakat` (disabled) |
| Fungsi JS | `hitungPenghasilan()`: total = `Math.ceil(jumlah × 0.025)`. Jika `< nisab` → tampilkan `.under_nishab`, jika tidak → tampilkan `.zakat_penghasilan`, sembunyikan `.btn_hitung_penghasilan`, tampilkan `.btn_bayar_penghasilan`. `resetPenghasilan()` mengosongkan input. `bayarZakat('zakpro')` → `/bayarzakat?jenis=profesi&param1..4=0&jumlah=<nominal>`. `bayarSedekah()` → `/sedekahbaznas` |
| Jenis lain | Input perusahaan: `pdp_pre_pajak`, `zakper_jasa`, `zakper_aktiva`, `zakper_pasiva`. Perdagangan: `jml_omset`, `jml_zakper_niaga`, `aset_lancar`, `laba`, `jumlah_aset`, `haul_nishab`, `jml_zak_per`. Emas: `txt_emas` (number), `harga_emas`, `jml_zak_ms`. Tombol memakai `onclick` (`resetZakperJasa()`, dll.); baca fungsinya di script inline untuk rumus |

**Form bayar zakat `https://bayarzakat.baznas.go.id/bayarzakat`**

| Elemen | Selector / perilaku |
|---|---|
| Tab | `button` "Isi Formulir" / "Kalkulator" (`openTab(event,'tab1'/'tab2')`) |
| Jenis dana | `#type_of_fund`: `zakat`, `infak`, `sedekah`, `fidyah` |
| Sub-jenis | `#jenis` (name `subtype_of_fund`). Zakat: 10 opsi (`zakatpenghasilan`, `zakatmaal`, `zakatemas`, `zakatuang`, `zakatniaga`, `zakatpertanian`, `zakatternak`, `zakattambang`, `zakatindustri`, `zakatrikaz`). Infak: 12 opsi (`sedekahpalestina`, `dmpsol`, `infakopr`, `infakbnc`, `sedekahdaging`, `sedekahyatim`, `infaksedekah`, `donasikemanusiaan`, `dmppdd`, `dmpkhs`, `dmpeko`, `infakdakwah`). Sedekah: `infakopr`. Fidyah: `dkslinfak` |
| Fidyah | `#hariid` (opsi 0 = placeholder, 1–30), nominal otomatis 65.000 × hari, `#nominal` readonly |
| Data muzaki | `#nominal` (required, maxlength 50), `#name` (hanya `[a-zA-Z .,]` via `validateNameInput`), `input[name=user_title]` Bapak/Ibu, `#handphone` (maxlength 13), `#email`, `#cookies` |
| Validasi | jQuery Validate. Rules: user_name required; user_phone required minlength 8; email required + emailStrict; nominal required. Pesan error di `label#<id>-error.error`, misalnya `label#nominal-error` "Mohon Masukkan Nominal Donasi" |
| Alur | `#next-button` ("Pilih Pembayaran") → `hitToReleva()` (tracking) + AJAX `POST /pembayaran/submit_customer` → layar "Metode Pembayaran" dengan `#pay-button`. `next_step()` menjalankan validasi seluruh field (F-14 sudah diperbaiki, diverifikasi 27 Okt 2026) |
| Metode | `input[name=metode]`: bsi, bca, mandiri, bni, bri, cimb, muamalat, permata, qris, blu, gopay, shopee, ovo, dana, jenius, linkaja, indomaret, credit, paypal |
| Kalkulator (tab 2) | Input `pendapatan`, `lainnya`, `emasperak`, `tabungan`, `kendaraan`, `hutang`; tombol Reset / Hitung / Hitung Ulang / Bayar / Bayar Zakat Maal / Sedekah; fungsi `hitungpenghasilan()`, `resetpenghasilan()`, `ulangpenghasilan()`, `bayarpenghasilan()`; zakat fitrah 40.000 × jiwa (`hitungfitrah`) |

**Form jemput zakat `/form-jemput-zakat`**

| Elemen | Selector / perilaku |
|---|---|
| Form | `form#formjemputzakat.needs-validation` (novalidate), action `/Service/submit_jemput_zakat` |
| Field | `nama`*, `npwz`, `hp`*, `email`* (type email), `tanggal_jemput`* (date, tanpa `min`), `jam_jemput`* (time), `jenis_bayar`* (Zakat Mal, Zakat Fitrah, Zakat Penghasilan, Infaq/Sedekah, Fidyah, Kurban), `metode_bayar`* (Uang, Barang), `nominal`*, `keterangan`, `alamat`* (textarea), `captcha_code`* |
| Submit | `#btn-submit-data`; handler `submit` → AJAX `POST …/assets/captcha/verifycaptcha.php`, alert "Captcha yang Anda masukan tidak cocok" jika `'false'` |
| Captcha | `img.captchaimg` + link "klik di sini untuk refresh" |

**Halaman lain**

| Halaman | Catatan |
|---|---|
| `/rekening` | `select#account_type` (`zakat`, `infak`, `sedekah`, `tematik`, `upz`, `zakper`), `openAccount()` menampilkan `table#<jenis>`. Jumlah baris: zakat 28, infak 17, sedekah 5 (baris ke-5 tanpa rekening), tematik 14, upz 2, zakper 1. Baris: `td` ke-3 nomor rekening, `p[onclick^="copyLink('"]` "salin" |
| `/konfirmasi-zis` | Heading "INFOMASI UNTUK MUZAKI" (F-02), tombol "Konfirmasi Sekarang" → `https://bazn.as/konfirmasi` |
| `/keuangan` | 13 link PDF; `/laporan-zakat-nasional` 11 PDF; `/upz` 4 PDF |
| `/news-all`, `/artikel-all` | Ada pagination (`.pagination`) |
| `/video-all` | 22 iframe video |
| `/kontak-baznas` | 1 iframe peta |
| `/zakat`, `/zakatfitrah` | Ada iframe video |
| URL tidak dikenal | Status 404, `<title>` kosong (F-11) |
| Title bermasalah | `/form-jemput-zakat` (F-03), `/program/*` mis. "Programkesehatan \| BAZNAS" (F-10) |

### 3.6 Memperbarui test plan (Excel)

File: `docs/Test_Plan_Cypress_BAZNAS.xlsx`, sheet **Test Case**. Kolom yang relevan:

| Kolom | Isi |
|---|---|
| A | TC ID |
| J | Tag |
| K | Automation |
| M | Status: `Not Run` / `Pass` / `Fail` / `Blocked` / `Skipped` |
| N | Catatan |
| O | Spec File |
| P | Fase Otomasi (`Fase 1` / `Fase 2`) |

Sheet **Temuan Eksplorasi** berkolom: ID, Modul, Halaman, Observasi, Seharusnya, Severity, Kategori, Status Verifikasi, Catatan.

Gunakan Python + openpyxl (`pip install openpyxl`). Ubah **hanya** sel nilai; jangan menghapus formula di sheet Ringkasan dan Modul & Cakupan. Contoh:

```python
from openpyxl import load_workbook
wb = load_workbook('docs/Test_Plan_Cypress_BAZNAS.xlsx')
ws = wb['Test Case']
for row in ws.iter_rows(min_row=2):
    if row[0].value == 'TC-CALC-018':
        row[9].value = '@regression @known-bug'   # kolom J
        row[13].value = '@known-bug – temuan F-17' # kolom N
        row[15].value = 'Fase 2'                   # kolom P (sudah diotomasi)
wb['Temuan Eksplorasi'].append(['F-17', 'Kalkulator Zakat', '/kalkulatorzakat',
    '<observasi>', '<seharusnya>', 'Low', 'Fungsional', 'Terkonfirmasi', 'TC-CALC-018'])
wb.save('docs/Test_Plan_Cypress_BAZNAS.xlsx')
```

Jika Python tidak tersedia, tuliskan perubahan yang perlu dilakukan dalam bentuk tabel di akhir sesi supaya pengguna bisa mengisinya manual di Excel.

### 3.7 Daftar temuan yang sudah tercatat

| ID | Ringkasan | Severity | Test |
|---|---|---|---|
| F-01 | Hasil kalkulator tidak dihitung ulang saat input diubah setelah klik Hitung | Medium | TC-CALC-014 (@known-bug) |
| F-02 | Typo heading "INFOMASI UNTUK MUZAKI" | Low | – |
| F-03 | Title `/form-jemput-zakat` salah | Low | – |
| F-04 | Sub-jenis "Infak" berisi item berlabel "Sedekah …" (perlu konfirmasi) | Low | – |
| F-05 | Nominal fidyah tetap terisi setelah ganti jenis dana | Low | TC-PAY-006 (Fase 2) |
| F-06 | Ganti bahasa ke English tidak mengubah konten (perlu verifikasi) | Medium | Batch C |
| F-07 | Label quick menu "Layanan Mustahk" | Low | – |
| F-08 | Banner Ramadhan masih tampil di Oktober | Low | – |
| F-09 | Tanggal jemput tanpa batas minimum | Low | TC-JMP-008 (Fase 2) |
| F-10 | Title `/program/*` tanpa spasi | Low | Batch D (SEO) |
| F-11 | Halaman 404 tanpa title | Low | TC-ERR-001 |
| F-12 | Nominal/jenis dari kalkulator hilang di form pembayaran | Medium | TC-CALC-015b (@known-bug) |
| F-13 | Typo pesan validasi email "engiriman" | Low | – |
| F-14 | Form bayar lanjut tanpa validasi nama/HP/email — **sudah diperbaiki** (diverifikasi 27 Okt 2026) | Medium | TC-PAY-012..014 (tag @known-bug dilepas) |
| F-15 | Tidak ada validasi minimal Rp1.000.000 di jemput zakat (klien) | Low | TC-JMP-007 (@known-bug) |
| F-16 | Field "Jumlah penghasilan" bisa diedit manual | Low | – |

Temuan baru dimulai dari **F-17**.

### 3.8 Definition of Done (per sesi / batch)

- [ ] Semua test case di batch punya test dengan TC-ID dan tag yang benar.
- [ ] Selector diverifikasi dari HTML asli, bukan ditebak.
- [ ] Tidak ada request tulis yang lolos ke server (blocker global tetap aktif; stub spesifik untuk endpoint yang disentuh).
- [ ] Spec yang diubah lulus 2× berturut-turut (`npx cypress run --spec <file>`). Kegagalan karena bug website ditandai `@known-bug` dan dicatat.
- [ ] Nilai acuan baru ada di fixture.
- [ ] `docs/Test_Plan_Cypress_BAZNAS.xlsx` diperbarui (Fase, Tag, Catatan, temuan baru).
- [ ] README diperbarui (tabel modul, daftar test case, known issues jika ditampilkan).
- [ ] Commit dengan pesan conventional commits.
- [ ] Ringkasan akhir sesi: test ditambahkan, known-bug, temuan baru, dan hal yang perlu konfirmasi.

---

## Bagian 4 – Daftar Test Case yang Belum Diotomasi

Total 71 test case (P2/P3), dikelompokkan per batch. Tag prioritas (`@P2`/`@P3`) ditambahkan ke setiap test. Detail lengkap ada juga di sheet Test Case pada test plan.

### Batch A (28 test case)


#### Kalkulator Zakat → `cypress/e2e/kalkulator-zakat.cy.ts`

- **TC-CALC-008 | Nominal besar diformat dan dihitung dengan benar** — P2, Boundary, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/kalkulatorzakat, Jenis Zakat = PENGHASILAN
  - Langkah: 1. Isi Gaji nominal besar 2. Klik 'Hitung Zakat'
  - Data: Gaji = 1.000.000.000
  - Expected: Zakat = Rp 25.000.000, format ribuan benar, tidak ada notasi eksponen
- **TC-CALC-010 | Input karakter spesial & minus ditolak** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/kalkulatorzakat, Jenis Zakat = PENGHASILAN
  - Langkah: 1. Ketik karakter spesial pada field Gaji
  - Data: '-5000000', '1,5', '@#$'
  - Expected: Hanya digit yang diterima; tidak ada nilai negatif
- **TC-CALC-011 | Hitung dengan field kosong / nol** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/kalkulatorzakat, Jenis Zakat = PENGHASILAN
  - Langkah: 1. Kosongkan Gaji & Lain-lain 2. Klik 'Hitung Zakat'
  - Data: Gaji = 0
  - Expected: Tidak ada error JS; tampil pesan belum mencapai nisab atau validasi wajib isi
- **TC-CALC-012 | Field hasil tidak dapat diedit pengguna** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/kalkulatorzakat, Jenis Zakat = PENGHASILAN
  - Langkah: 1. Coba ketik pada field Nisab & Jumlah Wajib Zakat
  - Data: -
  - Expected: Field nisab read-only; field hasil zakat tidak bisa diubah manual
- **TC-CALC-016 | Tombol 'Sedekah' saat di bawah nisab membawa ke form sedekah** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/kalkulatorzakat, Jenis Zakat = PENGHASILAN
  - Langkah: 1. Isi Gaji 5.000.000, klik Hitung 2. Klik 'Sedekah'
  - Data: -
  - Expected: Diarahkan ke form pembayaran dengan jenis dana Sedekah
- **TC-CALC-017 | Dropdown Jenis Zakat berisi 4 jenis** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka /kalkulatorzakat
  - Langkah: 1. Buka dropdown Jenis Zakat
  - Data: -
  - Expected: Opsi: PENGHASILAN, PERUSAHAAN, PERDAGANGAN, EMAS; form berganti sesuai pilihan
- **TC-CALC-018 | Kalkulator zakat perusahaan** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Jenis Zakat = PERUSAHAAN
  - Langkah: 1. Isi Pendapatan sebelum pajak / Aktiva & Pasiva lancar 2. Klik Hitung
  - Data: Pendapatan = 1.000.000.000
  - Expected: Zakat = 2,5% dari dasar perhitungan sesuai rumus yang ditampilkan
  - Catatan: Rumus dikonfirmasi ke tim bisnis
- **TC-CALC-019 | Kalkulator zakat perdagangan** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Jenis Zakat = PERDAGANGAN
  - Langkah: 1. Isi aset lancar, laba, dll. 2. Klik Hitung
  - Data: Sesuai fixture
  - Expected: Zakat dihitung 2,5% jika jumlah aset >= nisab
- **TC-CALC-020 | Kalkulator zakat emas** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Jenis Zakat = EMAS
  - Langkah: 1. Isi jumlah emas (gram) & harga emas per gram 2. Klik Hitung
  - Data: Emas = 100 gram; Harga = 1.000.000/gram
  - Expected: Wajib zakat bila >= 85 gram; zakat = 2,5% x nilai emas = Rp 2.500.000
- **TC-CALC-021 | Zakat emas di bawah 85 gram** — P2, Boundary, tag `@regression` + `@P2`
  - Pre-condition: Jenis Zakat = EMAS
  - Langkah: 1. Isi emas 50 gram 2. Klik Hitung
  - Data: Emas = 50 gram
  - Expected: Dinyatakan belum mencapai nisab

#### Form Bayar Zakat Online → `cypress/e2e/bayar-zakat.cy.ts`

- **TC-PAY-004 | Sub-jenis Infak sesuai** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Pilih Jenis Dana = Infak
  - Data: -
  - Expected: Opsi sub-jenis infak tampil (12 opsi pada saat eksplorasi)
  - Catatan: Lihat temuan F-04
- **TC-PAY-005 | Sub-jenis Sedekah sesuai** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Pilih Jenis Dana = Sedekah
  - Data: -
  - Expected: Sub-jenis 'Sedekah BAZNAS' tampil
- **TC-PAY-006 | Nominal tidak terbawa saat berganti jenis dana** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Pilih Fidyah (nominal 65.000 otomatis) 2. Ganti ke Infak
  - Data: -
  - Expected: Field nominal di-reset/kosong dan dapat diedit kembali
  - Catatan: Lihat temuan F-05
- **TC-PAY-009 | Pilihan jumlah hari fidyah 1–30** — P2, Boundary, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Pilih Fidyah 2. Buka dropdown Jumlah Hari
  - Data: -
  - Expected: Opsi 1 sampai 30
- **TC-PAY-015 | Nominal minimum / nol ditolak** — P2, Boundary, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Isi nominal 0 2. Pilih metode (di-intercept)
  - Data: Nominal = 0
  - Expected: Validasi nominal minimum tampil
- **TC-PAY-016 | Checkbox pernyataan muzaki** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Periksa teks pernyataan & checkbox
  - Data: -
  - Expected: Teks pernyataan sumber dana halal & persetujuan menerima BSZ tampil
- **TC-PAY-018 | Logo metode pembayaran ter-load** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Periksa setiap gambar logo metode
  - Data: -
  - Expected: Semua logo ter-load (naturalWidth > 0)
- **TC-PAY-019 | Tab Kalkulator di halaman bayar zakat** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Klik tab 'Kalkulator' 2. Isi pendapatan 10.000.000, klik Hitung
  - Data: Pendapatan = 10.000.000
  - Expected: Kalkulator tampil; hasil zakat 250.000; tombol 'Bayar' tampil
- **TC-PAY-020 | Tab Kalkulator - Zakat Maal** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/bayarzakat (redirect ke bayarzakat.baznas.go.id)
  - Langkah: 1. Klik tab 'Kalkulator' 2. Isi emas/perak, tabungan, kendaraan, hutang 3. Klik Hitung
  - Data: Sesuai fixture
  - Expected: Zakat maal dihitung 2,5% x (harta - hutang) bila >= nisab
  - Catatan: Rumus dikonfirmasi ke tim bisnis

#### Form Jemput Zakat → `cypress/e2e/jemput-zakat.cy.ts`

- **TC-JMP-001 | Form jemput zakat tampil lengkap** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /form-jemput-zakat
  - Data: -
  - Expected: Field tampil: Nama*, NPWZ, No. HP*, Email*, Tanggal*, Jam*, Jenis Pembayaran*, Metode Pembayaran*, Nominal*, Keterangan, Alamat*, Captcha*; info wilayah Jabodetabek & minimal Rp1.000.000 tampil
- **TC-JMP-002 | Opsi Jenis & Metode Pembayaran sesuai** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/form-jemput-zakat
  - Langkah: 1. Buka dropdown Jenis Pembayaran & Metode
  - Data: -
  - Expected: Jenis: Zakat Mal, Zakat Fitrah, Zakat Penghasilan, Infaq/Sedekah, Fidyah, Kurban. Metode: Uang, Barang
- **TC-JMP-003 | Captcha tampil dan dapat di-refresh** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/form-jemput-zakat
  - Langkah: 1. Periksa gambar captcha 2. Klik 'klik di sini untuk refresh'
  - Data: -
  - Expected: Gambar captcha tampil dan berganti setelah refresh
  - Catatan: Captcha tidak diselesaikan otomatis
- **TC-JMP-006 | Nomor HP berisi huruf ditolak** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/form-jemput-zakat
  - Langkah: 1. Isi No. HP dengan huruf 2. Klik Kirim (di-intercept)
  - Data: HP = 'abcdef'
  - Expected: Validasi nomor HP tampil
  - Catatan: Tidak ada atribut pattern pada field HP
- **TC-JMP-008 | Tanggal penjemputan di masa lalu** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Buka https://baznas.go.id/form-jemput-zakat
  - Langkah: 1. Pilih tanggal kemarin 2. Klik Kirim (di-intercept)
  - Data: Tanggal = H-1
  - Expected: Tanggal lampau tidak dapat dipilih / ditolak
  - Catatan: Lihat temuan F-09

#### Konfirmasi ZIS → `cypress/e2e/konfirmasi-zis.cy.ts`

- **TC-KONF-001 | Halaman konfirmasi ZIS tampil** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /konfirmasi-zis
  - Data: -
  - Expected: Heading informasi untuk muzaki & tombol 'Konfirmasi Sekarang' tampil
  - Catatan: Lihat temuan F-02 (typo heading)
- **TC-KONF-002 | Tombol 'Konfirmasi Sekarang' mengarah ke form konfirmasi** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /konfirmasi-zis 2. Periksa href tombol & request URL
  - Data: -
  - Expected: href = https://bazn.as/konfirmasi dan URL merespons 2xx/3xx

#### Subscribe Newsletter → `cypress/e2e/newsletter.cy.ts`

- **TC-NWSL-001 | Email kosong tidak dapat di-subscribe** — P3, Negative, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Scroll ke form 'Dapatkan Update Berita' 2. Klik subscribe tanpa isi email (di-intercept)
  - Data: Email = ''
  - Expected: Validasi wajib isi tampil
  - Catatan: Tidak mengirim email asli
- **TC-NWSL-002 | Format email tidak valid ditolak** — P3, Negative, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Isi email tidak valid 2. Klik subscribe (di-intercept)
  - Data: Email = 'abc'
  - Expected: Validasi format email tampil

### Batch B (16 test case)


#### Konten Edukasi ZIS → `cypress/e2e/edukasi-zis.cy.ts`

- **TC-EDU-001 | Halaman edukasi ZIS dapat diakses** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Request setiap URL edukasi
  - Data: /zakat, /infak, /sedekah, /fidyah, /zakatfitrah, /zakatmal, /zakatpenghasilan, /zakatperusahaan, /zakatperdagangan, /zakatemas, /zakatsaham
  - Expected: Semua status 200 dan memiliki heading & konten teks
  - Catatan: Data-driven
- **TC-EDU-002 | Tombol ajakan bayar di halaman edukasi berfungsi** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /zakat 2. Klik tombol bayar/tunaikan
  - Data: -
  - Expected: Diarahkan ke form bayar zakat
- **TC-EDU-003 | Video tertanam di halaman edukasi ter-load** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /zakat & /zakatfitrah
  - Data: -
  - Expected: iframe video tampil dengan src valid

#### Berita & Publikasi → `cypress/e2e/berita.cy.ts`

- **TC-NEWS-001 | Halaman daftar berita tampil** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /news-all
  - Data: -
  - Expected: Daftar berita tampil dengan judul, gambar, tanggal
- **TC-NEWS-002 | Pagination berita berfungsi** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /news-all 2. Klik halaman 2
  - Data: -
  - Expected: URL berubah ke halaman 2; daftar berita berbeda dari halaman 1
- **TC-NEWS-003 | Detail berita menampilkan konten lengkap** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /news-all 2. Klik berita pertama
  - Data: -
  - Expected: Judul, tanggal, penulis, gambar dan isi tampil; gambar ter-load
- **TC-NEWS-004 | Daftar berita per program** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Request /berita/program-* (7 program)
  - Data: Lihat fixture
  - Expected: Semua halaman status 200 dan berisi daftar berita
- **TC-NEWS-005 | Halaman video, artikel, newsletter, berkah zakat tampil** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka masing-masing halaman
  - Data: /video-all, /artikel-all, /newsletter-all, /berkah-zakat-all
  - Expected: Status 200; daftar konten tampil; embed video ter-load

#### Laporan & Dokumen → `cypress/e2e/laporan.cy.ts`

- **TC-LAP-001 | Halaman laporan keuangan menampilkan dokumen** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /keuangan
  - Data: -
  - Expected: Daftar dokumen laporan (PDF) tampil
- **TC-LAP-002 | Semua link PDF laporan dapat diakses** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Kumpulkan href PDF di /keuangan, /laporan-zakat-nasional, /upz 2. Request setiap URL (HEAD)
  - Data: -
  - Expected: Setiap file merespons 200 dengan content-type application/pdf
  - Catatan: Tidak mengunduh file, hanya cek respons
- **TC-LAP-003 | Halaman pustaka tampil** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /pustaka
  - Data: -
  - Expected: Status 200 dan konten tampil

#### Profil & Informasi Lembaga → `cypress/e2e/profil.cy.ts`

- **TC-PROF-001 | Halaman profil lembaga dapat diakses** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Request setiap URL
  - Data: /baznas-profile, /struktur-baznas, /penghargaan, /mitra-baznas, /pemberitahuan, /karir, /brand
  - Expected: Status 200 dan memiliki heading
  - Catatan: Data-driven
- **TC-PROF-002 | Halaman kontak menampilkan alamat & peta** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /kontak-baznas
  - Data: -
  - Expected: Informasi kontak tampil; iframe peta ter-load
- **TC-PROF-003 | FAQ dapat dibuka/ditutup** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /faq-baznas 2. Klik salah satu pertanyaan
  - Data: -
  - Expected: Jawaban tampil saat diklik dan tersembunyi saat diklik ulang
- **TC-PROF-004 | Daftar BAZNAS daerah & lembaga jaringan tampil** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /baznas-daerah, /lembaga-amil-zakat, /lembaga-islam, /lembaga-pendidikan
  - Data: -
  - Expected: Status 200 dan daftar entri tampil

#### Program BAZNAS → `cypress/e2e/program.cy.ts`

- **TC-PROG-001 | Halaman program BAZNAS dapat diakses** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Request setiap URL program
  - Data: /program/kemanusiaan, /kesehatan, /pendidikan-dakwah, /kebencanaan, /ekonomi-pedesaan, /ekonomi-perkotaan, /optimasi-produk
  - Expected: Semua status 200 dan berisi konten program
  - Catatan: Data-driven

### Batch C (14 test case)


#### Homepage → `cypress/e2e/home.cy.ts`

- **TC-HOME-003 | Tidak ada error JavaScript saat homepage dimuat** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Pantau uncaught exception di console
  - Data: -
  - Expected: Tidak ada uncaught exception yang menggagalkan render halaman
  - Catatan: Gunakan Cypress.on('uncaught:exception') untuk mencatat
- **TC-HOME-006 | Banner/slider utama tampil dan dapat berganti** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Amati banner utama beberapa detik / klik navigasi slider
  - Data: -
  - Expected: Banner tampil, gambar ter-load, slide berganti tanpa error
  - Catatan: Konten banner dinamis; asersi pada keberadaan & gambar ter-load, bukan isi
- **TC-HOME-007 | Section 'Berita Program' menampilkan daftar berita terbaru** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Scroll ke section 'Berita Program'
  - Data: -
  - Expected: Minimal 1 berita tampil dengan judul, tanggal (dd/mm/yyyy) dan penulis
- **TC-HOME-008 | Tombol 'Load more' di section berita mengarah ke halaman daftar** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Klik 'Load more' pada masing-masing section
  - Data: Berita -> /news-all; Pendistribusian -> /berita-pendistribusian; Berkah Zakat -> /berkah-zakat-all; Video -> /video-all
  - Expected: Setiap tombol membuka halaman daftar yang sesuai (status 200)
- **TC-HOME-009 | Klik salah satu berita di homepage membuka detail berita** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Klik judul berita pertama
  - Data: -
  - Expected: Halaman detail terbuka, judul pada detail sama dengan judul di kartu (abaikan '...' terpotong)

#### Header & Menu Navigasi → `cypress/e2e/navigation.cy.ts`

- **TC-NAV-006 | Sub-menu Profil Program, Kabar, Laporan, Jaringan mengarah ke halaman benar** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Menu hamburger terbuka
  - Langkah: 1. Expand setiap menu 2. Klik setiap sub-menu
  - Data: Lihat fixture menu.json
  - Expected: Setiap halaman terbuka dengan status 200

#### Footer → `cypress/e2e/footer.cy.ts`

- **TC-FTR-001 | Link Kebijakan Privasi, Syarat & Ketentuan, FAQ berfungsi** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Scroll ke footer 2. Klik masing-masing link
  - Data: /kebijakan-privasi, /syarat-ketentuan, /faq-baznas
  - Expected: Halaman terbuka (status 200) dan berisi konten
- **TC-FTR-002 | Ikon media sosial mengarah ke akun resmi BAZNAS** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Scroll ke footer 2. Periksa href ikon sosial media
  - Data: Facebook, Instagram, X/Twitter, LinkedIn, YouTube, TikTok
  - Expected: href mengarah ke akun resmi dan memiliki target='_blank'
  - Catatan: Cek href saja, tidak membuka situs pihak ketiga
- **TC-FTR-003 | Teks copyright menampilkan tahun berjalan** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Scroll ke footer
  - Data: -
  - Expected: Teks 'Copyright © {tahun berjalan} BAZNAS' tampil

#### Multi-bahasa → `cypress/e2e/i18n.cy.ts`

- **TC-I18N-001 | Dropdown bahasa berisi 3 pilihan** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Periksa dropdown bahasa
  - Data: -
  - Expected: Opsi: Indonesia (default terpilih), English, العربية
- **TC-I18N-002 | Ganti bahasa ke English** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Pilih 'English' pada dropdown bahasa 2. Tunggu halaman diterjemahkan
  - Data: -
  - Expected: Konten utama berubah ke Bahasa Inggris (mis. 'Selengkapnya' -> 'Read more'), pilihan bahasa tetap 'English'
  - Catatan: Lihat temuan F-06; menggunakan Google Translate widget
- **TC-I18N-003 | Ganti bahasa ke Arab dan cek arah teks** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Pilih 'العربية'
  - Data: -
  - Expected: Konten diterjemahkan ke Bahasa Arab; layout tidak rusak (idealnya dir='rtl')
- **TC-I18N-004 | Pilihan bahasa tetap saat pindah halaman** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Bahasa diset ke English
  - Langkah: 1. Klik menu menuju /zakat
  - Data: -
  - Expected: Halaman /zakat tetap tampil dalam Bahasa Inggris

#### Error Handling → `cypress/e2e/error-page.cy.ts`

- **TC-ERR-001 | URL tidak dikenal menampilkan halaman 404** — P2, Negative, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /halaman-tidak-ada-xyz
  - Data: -
  - Expected: Status 404; tampil halaman 404 yang informatif dengan link kembali ke beranda
  - Catatan: Lihat temuan F-11 (title kosong)

### Batch D (13 test case)


#### Responsive → `cypress/e2e/responsive.cy.ts`

- **TC-RESP-001 | Homepage di viewport mobile** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Set viewport iphone-x (375x812) 2. Buka homepage
  - Data: -
  - Expected: Tidak ada horizontal scroll; menu hamburger & bottom nav berfungsi
- **TC-RESP-002 | Homepage di viewport tablet** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Set viewport ipad-2 (768x1024) 2. Buka homepage
  - Data: -
  - Expected: Layout rapi, kartu ZIS tersusun benar
- **TC-RESP-003 | Homepage di viewport desktop** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Set viewport 1440x900 2. Buka homepage
  - Data: -
  - Expected: Banner samping & konten tengah tampil sesuai desain
- **TC-RESP-004 | Kalkulator & form bayar zakat di mobile** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Set viewport mobile 2. Buka /kalkulatorzakat & /bayarzakat
  - Data: -
  - Expected: Seluruh field dapat diisi; tombol tidak tertutup bottom nav

#### SEO & Metadata → `cypress/e2e/seo.cy.ts`

- **TC-SEO-001 | Setiap halaman utama memiliki title yang sesuai** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Request halaman utama 2. Periksa <title>
  - Data: Lihat fixture pages.json
  - Expected: Title tidak kosong dan relevan dengan isi halaman
  - Catatan: Lihat temuan F-03, F-10, F-11
- **TC-SEO-002 | Meta description & Open Graph tersedia** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Periksa meta description, og:title, og:image di homepage
  - Data: -
  - Expected: Meta tag tersedia dan tidak kosong
- **TC-SEO-003 | Favicon tersedia** — P3, Positive, tag `@regression` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Periksa link rel='icon'
  - Data: -
  - Expected: Favicon tersedia dan merespons 200

#### Integritas Link → `cypress/e2e/broken-links.cy.ts`

- **TC-LINK-003 | Tidak ada gambar rusak di homepage** — P2, Positive, tag `@regression` + `@P2`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Periksa semua <img> di homepage
  - Data: -
  - Expected: Semua gambar memiliki naturalWidth > 0

#### Aksesibilitas Dasar → `cypress/e2e/accessibility.cy.ts`

- **TC-A11Y-001 | Pemeriksaan aksesibilitas homepage** — P3, Positive, tag `@a11y` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Jalankan cy.checkA11y()
  - Data: -
  - Expected: Tidak ada pelanggaran level critical/serious
  - Catatan: Hasil dilaporkan, tidak menggagalkan pipeline
- **TC-A11Y-002 | Gambar memiliki atribut alt** — P3, Positive, tag `@a11y` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Periksa seluruh <img> di homepage
  - Data: -
  - Expected: Setiap gambar konten memiliki alt yang deskriptif
- **TC-A11Y-003 | Field form memiliki label** — P3, Positive, tag `@a11y` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /form-jemput-zakat & /kalkulatorzakat 2. Jalankan cy.checkA11y()
  - Data: -
  - Expected: Setiap input memiliki label yang terhubung

#### Performa Dasar → `cypress/e2e/performance.cy.ts`

- **TC-PERF-001 | Waktu muat homepage** — P3, Positive, tag `@perf` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka homepage 2. Ukur window.performance (loadEventEnd - navigationStart)
  - Data: -
  - Expected: Waktu muat < 5 detik (ambang dapat disesuaikan)
  - Catatan: Indikator saja, bukan load testing
- **TC-PERF-002 | Waktu muat form bayar zakat** — P3, Positive, tag `@perf` + `@P3`
  - Pre-condition: Browser terbuka, koneksi internet aktif
  - Langkah: 1. Buka /bayarzakat 2. Ukur waktu muat
  - Data: -
  - Expected: Waktu muat < 5 detik
---

## Bagian 5 – Troubleshooting

| Masalah | Penyebab umum | Solusi |
|---|---|---|
| `npm ci` gagal | Versi Node terlalu lama / tidak ada `package-lock.json` | Cek `node -v` ≥ 20. Jika lock file hilang, jalankan `npm install` |
| `Cypress verify` gagal / binary tidak ditemukan | Download binary terputus | Jalankan `npx cypress install --force` |
| Semua test timeout | Website lambat atau koneksi kantor memblokir | Coba buka https://baznas.go.id di Chrome. Naikkan `pageLoadTimeout` di `cypress.config.ts` bila perlu |
| Error `cy.origin()` / "cross origin" | Navigasi ke `bayarzakat.baznas.go.id` tanpa `cy.origin` | Bungkus perintah setelah navigasi dengan `cy.origin('https://bayarzakat.baznas.go.id', () => { ... })` |
| Test lulus di lokal tapi gagal di CI | Runner GitHub diblokir / lebih lambat | Lihat Sesi 2; pertimbangkan self-hosted runner |
| `grepTags` tidak berpengaruh | Pakai `--env` (Cypress lama) | Cypress 16 memakai `--expose grepTags=...` |
| Panel Claude tidak muncul | Ekstensi belum aktif | `Ctrl+Shift+P` → ketik "Claude" → pilih perintah membuka Claude Code; atau reload VS Code (`Ctrl+Shift+P` → "Developer: Reload Window") |
| Claude kehilangan konteks di sesi panjang | Percakapan terlalu panjang | Commit dulu, buka chat baru, lalu mulai dengan "Baca @CLAUDE.md dan @PANDUAN-LANJUTAN.md, lanjutkan Sesi X dari langkah Y" |

---

## Bagian 6 – Checklist Project Selesai

- [x] Sesi 1: Fase 1 stabil (hijau 2× berturut-turut)
- [ ] Sesi 2: repo publik di GitHub, workflow CI aktif dan hijau
- [ ] Sesi 3: Batch A selesai (28 TC)
- [ ] Sesi 4: Batch B selesai (16 TC)
- [ ] Sesi 5: Batch C selesai (14 TC)
- [ ] Sesi 6: Batch D selesai (13 TC)
- [ ] Sesi 7: lint, report di GitHub Pages, alert kegagalan
- [ ] Sesi 8: test plan terisi hasil eksekusi + `docs/LAPORAN-EKSEKUSI.md`
- [ ] Total 112 test case terotomasi; kolom "Fase Otomasi" terisi semua
- [ ] Temuan dikirim ke tim pengembang website / atasan
