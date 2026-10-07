# WorkTrack — Sistem Monitoring Jadwal Laporan & Pekerjaan Berkala

**WorkTrack** adalah aplikasi web internal perusahaan *production-ready* untuk memonitor jadwal pekerjaan/laporan berkala, mengelola deadline individual, memberikan reminder/notifikasi berjenjang (eskalasi), memproses submission dokumen, menyimpan seluruh riwayat revisi (history versioning), serta menyediakan alur review dan persetujuan (approval) oleh PIC/Reviewer.

Aplikasi ini dibangun menggunakan data master dan struktur operasional dari file Excel:  
📁 `00 Draft_Jadwal_Laporan_Bulanan 2026 rev.xlsx`

---

## 1. TECH STACK

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet *Corporate Clean & Operational*
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Button, Badge, Card, Dialog, Table, Tabs, Input, Select)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Data Manipulation & Dates**: [date-fns](https://date-fns.org/) dengan locale Indonesia
- **Charts & Visualizations**: [Recharts](https://recharts.org/) (Donut distribution & Monthly submission trends)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

---

## 2. ARSITEKTUR & ALUR KERJA (CORE WORKFLOW)

```
[MASTER LAPORAN]
       │
       ▼
[PENUGASAN / ASSIGNMENT] ─── (Individual Target Final, Target Submit, Meeting Date)
       │
       ▼
[AUTOMATIC PERIOD GENERATION] ─── (12 Bulan / 4 Triwulan 2026)
       │
       ▼
[DEADLINE & REMINDER ENGINE] ─── (H-3, H-1, Hari H, Overdue & Eskalasi)
       │
       ▼
[PEKERJAAN SAYA] ─── (Mulai Kerjakan ➔ In Progress)
       │
       ▼
[SUBMIT PEKERJAAN] ─── (Submission Record v1, v2, ... / Never Overwrites)
       │
       ▼
[PIC & REVIEWER REVIEW] ─── (Approve / Request Revision with Notes)
       │
       ▼
[AUDIT TRAIL & MONITORING] ─── (Activity Log, On Time, Due Soon, Overdue Matrix)
```

---

## 3. STRUKTUR DATABASE (PRISMA SCHEMA)

1. **`User`**: Manajemen staf dan role (`ADMIN`, `USER`, `PIC`, `REVIEWER`), departemen, dan autentikasi.
2. **`Report`**: Master data jenis laporan (`frequency`: `MONTHLY`, `QUARTERLY`, `CUSTOM`).
3. **`ReportAssignment`**: Hubungan spesifik antara Laporan, Assignee, PIC, Reviewer, `targetFinal`, `targetSubmit`, dan `meetingDate`.
4. **`ReportPeriod`**: Entitas periode pekerjaan (misal: *Oktober 2026*, *Q3 2026*) beserta tanggal deadline aktual dan status (`PENDING`, `IN_PROGRESS`, `SUBMITTED`, `UNDER_REVIEW`, `REVISION`, `APPROVED`, `OVERDUE`).
5. **`Submission`**: Riwayat pengiriman berkas/file per versi (*versioning*). Setiap revisi menjadi entri baru dan riwayat lama tetap tersimpan.
6. **`Notification`**: Pusat reminder in-app dengan tracking eskalasi level 1 s.d. 3.
7. **`ActivityLog`**: Audit trail komprehensif untuk seluruh mutasi data dalam sistem.

---

## 4. DAFTAR AKUN PENGGUNA DEMO (TESTING)

Semua akun demo di-seed dengan password default: `password123`

| Nama Pengguna | Alamat Email | Role | Departemen / Tugas |
|---|---|---|---|
| **Administrator** | `admin@example.com` | `ADMIN` | Akses penuh master data & seluruh monitoring |
| **Rifky Fauzi** | `rifky@example.com` | `USER` | Assignee Laporan Operasional SPBD |
| **Hudan** | `hudan@example.com` | `PIC` | PIC Laporan TKDN (SHG) |
| **Ito** | `ito@example.com` | `PIC` | PIC Laporan SPBD, SEKPER, Holding |
| **Dimas** | `dimas@example.com` | `PIC` / `REVIEWER` | PIC & Reviewer ManRisk |
| **Sidiq** | `sidiq@example.com` | `PIC` / `REVIEWER` | PIC & Reviewer E&M / SPBD |
| **Herman** | `herman@example.com` | `REVIEWER` | Reviewer Approval Manajemen |

> **Fitur Quick Switch**: Pada pojok kanan atas Navbar (Menu Profil), terdapat tombol cepat untuk berganti peran tanpa perlu mengetik ulang kredensial.

---

## 5. CARA INSTALASI & MENJALANKAN LOKAL

### Prasyarat:
- Node.js v18+ atau v20+ / v22+
- PostgreSQL Server aktif

### Langkah Menjalankan:

```bash
# 1. Install dependensi
npm install

# 2. Konfigurasi Environment
# Sesuaikan connection string PostgreSQL pada file .env
# Contoh: DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/aims_db?schema=public"

# 3. Generate Prisma Client & Push Schema Database
npx prisma generate
npx prisma db push

# 4. Seed Database (Menggunakan Data Master Excel)
npm run db:seed

# 5. Jalankan Development Server
npm run dev
```

Buka browser pada: `http://localhost:3000`

---

## 6. FITUR & HALAMAN APLIKASI

1. **Dashboard Overview (`/`)**:
   - Kartu statistik (Total, Pending, In Progress, Submitted, Under Review, Approved, Overdue).
   - Grafik Donut komposisi status laporan (Recharts).
   - Grafik Batang tren penyerahan dan approval bulanan.
   - Widget batas waktu terdekat (Upcoming Deadlines) & daftar mendesak (Critical Overdue).
   - Feed riwayat aktivitas terkini.

2. **Jadwal Laporan (`/jadwal`)**:
   - Matriks operasional lengkap 20 laporan master dari Excel.
   - Filter cepat berdasarkan Bulan/Periode, Departemen, PIC, dan Status.
   - Pencarian real-time nama laporan, kode, dan personil.
   - Aksi langsung: Submit Laporan, Review PIC, dan Buka Detail.

3. **Pekerjaan Saya (`/pekerjaan`)**:
   - Daftar tugas khusus untuk user yang sedang login.
   - Tab kategori status (Belum Dikerjakan, In Progress, Perlu Revisi, Selesai, Terlambat).
   - Indikator countdown waktu deadline (contoh: *🔴 4 jam lagi*, *Terlambat 2 hari*).
   - Tombol *Mulai Kerjakan* dan *Submit Pekerjaan*.

4. **Detail Pekerjaan (`/pekerjaan/[id]`)**:
   - Informasi lengkap penugasan, panduan cut-off, PIC, dan Reviewer.
   - Alur linimasa progres pengerjaan (Workflow Timeline).
   - Riwayat versi submission lengkap (Submission #1, Submission #2, catatan revisi, approval note).
   - Modal interaktif untuk submit berkas atau submit revisi.

5. **Kalender & Timeline (`/kalender`)**:
   - Visualisasi jadwal bulanan 2026 interaktif.
   - Penanda tanggal cut-off dan batas submit.
   - Panel drawer untuk melihat tugas pada tanggal yang dipilih.

6. **Monitoring Operasional (`/monitoring`)**:
   - Matriks pemantauan kepatuhan seluruh unit kerja.
   - Indikator visual: 🟢 *On Time*, 🟡 *Due Soon*, 🔵 *Under Review*, 🔴 *Overdue*.

7. **Submission Hub (`/submissions`)**:
   - Rekapitulasi seluruh berkas submission dari semua departemen.

8. **Pusat Notifikasi (`/notifikasi`)**:
   - Pengingat otomatis H-3, H-1, Hari H, dan status overdue.
   - Penanda eskalasi berjenjang (Level 1 User, Level 2 PIC, Level 3 Overdue).

9. **Riwayat Aktivitas & Audit Trail (`/history`)**:
   - Log lengkap seluruh mutasi data dan aksi pengguna di sistem.

10. **Master Data (`/master/reports`, `/master/users`, `/master/assignments`)**:
    - CRUD data master laporan, staf pengguna, dan penugasan matriks target submit.

---

## 7. SERVICE NOTIFIKASI & CRON REMINDER ENGINE

Engine notifikasi otomatis dapat dijalankan via HTTP trigger atau cron job:
- **Endpoint**: `GET /api/notifications/process`
- Fungsi engine:
  - `syncPeriodStatuses()`: Menandai periode yang melewati deadline menjadi `OVERDUE`.
  - `generateDeadlineNotifications()`: Menghasilkan notifikasi `DEADLINE_SOON` (H-3/H-1), `DEADLINE_TODAY` (Hari H), dan `OVERDUE` dengan pencegahan duplikasi data.

---

## 8. ARSITEKTUR INTEGRASI TAHAP 2 (MICROSOFT GRAPH & ONEDRIVE)

Database dan arsitektur telah disiapkan untuk tahap integrasi berikutnya:
- Kolom tabel `Submission`:
  - `onedriveFileId`
  - `onedriveFolderId`
  - `onedriveUrl`
- Alur kerja otomatis yang dirancang:
  1. User submit file di WorkTrack.
  2. Backend memanggil Microsoft Graph API dengan akun organisasi.
  3. Sistem membuat struktur folder otomatis: `WorkTrack/2026/{Bulan}/{Nama Laporan}/`.
  4. File diunggah ke OneDrive/SharePoint dan URL tersimpan di database.
#   W o r k f l o w - A i m s  
 