# PRD: Website Cagar Budaya Jakarta

Versi 0.1 · 30 Oktober 2026 · disusun dari presentasi usulan redesign dan masukan rapat dengan Disbud 30 Oktober 2026.

## 1. Ringkasan

Website katalog publik untuk 333 cagar budaya DKI Jakarta. Setiap cagar budaya punya satu halaman. Pengunjung bisa mencari lewat nama kini atau nama dahulu, menyaring menurut jenis, wilayah, kepemilikan, dan kawasan, lalu melihat lokasinya di peta. Model 3D (HBIM) lima museum yang sudah ada dipasang di halaman gedungnya masing-masing.

Website dibangun sebagai halaman statis dan dipasang di server website Dinas Kebudayaan. Tidak ada basis data, panel login, atau CMS.

## 2. Pengguna

| Pengguna                 | Kebutuhan utama                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Masyarakat dan wisatawan | Tahu gedung apa ini, nilai pentingnya, dan lokasinya, sering dari ponsel di lokasi |
| Pelajar dan peneliti     | Nama dahulu, dasar penetapan (SK), bacaan terkait                                  |
| Pemilik dan perencana    | Status penetapan, kepemilikan, batas kawasan                                       |
| Pengelola di Disbud      | Memperbarui data lewat Excel, tanpa menyentuh kode                                 |

## 3. Masukan rapat 30 Oktober 2026

| #   | Masukan                                                                   | Keputusan                                                                                                              |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Halaman awal berupa carousel foto penuh: sisi kiri blur, sisi kanan jelas | Masuk. Lihat Beranda di bagian 4.1                                                                                     |
| 2   | Kategori berdasarkan formulir                                             | Cukup lima jenis: Benda, Struktur, Bangunan, Situs, Kawasan                                                            |
| 3   | Nomor memakai nomor SK                                                    | Nomor SK ditampilkan. Nomor ini tidak unik (226 objek berbagi Kepgub 475/1993), jadi tidak dipakai sebagai ID atau URL |
| 4   | Periode dibangun dihilangkan                                              | Dihapus dari halaman dan filter                                                                                        |
| 5   | Tambahkan kepemilikan: Pemerintah atau Non-pemerintah                     | Masuk sebagai isian dan filter                                                                                         |
| 6   | Jam buka/tutup dihapus                                                    | Dihapus                                                                                                                |
| 7   | Timeline dihapus, sejarah tetap ada                                       | Bagian Sejarah diisi dari "Catatan Nilai Penting"                                                                      |
| 8   | "Sumber" diganti "Bacaan terkait"                                         | Ganti label                                                                                                            |

Keputusan lanjutan (disetujui 30 Oktober 2026): nama pemilik perorangan tidak ditampilkan; cukup "Non-pemerintah · Perorangan". Nama instansi dan badan usaha boleh tampil.

## 4. Halaman

### 4.1 Beranda `/`

- **Hero carousel** foto penuh selebar layar, 4–6 foto. Panel kiri (sekitar 40% lebar di desktop) memakai versi foto yang diburamkan dan berisi judul, satu kalimat pengantar, dan kotak pencarian. Sisi kanan menampilkan foto yang tajam dengan nama cagar budaya dan kredit foto.
  - Berganti otomatis paling cepat tiap 7 detik, berhenti saat disentuh/di-hover, punya tombol jeda dan indikator posisi.
  - Tidak berganti otomatis bila pengguna memilih `prefers-reduced-motion`.
  - Di ponsel: foto di atas, panel teks di bawah (tanpa blur bertumpuk).
- Jalan masuk per jenis (5 kartu dengan jumlah) dan per wilayah (6 kota/kabupaten administrasi).
- Daftar "Pernah bernama lain": cagar budaya yang punya nama dahulu.
- Model 3D: tautan ke lima museum yang punya model HBIM.

### 4.2 Jelajah `/jelajah/`

