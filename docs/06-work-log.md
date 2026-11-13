# Laporan pekerjaan

Catatan pekerjaan website Cagar Budaya Jakarta, disusun untuk laporan akhir. Perkembangan foto per objek tercatat terpisah di `Progres Foto Cagar Budaya.xlsx` (folder foto asli), sheet **Riwayat**.

## Ringkasan per 13 November 2026

| Butir                    | Status                                                 |
| ------------------------ | ------------------------------------------------------ |
| Cagar budaya di website  | 333 objek, masing-masing satu halaman (ID dan EN)      |
| Objek yang sudah berfoto | 81 objek, 418 foto                                     |
| Folder foto              | 333 folder dipetakan ke objek; 252 masih kosong        |
| Model 3D                 | 5 museum                                               |
| Pratinjau                | Cloudflare (sementara, dilepas saat serah terima)      |
| Pemasangan akhir         | Server Apache Disbud, serah terima akhir November 2026 |

## 1. Fondasi (2–4 November 2026)

- Website katalog statis dengan Next.js (static export), dua bahasa: Indonesia di `/`, Inggris di `/en/`.
- Skrip impor Excel Disbud → `data/heritage-sites.json`, dengan laporan baris bermasalah (`data/import-report.csv`). Kolom narahubung (nama dan telepon) tidak pernah dibaca atau diterbitkan.
- Halaman: Beranda (carousel foto), Jelajah (pencarian, filter, grid/daftar/peta), detail per cagar budaya, detail kawasan, Model 3D, Tentang, 404.
- Pencarian di browser: tahan salah ketik, mengenali nama dahulu dan sinonim ID/EN, saran "Mungkin maksud Anda".
- Model 3D HBIM lima museum dikonversi dan dipasang di halaman gedungnya.
- SEO: judul dan deskripsi per halaman, sitemap, robots, data terstruktur.
- Pengalihan URL website HBIM lama dan header keamanan untuk Apache (`server/.htaccess`).
- Pratinjau di Cloudflare Workers.

## 2. Foto objek (7 November 2026)

- Alur foto: foto asli tetap di luar repo; `npm run photos` mengonversinya ke WebP (1600 px dan 640 px). Metadata foto (EXIF, GPS) dibuang.
- `data/photos.json` memetakan folder foto ke objek, berikut urutan dan keterangan tiap foto. Foto pertama menjadi sampul.
- Sheet progres foto dibuat otomatis setiap kali `npm run photos` dijalankan.
- Impor pertama: 25 objek, 97 foto.

## 3. Perbaikan tampilan dan pencarian (7–8 November 2026)

- Tema tunggal Dinas Kebudayaan dengan huruf Inter; tema lain dihapus.
- Pencarian: nama yang memuat semua kata yang diketik didahulukan, sehingga "gedung kantor" langsung menemukan Gedung Kantor Perum Peruri.
- Halaman detail ditata ulang: ringkasan di bawah judul, lencana jenis dan wilayah yang bisa diklik, sampul foto dengan tombol "Lihat N foto", lembar data memuat Jenis dan Wilayah.
- Galeri foto layar penuh: perbesar/perkecil (tombol, roda tetikus, cubit, ketuk dua kali), geser saat diperbesar, usap untuk pindah foto, layar penuh, tombol di bawah foto.
- Tautan peta diseragamkan: satu tombol "Buka di Google Maps", tanpa petunjuk arah.
- Daftar anggota kawasan dibatasi 6 per jenis, dengan tautan "Lihat semua" ke Jelajah.
- Jelajah menampilkan objek berfoto lebih dulu.
- Objek tanpa foto menampilkan ikon sesuai jenis.
- Tombol dan tautan kecil diperbesar area sentuhnya untuk ponsel.
- Email masukan (`hbimjakarta@gmail.com`) di footer, halaman Tentang, dan blok "Ada data yang kurang tepat?" di setiap halaman detail.
- Label lembar data versi Inggris: "Owned by" dan "Managed by".
- Panduan serah terima ke server Apache Disbud ditulis di [05-maintenance-guide.md](05-maintenance-guide.md#serah-terima-ke-server-disbud).

## 4. Foto tahap 2 (13 November 2026)

- Folder foto bertambah dari 73 menjadi 333, semuanya sudah dipetakan ke objek. Folder yang namanya mirip (dua "Bank Indonesia", dua "Museum Wayang", deretan gedung Kali Besar dan Jl. KH Mas Mansyur) dicocokkan lewat urutan folder dan alamat.
- 331 foto baru diperiksa satu per satu: sampul dipilih, urutan dan keterangan ditulis. 10 foto Gedung Tjipta Niaga yang nyaris sama tidak dipakai.
- Hasil: 81 objek berfoto (sebelumnya 25), 418 foto (sebelumnya 97).
- Sheet progres mendapat sheet **Riwayat** yang mencatat tanggal, jumlah objek dan foto, serta objek yang baru tampil atau bertambah fotonya setiap kali `npm run photos` dijalankan.

## Yang masih menunggu Disbud

- Izin dan lisensi foto (saat ini tertulis "Hak cipta dilindungi").
- Email resmi Disbud untuk menggantikan `hbimjakarta@gmail.com`.
- Domain akhir dan cara mengunggah ke server.
- Koordinat Stasiun Manggarai.
- Foto untuk 252 objek yang foldernya masih kosong.
