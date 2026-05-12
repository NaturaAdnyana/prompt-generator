# Prompt Generator

Aplikasi Next.js bergaya ChatGPT untuk membuat prompt reusable dari daftar value dinamis. Pengguna dapat:

- Mengelola beberapa interaksi/template dari sidebar yang bisa dibuka dan ditutup.
- Menambah, mengubah, dan menghapus value prompt dengan minimal 1 value aktif.
- Menyisipkan token `{{nama_value}}` ke template markdown tanpa mengedit hasil akhir secara manual.
- Menyalin prompt final yang sudah terisi value.
- Menyimpan workspace (interaksi aktif, template, dan semua value) secara otomatis di IndexedDB browser.
- Export konfigurasi ke JSON dan import JSON sebagai interaksi baru agar mudah dibagikan.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Scripts

- `npm run dev` — menjalankan server development.
- `npm run build` — membuat production build.
- `npm run lint` — menjalankan ESLint.

## Catatan penyimpanan

Workspace disimpan di IndexedDB pada browser yang sama, sehingga perubahan interaksi, value, dan template tetap tersedia saat halaman dibuka kembali. Gunakan fitur export JSON bila ingin memindahkan atau membagikan konfigurasi ke browser/perangkat lain.