- Pencarian teks: nama kini, nama dahulu, alamat, kelurahan, kecamatan, kawasan, jenis, wilayah, nomor SK, sejarah, dan deskripsi. Tahan salah ketik ("musium bahri"), mencocokkan awalan kata, mengenali sinonim ID/EN (mesjid → masjid, church → gereja), dan mengurutkan hasil menurut relevansi.
- Bila hasil hanya didapat lewat toleransi salah ketik, tampil saran "Mungkin maksud Anda: …" yang bisa diklik.
- Riwayat 5 pencarian terakhir disimpan di `localStorage` browser pengunjung (tidak dikirim ke mana pun) dan tampil di bawah kotak pencarian beranda dan Jelajah. Pencarian yang salah ketik tidak dicatat.
- Filter (bisa digabung): jenis, wilayah, kecamatan, kepemilikan, kawasan/area (Kota Tua, Onrust, Menteng, Kebayoran Baru), punya model 3D.
- Tiga tampilan: grid kartu, daftar ringkas, peta.
- Status filter tersimpan di URL (`?jenis=bangunan&wilayah=jakarta-barat`) supaya bisa dibagikan.
- Semua berjalan di browser dari satu berkas indeks; tidak ada server.

### 4.3 Detail cagar budaya `/{jenis}/{slug}/`

Contoh: `/bangunan/masjid-al-azhar/`. Satu template untuk lima jenis, urutan bagian:

1. Judul: nama kini, nama dahulu (bila ada), nomor SK, jenis, wilayah, kondisi umum (bila ada).
2. Lembar data: nomor SK, jenis, rincian per jenis (arsitek, gaya, bahan, ukuran, dst., bila ada), kepemilikan, pemilik/pengelola (instansi saja), alamat, kelurahan/kecamatan/wilayah, kawasan induk.
3. Deskripsi fisik (bila ada).
4. Sejarah: dari "Catatan Nilai Penting", berupa paragraf tanpa timeline.
5. Model 3D (hanya lima museum): model HBIM yang disajikan dari situs sendiri, dengan tab model dan album point cloud.
6. Kondisi keterawatan per elemen, lingkungan, dan keterancaman (bila ada).
7. Lokasi: peta kecil, akses terdekat dan batas-batas (bila ada), tautan "Buka di peta".
8. Bacaan terkait (bila ada).
9. Cagar budaya di sekitar: lima terdekat menurut koordinat.

Isian 1–3 dan 6–8 yang tidak ada di Excel diisi lewat `data/supplements.json` (lihat skema data).

Bagian yang datanya kosong tidak ditampilkan. Halaman tetap harus terlihat utuh walau hanya berisi judul, lembar data, sejarah satu kalimat, dan lokasi; ini kondisi mayoritas data saat ini.

Tombol tetap: bagikan, salin tautan.

### 4.4 Detail kawasan `/kawasan/{slug}/`

Template yang sama ditambah daftar cagar budaya di dalam kawasan (dengan filter jenis) dan peta sebarannya.

### 4.5 Halaman pendukung

- `/tentang/`: tentang katalog, dasar hukum, kontak Disbud.
- `/model-3d/`: daftar lima museum ber-model HBIM (pengganti `/hbim`, `/point-clouds`, `/plan-section`).
- Halaman 404.

## 5. Pengalihan URL lama

Semua URL website HBIM lama harus mengarah ke halaman baru (pengalihan 301 di konfigurasi server, lihat dokumen teknis).

