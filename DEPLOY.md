# Deploy ke aaPanel

Panduan memasang website Utsmani Aqiqah (Next.js 16 + Prisma 7 + MySQL) di VPS yang memakai aaPanel. Contoh di bawah memakai domain `utsmaniaqiqah.com`, folder `/www/wwwroot/utsmani-aqiqah`, dan port `3100` — sesuaikan bila berbeda.

Gambaran arsitektur:

```
Pengunjung ──HTTPS──> Nginx (aaPanel, SSL) ──reverse proxy──> next start :3100 (PM2) ──> MySQL
```

---

## 1. Siapkan software di aaPanel

Buka **App Store** di aaPanel, pasang:

| Software               | Catatan                                                     |
| ---------------------- | ----------------------------------------------------------- |
| **Nginx**              | versi stabil terbaru                                        |
| **MySQL**              | 8.x (atau MariaDB 10.6+)                                    |
| **Node.js version manager** | lalu dari dalamnya pasang Node **v22 LTS** atau v24 (minimal 20.9) |
| **PM2 Manager**        | opsional — aaPanel versi baru sudah menyertakan PM2 lewat menu *Website → Node Project* |

Setelah Node terpasang, aktifkan pnpm lewat SSH (atau **Terminal** di aaPanel):

```bash
node -v                       # pastikan >= 20.9
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm -v
```

> Bila `node`/`pnpm` tidak dikenal di terminal, pada Node.js version manager klik versi Node yang dipasang lalu pilih **Set as command line version** (atau tambahkan `/www/server/nodejs/vXX/bin` ke `PATH`).

## 2. Buat database

**Databases → Add database**:

- Database name: `utsmani_next`
- Username: `utsmani_next`
- Password: (generate, simpan)
- Access permission: **Local server**

Hasilnya dipakai untuk `DATABASE_URL`:

```
mysql://utsmani_next:PASSWORD@localhost:3306/utsmani_next
```

> Bila password mengandung karakter khusus (`@ : / ? # %`), encode dulu (mis. `@` → `%40`) atau buat ulang password hanya huruf+angka.

## 3. Upload kode

Pilih salah satu:

**a. Lewat Git** (disarankan, update lebih mudah)

```bash
cd /www/wwwroot
git clone <URL-REPO> utsmani-aqiqah
cd utsmani-aqiqah
```

**b. Lewat File Manager aaPanel** — kompres folder proyek **tanpa** `node_modules`, `.next`, `src/generated`, lalu upload ke `/www/wwwroot/utsmani-aqiqah` dan extract.

Bila pindah dari server lama, salin juga folder `storage/uploads/` (file upload admin, tidak ada di git).

## 4. Isi `.env`

```bash
cd /www/wwwroot/utsmani-aqiqah
cp .env.example .env
nano .env
```

Isi (lihat README untuk penjelasan tiap variabel):

```env
DATABASE_URL="mysql://utsmani_next:PASSWORD@localhost:3306/utsmani_next"
SESSION_SECRET="<hasil: openssl rand -base64 32>"
ADMIN_EMAIL="admin@utsmaniaqiqah.com"
ADMIN_PASSWORD="<password-kuat>"
SITE_URL="https://utsmaniaqiqah.com"
WA_GATEWAY_URL="https://wag.homeitop.web.id"
WA_API_KEY="<api-key-gateway>"
WA_SENDER="62xxxxxxxxxx"
WA_WEBHOOK_SECRET="<hasil: openssl rand -hex 24>"
```

Amankan file-nya: `chmod 600 .env`

## 5. Install, migrasi, seed, build

```bash
cd /www/wwwroot/utsmani-aqiqah
pnpm install --frozen-lockfile   # sekaligus generate Prisma client ke src/generated/prisma
npx prisma migrate deploy        # buat tabel
npx prisma db seed               # data awal + akun admin (HANYA saat instalasi pertama)
pnpm build                       # butuh database aktif, halaman publik di-prerender dari DB
```

Uji cepat sebelum didaftarkan ke panel:

```bash
pnpm start -p 3100
# di terminal lain: curl -I http://127.0.0.1:3100  → harus 200
# Ctrl+C untuk berhenti
```

> Jika build gagal karena RAM habis (VPS 1 GB), tambahkan swap 2 GB lewat aaPanel (**Linux Tools → Swap**) atau build dengan `NODE_OPTIONS=--max-old-space-size=1536 pnpm build`.

## 6. Daftarkan sebagai Node Project

**Website → Node Project → Add Node project**:

| Field             | Isi                                              |
| ----------------- | ------------------------------------------------ |
| Project directory | `/www/wwwroot/utsmani-aqiqah`                    |
| Project name      | `utsmani-aqiqah`                                 |
| Run opt / command | `start` (script dari package.json) — atau custom: `node_modules/.bin/next start -p 3100` |
| Port              | `3100`                                           |
| Run user          | `www` (atau `root` bila ada masalah izin, lihat catatan) |
| Node version      | versi yang dipasang di langkah 1                 |
| Package manager   | pnpm (bila tersedia; jangan biarkan panel menjalankan `npm install`) |
| Domain            | `utsmaniaqiqah.com` dan `www.utsmaniaqiqah.com`  |

