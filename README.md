# Utsmani Aqiqah

Website company profile + panel admin Utsmani Aqiqah, dibangun dengan Next.js 16 (App Router, Cache Components), Prisma 7, dan MySQL. Tema desain: Celestial & Starry Night (mockup di `mockups/`).

## Fitur

- **Website publik**: beranda, daftar harga paket (`/paket`), blog (`/blog`), formulir pemesanan (`/pesan`) yang menyimpan pesanan lalu meneruskan ringkasannya ke WhatsApp admin.
- **Panel admin** (`/admin`): dashboard, pesanan masuk, CRUD paket & harga, menu olahan, testimoni, galeri, kantor cabang, FAQ, blog, serta Pengaturan (logo, slider hero, kontak, ganti password).

## Kebutuhan

- Node.js 20.9+ (dikembangkan dengan Node 24)
- pnpm
- MySQL 8

## Setup pertama kali

```bash
pnpm install                 # pasang dependensi + generate Prisma client
cp .env.example .env         # lalu isi nilainya (lihat di bawah)
npx prisma migrate deploy    # buat tabel di database
npx prisma db seed           # isi data awal: paket, testimoni, FAQ, gambar, akun admin
```

Isi `.env`:

| Variabel         | Keterangan                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`   | `mysql://USER:PASSWORD@localhost:3306/utsmani_next`                        |
| `SESSION_SECRET` | String acak minimal 32 karakter, mis. hasil `openssl rand -base64 32`      |
| `ADMIN_EMAIL`    | Email akun admin awal (dibuat oleh seed)                                    |
| `ADMIN_PASSWORD` | Password akun admin awal — segera ganti lewat menu Pengaturan setelah login |
| `SITE_URL`       | (opsional) URL publik website, untuk metadata/OG dan link di pesan WA, mis. `https://utsmaniaqiqah.com` |
| `WA_GATEWAY_URL` | `https://wag.homeitop.web.id`                                               |
| `WA_API_KEY`     | API key dari dashboard gateway (User → Settings → Generate New API Key)     |
| `WA_SENDER`      | Nomor device gateway yang sudah di-scan & berstatus Connected, format 62…   |
| `WA_WEBHOOK_SECRET` | String acak untuk URL webhook, mis. hasil `openssl rand -hex 24`         |

User MySQL membutuhkan hak `CREATE` pada server bila menjalankan `prisma migrate dev` (untuk shadow database). Untuk `migrate deploy` cukup hak penuh pada database aplikasi.

## Menjalankan

**Development** (perubahan kode langsung terlihat):

```bash
pnpm dev
```

**Production**:

```bash
pnpm build
pnpm start            # atau: pnpm start -p 3100
```

Buka http://localhost:3000 — panel admin di http://localhost:3000/admin.

> `pnpm build` membutuhkan database yang aktif, karena halaman publik di-prerender dari data di database.

## Struktur singkat

```
prisma/
  schema.prisma        skema database
  migrations/          migrasi SQL
  seed.ts              data awal (dari situs WordPress lama)
  seed-assets/         gambar data awal, disalin seed ke storage/uploads/seed
src/
  app/(site)/          halaman publik
  app/admin/           panel admin (login, (panel)/…, actions.ts)
  app/uploads/         route handler penyaji file upload
  components/          komponen UI (site/, admin/)
  lib/                 db, session, queries (cache), settings, uploads, dll.
  proxy.ts             redirect /admin ke login bila belum masuk
storage/uploads/       file upload (tidak masuk git)
mockups/               mockup HTML & PNG desain awal
```

## Catatan penting

- **Cache konten**: data publik dibaca lewat fungsi `"use cache"` dengan tag (lihat `src/lib/queries.ts`). Setiap aksi admin memanggil `updateTag(...)`, sehingga perubahan langsung tampil tanpa build ulang.
- **File upload** disimpan di `storage/uploads/` dan disajikan oleh `src/app/uploads/[...path]/route.ts`. Folder ini tidak masuk git — sertakan dalam backup dan saat pindah server.
- **`.npmrc` berisi `node-linker=hoisted`**: proyek ini berada di partisi NTFS, dan dengan layout symlink bawaan pnpm, Turbopack gagal me-resolve `@prisma/client`. Jangan dihapus kecuali proyek dipindah ke filesystem Linux biasa.
- **Prisma client** digenerate ke `src/generated/prisma` (tidak masuk git). Jalankan `npx prisma generate` setelah mengubah `schema.prisma`.

## WhatsApp Gateway

Notifikasi otomatis lewat WA Gateway Homeitop (nomor gateway hanya mengirim):

- **Pesanan baru** → konfirmasi ke pelanggan + pemberitahuan ke admin (`whatsapp_primary`/`secondary` di Pengaturan) untuk menentukan CRM.
- **Admin memilih CRM** di detail pesanan → detail pesanan ke CRM, info kontak CRM ke pelanggan, salinan riwayat ke admin.
- **Pesan masuk** ke nomor gateway (webhook) → dicatat; kode `UA-…` dijawab status pesanan (hanya untuk nomor pemesan); balasan pelanggan diteruskan ke CRM-nya (salinan ke admin); auto-reply maks. sekali per 30 menit. Pesan dari grup dan staf (admin/CRM) tidak dibalas.

Kelola CRM di menu **CRM**, lihat semua pesan & kirim tes di **Log WhatsApp**. Template pesan ke pelanggan bisa diubah di Pengaturan.
Isi URL webhook (tampil di halaman Log WhatsApp) pada dashboard gateway → device → Webhook: `https://domain-anda/api/wa/webhook/{WA_WEBHOOK_SECRET}`.
Kode: `src/lib/whatsapp.ts` (klien gateway), `src/lib/wa-notify.ts` (alur notifikasi & webhook), `src/app/api/wa/webhook/[secret]/route.ts`.

## Troubleshooting

| Masalah                                    | Solusi                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Port 3000 sudah dipakai                    | `pnpm dev -p 3001`                                                                      |
| `Can't resolve '@prisma/client'`           | `npx prisma generate`; pastikan `.npmrc` berisi `node-linker=hoisted`, lalu hapus `node_modules` dan `pnpm install` ulang |
| Gagal konek database                       | Pastikan MySQL hidup (`sudo systemctl start mysql`) dan `DATABASE_URL` benar             |
| Gambar upload tidak muncul setelah pindah server | Salin folder `storage/uploads/` dari server lama                                   |
| Notifikasi WA tidak terkirim               | Buka Log WhatsApp: lihat keterangan error, pastikan device Connected & langganan aktif, lalu "Kirim ulang" |
| Lupa password admin                        | Ubah `ADMIN_EMAIL` ke email baru di `.env` lalu jalankan `npx prisma db seed` untuk membuat akun admin baru |
