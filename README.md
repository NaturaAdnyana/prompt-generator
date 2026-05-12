# Prompt Generator

Aplikasi Next.js bergaya ChatGPT untuk membuat prompt reusable dari daftar value dinamis. Pengguna dapat:

- Memulai dari sidebar kosong tanpa list chat bawaan.
- Mengelola beberapa interaksi/template dari sidebar yang bisa dibuka dan ditutup.
- Menambah, mengubah, dan menghapus value prompt dengan minimal 1 value aktif di setiap interaksi.
- Menyisipkan token `{{nama_value}}` ke template markdown tanpa mengedit hasil akhir secara manual.
- Mengedit prompt memakai editor markdown dengan toolbar format dan preview markdown.
- Menyalin prompt final atau membukanya langsung di ChatGPT melalui URL `https://chatgpt.com/?q=...`.
- Menyimpan workspace (interaksi aktif, template, dan semua value) secara otomatis di IndexedDB browser.
- Export konfigurasi ke JSON dan import JSON sebagai interaksi baru agar mudah dibagikan.
- Mengakses UI berbahasa Indonesia atau Inggris lewat routing locale `/id` dan `/en`.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Middleware akan mengarahkan ke locale default `/id`.

## Scripts

- `npm run dev` — menjalankan server development.
- `npm run build` — membuat production build.
- `npm run lint` — menjalankan ESLint.

## Catatan penyimpanan

Workspace disimpan di IndexedDB pada browser yang sama, sehingga perubahan interaksi, value, dan template tetap tersedia saat halaman dibuka kembali. Gunakan fitur export JSON bila ingin memindahkan atau membagikan konfigurasi ke browser/perangkat lain.