Bila memakai command `start` biasa, pastikan port-nya 3100 — paling aman pakai command custom di atas, atau ubah script di package.json menjadi `"start": "next start -p 3100"`.

Penting:

- **Working directory harus root proyek** — file upload ditulis ke `process.cwd()/storage/uploads`.
- Bila *Run user* = `www`, berikan izin tulis:
  ```bash
  mkdir -p /www/wwwroot/utsmani-aqiqah/storage/uploads
  chown -R www:www /www/wwwroot/utsmani-aqiqah
  ```
- Centang **Start on boot** / auto-restart.

<details>
<summary>Alternatif: tanpa menu Node Project (PM2 manual)</summary>

```bash
cd /www/wwwroot/utsmani-aqiqah
pnpm add -g pm2      # atau npm i -g pm2
pm2 start node_modules/.bin/next --name utsmani-aqiqah --cwd /www/wwwroot/utsmani-aqiqah -- start -p 3100
pm2 save
pm2 startup          # jalankan perintah yang ditampilkan
```

Lalu buat situs biasa di **Website → Add site** (PHP: *Static*), dan pasang reverse proxy ke `http://127.0.0.1:3100` lewat tab **Reverse proxy**.
</details>

## 7. SSL (wajib)

Di pengaturan situs/project → **SSL → Let's Encrypt** → centang domain → Apply, lalu aktifkan **Force HTTPS**.

HTTPS wajib: cookie login admin memakai flag `secure` di production, jadi tanpa HTTPS admin tidak bisa login.

## 8. Konfigurasi Nginx

Buka **Config** (file konfigurasi Nginx) situs tersebut dan pastikan ada:

```nginx
client_max_body_size 10m;   # upload gambar admin maks 5 MB
```

Dan di blok `location /` reverse proxy (biasanya sudah dibuat panel), pastikan header ini ada:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Matikan cache/proxy-cache bawaan panel untuk situs ini bila ada — Next.js sudah mengatur cache sendiri, dan halaman admin tidak boleh di-cache.

Simpan, lalu buka `https://utsmaniaqiqah.com` dan `https://utsmaniaqiqah.com/admin`.

## 9. Setelah online

1. Login admin → **Pengaturan → ganti password** (password dari `.env` hanya untuk awal).
2. Halaman **Log WhatsApp** menampilkan URL webhook; pasang di dashboard gateway → device → Webhook:
   `https://utsmaniaqiqah.com/api/wa/webhook/<WA_WEBHOOK_SECRET>`
3. Kirim pesan tes dari halaman Log WhatsApp.
4. Firewall (**Security**): cukup buka port 80, 443, SSH, dan port panel. **Jangan** buka port 3100 dan 3306 ke publik.

## 10. Update aplikasi

```bash
cd /www/wwwroot/utsmani-aqiqah
git pull
pnpm install --frozen-lockfile
npx prisma migrate deploy        # bila ada migrasi baru
pnpm build
```

Lalu **Restart** project di Website → Node Project (atau `pm2 restart utsmani-aqiqah`).
Jangan jalankan `prisma db seed` lagi pada database yang sudah berisi data.

## 11. Backup

Yang perlu dibackup rutin:

- **Database** `utsmani_next` → aaPanel **Cron → Backup Database** (harian).
- **Folder** `/www/wwwroot/utsmani-aqiqah/storage/uploads` → **Cron → Backup Directory**.
- File `.env` (simpan salinannya di tempat aman, terpisah dari server).

## Troubleshooting

| Gejala                                          | Penyebab / solusi                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 502 Bad Gateway                                 | Aplikasi tidak jalan / port beda. Cek log project di Node Project (atau `pm2 logs utsmani-aqiqah`), pastikan port proxy = port aplikasi. |
| `pnpm build` gagal konek database               | Cek `DATABASE_URL`, MySQL hidup, user punya akses ke database.                                       |
| `Can't resolve '@prisma/client'` / modul generated tidak ada | Jalankan `npx prisma generate`, lalu build ulang.                                           |
| Tidak bisa login admin (kembali ke halaman login) | Situs dibuka lewat HTTP, bukan HTTPS. Pasang SSL + Force HTTPS.                                    |
| Upload gambar gagal / `413 Request Entity Too Large` | Naikkan `client_max_body_size` di Nginx.                                                       |
| Upload gagal `EACCES`                           | Izin folder: `chown -R www:www storage` (sesuai *Run user*).                                        |
| Gambar lama hilang setelah pindah server        | Salin `storage/uploads/` dari server lama.                                                           |
| Perubahan kode tidak tampil                     | Lupa `pnpm build` dan restart setelah `git pull`.                                                    |
| Build terhenti tanpa pesan jelas (`Killed`)     | RAM kurang — tambahkan swap (lihat langkah 5).                                                       |
