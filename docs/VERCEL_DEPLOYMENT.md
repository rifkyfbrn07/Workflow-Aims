# Panduan Deployment Vercel & Neon PostgreSQL — WorkTrack / AIMS

Dokumen ini adalah panduan resmi deployment untuk aplikasi **WorkTrack / AIMS (Pertamina Nusantara Regas)** berbasis **Next.js App Router**, **Prisma ORM**, **Neon PostgreSQL Serverless**, dan **Vercel Blob Storage**.

---

## 1. Environment Variables yang Dibutuhkan

Berikut adalah daftar seluruh environment variables yang wajib dikonfigurasi di dashboard Vercel:

| Variable Name | Keterangan | Contoh / Format Nilai | Lingkungan (Environment) |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Connection string PostgreSQL dari Neon (disarankan pooled connection untuk serverless) | `postgresql://<user>:<password>@<neon-hostname>/<dbname>?sslmode=require` | Production, Preview, Development |
| `AUTH_SECRET` | Secret key berkekuatan tinggi untuk enkripsi session token JWT cookie (min. 32 karakter) | String acak (contoh: hasil dari `openssl rand -base64 32`) | Production, Preview, Development |
| `BLOB_READ_WRITE_TOKEN` | Token otentikasi Vercel Blob untuk upload dokumen & arsip laporan | Diberikan otomatis saat membuat Vercel Blob Store | Production, Preview, Development |

> **PERINGATAN KEAMANAN:**
> - **JANGAN** pernah menambahkan prefix `NEXT_PUBLIC_` pada `DATABASE_URL`, `AUTH_SECRET`, atau `BLOB_READ_WRITE_TOKEN`.
> - Semua secret di atas hanya boleh diakses di sisi server (Server Components, Server Actions, Route Handlers).

---

## 2. Cara Memasukkan Environment Variables ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan pilih project **WorkTrack / AIMS**.
2. Masuk ke menu **Settings** > **Environment Variables**.
3. Tambahkan masing-masing variable:
   - **Key:** `DATABASE_URL` → **Value:** *(isi dengan connection string Neon)*
   - **Key:** `AUTH_SECRET` → **Value:** *(isi dengan random secret 32+ karakter)*
   - **Key:** `BLOB_READ_WRITE_TOKEN` → *(terisi otomatis jika Blob di-link via Storage tab, atau isi manual)*
4. Klik **Save**.

---

## 3. Scope Lingkungan (Production / Preview / Development)

- **Production:**
  - Wajib memiliki `DATABASE_URL` ke database Neon Production.
  - Wajib memiliki `AUTH_SECRET` unik khusus production.
  - Wajib memiliki `BLOB_READ_WRITE_TOKEN` production store.
- **Preview:**
  - Dapat menggunakan Neon branch (database isolated per preview branch) atau database staging.
- **Development:**
  - Digunakan saat menjalankan `vercel dev` atau local `.env`.

---

## 4. Konfigurasi Neon PostgreSQL

1. Buat database atau gunakan project Neon yang telah ada.
2. Pada dashboard Neon, salin **Connection String** pada opsi **Pooled Connection** (menggunakan PgBouncer / Neon connection pooling pada port 5432 / `-pooler` hostname).
3. Pastikan parameter `?sslmode=require` terpasang pada connection string.
4. Gunakan connection string tersebut sebagai nilai `DATABASE_URL` di Vercel.

---

## 5. Prisma Migration Deployment

Project ini menggunakan Prisma dengan workflow migrasi standar.

### Build Script di `package.json`
Build script telah dikonfigurasi sebagai:
```json
"build": "prisma generate && next build"
```
Ini memastikan bahwa `@prisma/client` selalu di-generate secara fresh di runtime environment Vercel saat setiap build berlangsung.

### Menjalankan Migrasi pada Neon
Sebelum melakukan rilis production atau ketika ada migrasi baru:
```bash
npx prisma migrate deploy
```
Command di atas akan menerapkan file migrasi dari folder `prisma/migrations/` ke Neon database tanpa menghapus data yang sudah ada (non-destructive).

---

## 6. Konfigurasi Vercel Blob Storage

1. Buka tab **Storage** pada Vercel Dashboard project.
2. Klik **Create Database** / **Create Store** dan pilih **Blob**.
3. Beri nama store (misal: `worktrack-blob-store`).
4. Hubungkan (Link) store tersebut ke project Anda.
5. Vercel secara otomatis menyediakan environment variable `BLOB_READ_WRITE_TOKEN`.
6. Seluruh berkas laporan diunggah ke Blob, dan URL serta metadata ukuran/tipe file disimpan di tabel `submissions` PostgreSQL.

---

## 7. Deployment Checklist

Sebelum memicu deployment baru di Vercel:

- [x] Schema Prisma tervalidasi (`npx prisma validate`).
- [x] Prisma Client berhasil di-generate (`npx prisma generate`).
- [x] Migrasi Neon telah diterapkan (`npx prisma migrate deploy`).
- [x] Type checking TypeScript lulus tanpa error (`npx tsc --noEmit`).
- [x] Production build Next.js lulus (`npm run build`).
- [x] `DATABASE_URL`, `AUTH_SECRET`, dan `BLOB_READ_WRITE_TOKEN` telah diatur di Vercel.
- [x] File `.env` dan `.env.local` tidak di-commit ke Git.
- [x] Seluruh Server Component dinamis menggunakan `export const dynamic = "force-dynamic"`.
- [x] Error boundary (`error.tsx`), loading UI (`loading.tsx`), dan 404 (`not-found.tsx`) tersedia.

---

## 8. Troubleshooting `DATABASE_URL`

| Gejala Error | Penyebab | Solusi |
| :--- | :--- | :--- |
| `PrismaClientInitializationError: Environment variable not found: DATABASE_URL` | Variable `DATABASE_URL` belum ditambahkan di Vercel Environment Variables | Tambahkan `DATABASE_URL` di Vercel Settings > Environment Variables, lalu lakukan *Redeploy*. |
| `Can't reach database server at ...` | Hostname salah atau koneksi dibatasi firewall | Pastikan connection string Neon memiliki format lengkap dan `sslmode=require`. |
| `Too many connections for database` | Serverless function membuka terlalu banyak koneksi langsung | Gunakan endpoint Pooled Connection Neon (`-pooler` hostname) pada `DATABASE_URL`. |

---

## 9. Troubleshooting Prisma Migration

| Gejala Error | Penyebab | Solusi |
| :--- | :--- | :--- |
| `Following migration have failed: ...` | Terjadi kegagalan parsial pada migrasi sebelumnya di Neon | 1. Periksa `_prisma_migrations` dengan inspect script.<br>2. Jika langkah SQL belum diterapkan, gunakan `prisma migrate resolve --rolled-back "<migration_name>"`.<br>3. Jalankan `prisma migrate deploy` ulang. |
| `ERROR: type "UserRole" does not exist` | Urutan pembuatan tipe enum berada setelah pembuatan tabel | Pastikan file `migration.sql` membuat enum `CREATE TYPE` sebelum `CREATE TABLE`. |

---

## 10. Troubleshooting Build

| Gejala Error | Penyebab | Solusi |
| :--- | :--- | :--- |
| `Type error: Property '...' does not exist on type '...'` | Ketidakcocokan tipe data Prisma Client | Jalankan `npx prisma generate` lalu periksa kembali dengan `npx tsc --noEmit`. |
| `Dynamic server usage: Page couldn't be rendered statically` | Halaman mengakses database/cookies tetapi dipaksa static | Pastikan halaman mengekspor `export const dynamic = "force-dynamic";`. |
