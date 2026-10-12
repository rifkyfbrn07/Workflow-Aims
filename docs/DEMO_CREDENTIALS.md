# Panduan Akun Demo & Verifikasi Peran (PT Nusantara Regas)

Dokumen ini memuat daftar kredensial akun demonstrasi untuk pengujian fungsionalitas dan presentasi operasional. Kredensial ini khusus dialokasikan untuk lingkungan development/staging/demo dan **tidak digunakan pada data produksi riil**.

---

## 1. Konfigurasi Environment Demo

Untuk mengaktifkan panel pemilih akun demo di antarmuka halaman login, pastikan variabel berikut diatur pada environment lokal:

```env
DEMO_ACCOUNTS_ENABLED="true"
```

Jika bernilai `"false"` atau tidak didefinisikan (default), panel demo disembunyikan secara otomatis demi kepatuhan keamanan.

---

## 2. Menjalankan Seed Akun Demo

Jalankan perintah berikut untuk menyisipkan akun demo beserta data sintetis pelaporan yang saling terhubung secara **idempotent** (tidak menghapus atau mereset data karyawan lain):

```bash
npm run db:seed:demo
```

---

## 3. Daftar Akun Demo per Role

Password standar untuk seluruh akun demo di bawah ini adalah:
**`DemoRegas2026!`**

| Role | Email Login | Password | Divisi | Deskripsi & Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `demo.admin@nusantararegas.com` | `DemoRegas2026!` | IT & Digital Solution | Kontrol penuh master report, assignment matriks, master pengguna, konfigurasi sistem. |
| **USER** | `demo.user@nusantararegas.com` | `DemoRegas2026!` | Distribusi Gas | Penyusun laporan: unggah submission Excel, melihat deadline terdekat, perbaikan revisi. |
| **PIC** | `demo.pic@nusantararegas.com` | `DemoRegas2026!` | Operasional ORF | Person In Charge: peninjau berkas tahap satu, permintaan revisi, monitoring cut-off. |
| **REVIEWER** | `demo.reviewer@nusantararegas.com` | `DemoRegas2026!` | Manajemen Kepatuhan | Reviewer persetujuan akhir (final approval), evaluasi kepatuhan jadwal kerja. |
| **MANAGEMENT** | `demo.management@nusantararegas.com` | `DemoRegas2026!` | Executive Management | Dashboard eksekutif: rekapitulasi progres laporan bulanan, realisasi target, tren divisi. |

---

## 4. Mekanisme Keamanan Login Demo

- Panel demo pada UI **hanya mengisi formulir email & password** secara otomatis untuk kenyamanan evaluator.
- Proses autentikasi tetap melewati verifikasi bcrypt hash, pembuatan JWT session, dan HTTP-only secure cookie yang sama dengan autentikasi normal.
- Tidak terdapat celah bypass autentikasi langsung.
