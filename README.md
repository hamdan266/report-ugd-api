# Emergency Response System 🚨

Sistem pelaporan darurat real-time yang dibangun dengan React.js untuk frontend dan Laravel untuk backend API. Sistem ini memungkinkan pengguna untuk melaporkan kejadian darurat dengan deteksi lokasi secara akurat, dan admin dapat mengelola serta memantau status laporan secara real-time.

## 📸 Tangkapan Layar (Screenshot)

Halaman Dashboard Admin

![Admin Dashboard](Tangkapan%20Layar/admin-dashboard.png)

Halaman Dashboard User

![User Dashboard](Tangkapan%20Layar/user-dashboard.png)

---

## 🌟 Fitur Utama

- **Otentikasi Aman**: Sistem login dan registrasi terpisah (berbasis peran) untuk Pengguna Umum dan Administrator.
- **Pelaporan Real-time**: Mengirimkan dan menerima pembaruan laporan darurat secara instan menggunakan WebSockets API.
- **Pelacakan Lokasi (GPS)**: Secara otomatis mendeteksi dan melampirkan lokasi koordinat pelapor saat membuat laporan darurat.
- **Dashboard Admin Terpusat**: Panel admin komprehensif untuk memantau, memperbarui status laporan, dan mengelola tindak lanjut keadaan darurat.
- **Desain Modern & Responsif**: Antarmuka pengguna (UI) yang menarik, intuitif, dan dioptimalkan untuk semua ukuran perangkat menggunakan Tailwind CSS terbaru.

## 💻 Tech Stack

**Frontend (Client - React):**

- [React.js](https://react.dev/) / Vite
- [Tailwind CSS v4](https://tailwindcss.com/)
- React Router DOM
- Context API (State Management)
- Axios (HTTP Client)
- Lucide React (Icons)

**Backend (API - Laravel):**

- [Laravel](https://laravel.com/) (PHP Framework)
- MySQL (Database)
- Laravel Sanctum (API Authentication)
- WebSockets (Real-time Broadcast)

---

## 🛠️ Persyaratan Sistem

Sebelum memulai instalasi secara lokal, pastikan Anda telah menginstal beberapa perangkat lunak berikut:

- **Node.js**: v16.x atau yang lebih baru (beserta npm)
- **PHP**: v8.1 atau yang lebih baru
- **Composer**: Dependency manager untuk PHP
- **MySQL**: Server database SQL

---

## 🚀 Panduan Instalasi & Konfigurasi

Ikuti langkah-langkah di bawah ini untuk menjalankan layanan API dan Aplikasi Web secara lokal.

### 1. Kloning Repositori

```bash
git clone https://github.com/hamdan266/report-ugd-api
cd report-ugd-api
```

### 2. Konfigurasi Backend (Laravel API)

Buka terminal dan arahkan ke direktori `api`.

```bash
cd api

# Instal semua dependensi PHP
composer install

# Salin file environment bawaan
copy .env.example .env

# Generate application key baru
php artisan key:generate
```

**Konfigurasi Database:**
Buka file `.env` yang berada di dalam folder `api`, lalu perbarui konfigurasi database Anda sesuai dengan MySQL lokal Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database_anda
DB_USERNAME=root
DB_PASSWORD=
```

Setelah database dikembalikan, jalankan perintah migrasi:

```bash
php artisan migrate
```

Jalankan server backend:

```bash
php artisan serve
```

_API sekarang berjalan di `http://localhost:8000`._

### 3. Konfigurasi Frontend (React Client)

Buka terminal/tab baru dan arahkan ke direktori `client`.

```bash
cd client

# Instal semua dependensi Node.js
npm install

# Jalankan development server
npm run dev
```

_Aplikasi web Frontend sekarang berjalan di `http://localhost:5173`._

---

## 📂 Struktur Proyek

Proyek ini menggunakan arsitektur Monorepo sederhana yang memisahkan antara frontend dan backend.

```text
📁 ugd/
├── 📁 api/                  # Backend API menggunakan Laravel
│   ├── app/                 # Models, Controllers, Middleware, dll.
│   ├── routes/              # Endpoint API (api.php)
│   ├── database/            # Migrations dan Seeders
│   └── ...
└── 📁 client/               # Frontend Client menggunakan React (Vite)
    ├── src/
    │   ├── components/      # UI Components yang dapat digunakan ulang
    │   ├── contexts/        # Auth Context & Global State
    │   ├── pages/           # Halaman utama (Login, Register, Dashboard)
    │   └── App.jsx          # Konfigurasi Routing Utama
    └── ...
```

---

## 🤝 Kontribusi

Saya sangat mengapresiasi kontribusi dalam bentuk apa pun! Jika Anda menemukan bug, memiliki saran fitur baru, atau ingin memperbaiki dokumentasi, silakan lakukan langkah berikut:

1. _Fork_ repositori ini.
2. Buat _branch_ fitur Anda (`git checkout -b feature/FiturKeren`).
3. _Commit_ perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4. _Push_ ke branch Anda (`git push origin feature/FiturKeren`).
5. Buat **Pull Request**.

---

Dibuat dengan ❤️ untuk sistem tanggap darurat yang lebih responsif dan aman!
