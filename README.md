# Ecromer Rental PS

Ecromer Rental PS adalah website rental PlayStation berbasis **JavaScript + Express.js**. Website ini dibuat untuk memenuhi ketentuan tugas: membuat web, menyimpan dokumentasi di GitHub, menambahkan README, dan siap dideploy.

## Fitur Utama

1. **Beranda**
   - Menampilkan branding Ecromer Rental PS.
   - Tombol menuju katalog dan form booking.

2. **Katalog Paket**
   - Menampilkan paket PS4, PS4 Pro, PS5, dan VIP Gaming Room.
   - Fitur pencarian paket berdasarkan nama, konsol, atau game.
   - Filter harga berdasarkan batas harga per jam.

3. **Booking Online**
   - Form data pelanggan: nama, WhatsApp, paket, tanggal, jam, durasi, jenis layanan, alamat, dan catatan.
   - Perhitungan total harga otomatis.
   - Validasi data pelanggan dari server.
   - Cek jadwal bentrok berdasarkan paket, tanggal, dan jam mulai.

4. **Dashboard Admin**
   - Melihat semua data booking.
   - Mengubah status booking: menunggu konfirmasi, dikonfirmasi, selesai, dibatalkan.
   - Menghapus booking.
   - Statistik total booking, booking menunggu, dan omzet potensial.

## Teknologi yang Digunakan

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- JSON file sebagai penyimpanan sederhana

## Struktur Folder

```bash
ecromer-rental-ps/
├── data/
│   ├── bookings.json
│   └── packages.json
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── booking.js
│   │   ├── catalog.js
│   │   └── main.js
│   ├── 404.html
│   ├── admin.html
│   ├── booking.html
│   ├── catalog.html
│   └── index.html
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Cara Menjalankan Project

Pastikan Node.js sudah terpasang di laptop.

1. Clone repository atau buka folder project.
2. Install dependency:

```bash
npm install
```

3. Jalankan server:

```bash
npm start
```

4. Buka browser:

```bash
http://localhost:3000
```

Untuk mode development:

```bash
npm run dev
```

## API Endpoint

### Cek server

```http
GET /api/health
```

### Mengambil data paket

```http
GET /api/packages
```

### Mengambil semua booking

```http
GET /api/bookings
```

### Membuat booking baru

```http
POST /api/bookings
```

Contoh body JSON:

```json
{
  "name": "Andi Saputra",
  "phone": "081234567890",
  "packageId": "ps5-standard",
  "date": "2026-06-15",
  "startTime": "19:00",
  "duration": 3,
  "serviceType": "ambil",
  "address": "-",
  "notes": "Minta 2 stik"
}
```

### Mengubah status booking

```http
PATCH /api/bookings/:id/status
```

Contoh body JSON:

```json
{
  "status": "dikonfirmasi"
}
```

### Menghapus booking

```http
DELETE /api/bookings/:id
```

## Cara Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit Ecromer Rental PS"
git branch -M main
git remote add origin https://github.com/username/ecromer-rental-ps.git
git push -u origin main
```

Ganti `username` dengan username GitHub masing-masing.

## Cara Deploy ke Render

1. Upload project ke GitHub.
2. Buka Render.
3. Pilih **New Web Service**.
4. Hubungkan repository GitHub.
5. Isi pengaturan:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Klik **Deploy Web Service**.

Catatan: project ini memakai file JSON sebagai database sederhana. Untuk versi produksi, sebaiknya gunakan database seperti MongoDB, MySQL, PostgreSQL, atau Firebase.

## Pembagian Tugas Kelompok

Contoh pembagian tugas untuk 2 sampai 4 anggota:

| Anggota | Tugas |
|---|---|
| Anggota 1 | Membuat UI beranda dan katalog |
| Anggota 2 | Membuat form booking dan validasi |
| Anggota 3 | Membuat API Express.js dan data JSON |
| Anggota 4 | Membuat dashboard admin, README, GitHub, dan deploy |

Jika kelompok hanya 2 orang, tugas bisa dibagi menjadi bagian frontend dan backend.

## Ide Pengembangan Lanjutan

- Login admin.
- Pembayaran DP online.
- Integrasi WhatsApp otomatis.
- Database MongoDB atau MySQL.
- Upload bukti pembayaran.
- Riwayat booking pelanggan.