| URL lama                                                                                | Tujuan                                                                             |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/situs-museum-{nama}`                                                                  | `/bangunan/{slug-museum}/`                                                         |
| `/hbim`, `/point-clouds`, `/plan-section`                                               | `/model-3d/`                                                                       |
| `/keadaan-bangunan`, `/keadaan-bangunan-museum-*`                                       | `/model-3d/`                                                                       |
| `/tentang-kami`                                                                         | `/tentang/`                                                                        |
| `/arsip-*`, `/literatur-sejarah`, `/sumber-referensi`, `/arsip-referensi`, `/glosarium` | Belum diputuskan (lihat Pertanyaan terbuka)                                        |
| `/en/about-us`, `/en/site-*`, `/en/hbim` dst.                                           | Padanannya di `/en/` (mis. `/en/about/`, `/en/building/{slug}/`, `/en/3d-models/`) |

## 6. Kebutuhan non-fungsional

- **Ponsel dulu**: satu kolom di bawah 768 px, target sentuh minimal 44 px.
- **Aksesibilitas**: WCAG 2.2 AA; kontras teks di atas foto/blur diuji; carousel bisa dihentikan; status tidak hanya dibedakan warna.
- **Kinerja**: Lighthouse Performance ≥ 90 di ponsel untuk Beranda, Jelajah, dan satu halaman detail. Foto hero dalam WebP/AVIF beberapa ukuran.
- **SEO**: judul dan deskripsi unik per halaman, `sitemap.xml`, `robots.txt`, data terstruktur (`LandmarksOrHistoricalBuildings`, `BreadcrumbList`).
- **Privasi**: tidak ada nama atau nomor telepon perorangan di website, di berkas data, maupun di repo.
- **Lisensi**: semua foto berlisensi yang boleh dipakai komersial, kredit tercantum di halaman.

## 7. Tidak dikerjakan (fase ini)

- CMS atau panel admin. Data diperbarui lewat Excel dan build ulang.
- Terjemahan isi data (nama, sejarah, alamat) ke bahasa Inggris. Antarmuka sudah dua bahasa; isi data tampil dalam bahasa Indonesia di halaman `/en/`.
- Pemodelan 3D baru, pendataan lapangan, pemotretan baru.
- Data kondisi keterawatan, arsitek, gaya (belum ada di Excel; isian disiapkan opsional).
- Periode dibangun, jam buka, timeline (dihapus atas masukan rapat).

## 8. Kriteria selesai

- [ ] 333 cagar budaya dari Excel tampil, masing-masing dengan halaman sendiri.
- [ ] Skrip impor menghasilkan `data/heritage-sites.json` dan laporan baris bermasalah tanpa intervensi manual.
- [ ] Pencarian menemukan objek lewat nama dahulu (contoh: "Landhuis Vredestein" → Asrama Perikanan).
- [ ] Filter jenis + wilayah + kepemilikan bisa digabung dan tersimpan di URL.
- [ ] Peta menampilkan semua objek yang punya koordinat valid.
- [ ] Lima museum menampilkan model 3D di halaman detailnya.
- [ ] Semua URL lama di bagian 5 dialihkan.
- [ ] Lolos kebutuhan non-fungsional di bagian 6.
- [ ] Panduan pengelolaan data (Excel → build → unggah) diserahkan.

## 9. Jadwal

Mengikuti presentasi: 2–27 November 2026.

| Tanggal    | Tonggak                                    |
| ---------- | ------------------------------------------ |
| Jum 6 Nov  | Persetujuan arah final; skema data dikunci |
| Jum 13 Nov | Batas data dan foto dari Disbud            |
| Jum 20 Nov | Pemeriksaan isi bersama Disbud             |
| Kam 26 Nov | Pemasangan di server Disbud                |
| Jum 27 Nov | Website tayang; serah terima               |

## 10. Pertanyaan terbuka

| #   | Pertanyaan                                                                                                                                                | Untuk        | Dampak bila belum dijawab                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| 1   | Jenis server website Disbud (Apache/nginx/lainnya) dan cara mengunggah                                                                                    | Disbud (TI)  | Pengalihan URL dan pemasangan tidak bisa diuji     |
| 2   | Halaman arsip, literatur, dan glosarium lama: dipindahkan, digabung ke "Bacaan terkait", atau dihapus?                                                    | Disbud       | Pengalihan URL bagian 5 belum lengkap              |
| 3   | Foto untuk carousel dan halaman detail, beserta izinnya                                                                                                   | Disbud       | Pakai foto Wikimedia berlisensi terbuka sementara  |
| 4   | "Kawasan Kota Tua" tercatat di 6 baris: satu objek yang mencakup 6 kelurahan?                                                                             | Disbud       | Dianggap satu objek                                |
| 5   | Domain/alamat akhir website                                                                                                                               | Disbud       | Canonical URL dan sitemap memakai alamat sementara |
| 6   | Siapa yang membangun ulang website setelah serah terima                                                                                                   | Disbud + tim | Perlu kesepakatan pemeliharaan                     |
| 7   | Menteng dan Kebayoran Baru: kawasan cagar budaya yang sudah ditetapkan? Di Excel keduanya punya sheet sendiri tetapi tidak tercatat sebagai objek Kawasan | Disbud       | Hanya jadi filter "Area", tanpa halaman kawasan    |
