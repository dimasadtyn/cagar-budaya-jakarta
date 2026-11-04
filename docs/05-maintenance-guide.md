# Panduan pengelolaan data

Untuk petugas yang memperbarui isi website. Website ini statis: tidak ada panel admin. Data diubah lewat Excel dan beberapa berkas JSON, lalu website dibangun ulang dan diunggah.

## Yang perlu disiapkan sekali

1. Node.js 24 dan Git.
2. Salin repo ini, lalu jalankan `npm install` di foldernya.
3. Buat berkas `.env.local` berisi alamat website:

   ```
   NEXT_PUBLIC_SITE_URL=https://alamat-website-disbud
   ```

   Alamat ini dipakai untuk sitemap, tautan kanonik, dan pratinjau saat dibagikan ke media sosial.

## Memperbarui data dari Excel

1. Simpan Excel baru di `data/source/` dengan nama aslinya. Jangan menimpa versi lama, dan catat di `data/source/README.md`.
2. Jalankan `npm run import`. Skrip mengambil Excel terbaru di folder itu.
3. Buka `data/import-report.csv`. Isinya baris yang bermasalah: koordinat tak terbaca, kepemilikan kosong, nama yang tidak ketemu pasangannya di sheet perwilayah. Perbaiki di Excel bila bisa, lalu impor ulang.
4. Periksa perubahan `data/heritage-sites.json` (misalnya dengan `git diff`). Objek baru, slug yang berubah, atau objek yang hilang harus disengaja.
5. Jalankan `npm run build`. Bila data rusak, build berhenti dengan pesan galat yang menyebut objek dan isiannya.

Kolom narahubung (nama dan nomor telepon) di Excel tidak pernah dibaca skrip. Jangan menambahkannya.

## Menambah deskripsi, kondisi, foto, dan bacaan

Isian yang tidak ada di Excel ditulis di `data/supplements.json`, dikelompokkan per slug objek (bagian akhir URL halaman detailnya). Daftar isian lengkap dan contohnya ada di [02-data-schema.md](02-data-schema.md#isian-tambahan-datasupplementsjson).

```json
{
  "museum-bahari": {
    "foto": [
      {
        "berkas": "/photos/museum-bahari/tampak-depan.webp",
        "kredit": "Dinas Kebudayaan DKI Jakarta",
        "lisensi": "CC BY 4.0",
        "sumber_url": "https://..."
      }
    ],
    "bacaan_terkait": [{ "judul": "Judul buku atau artikel", "url": "https://...", "keterangan": "Penerbit, tahun" }]
  }
}
```

- Berkas foto diletakkan di `public/photos/...`, format WebP, sisi panjang sekitar 1600 px.
- **Hanya foto yang boleh dipakai untuk keperluan komersial** (milik Disbud, atau berlisensi CC BY / CC BY-SA / CC0). Kredit dan lisensi wajib diisi; keduanya tampil di bawah foto.
- Foto pertama dipakai di kartu, halaman detail, dan pratinjau media sosial.

## Mengoreksi data dari Excel

Nilai Excel yang keliru atau kosong, misalnya koordinat, dikoreksi di `data/corrections.json` per ID objek (kolom `id` di `heritage-sites.json`). Jangan mengedit `heritage-sites.json` langsung: berkas itu ditulis ulang setiap `npm run import`.

```json
{ "cb-0123": { "koordinat": { "lat": -6.137, "lng": 106.813 } } }
```

Koordinat ditulis dalam derajat desimal; lintang Jakarta selalu negatif. Di Google Maps, klik kanan titik bangunannya lalu klik angka koordinat yang muncul untuk menyalinnya. Setelah mengubah `corrections.json`, jalankan `npm run import`.

Bila sebuah nama di sheet utama tidak ketemu pasangannya di sheet perwilayah, pasangkan manual di `data/manual-matches.json`:

```json
{ "cb-0123": { "nama": "nama persis di sheet perwilayah", "alamat": "alamat persis di sheet perwilayah" } }
```

## Foto beranda dan model 3D

- Carousel beranda: `data/home.json` (slug objek, berkas foto, teks alternatif, kredit, lisensi) dan daftar "Pernah bernama lain".
- Model 3D: `data/3d-models.json` (berkas model dan gambar point cloud). Kuncinya nama museum dalam huruf kecil. Isi `model` dengan `null` bila modelnya belum tersedia; halaman akan menampilkan "Model 3D sedang diperbarui".

### Memperbarui model 3D

1. Di Revit, buka model museum lalu **File → Export → IFC**. Simpan ke `data/source/models/` dengan nama yang tercantum di `MUSEUM` dalam `scripts/ifc-to-glb.py`.
2. Sekali saja: pasang Python 3, lalu `pip install -r scripts/requirements.txt`.
3. Jalankan `npm run models` (semua museum) atau `python scripts/ifc-to-glb.py wayang` (satu museum).
4. Hasilnya `public/models/<museum>/model.glb`. Periksa di halaman museum tersebut sebelum build.

Warna per jenis elemen diatur di `WARNA` dan `MUSEUM` pada skrip yang sama.

## Memasang di server

1. `npm run build` menghasilkan folder `out/`.
2. Unggah seluruh isi `out/` ke folder website di server.
3. Server Apache: salin juga `server/.htaccess` ke folder yang sama. Server nginx: masukkan isi `server/nginx.conf` ke blok `server { }` situs ini.
4. Periksa beberapa halaman, termasuk satu URL lama (misalnya `/situs-museum-bahari`) yang harus beralih ke halaman barunya.

## Bila ada masalah

| Gejala                         | Penyebab yang biasa                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Build gagal dengan pesan zod   | Isian di `corrections.json` atau JSON lain salah bentuk. Pesan galat menyebut jalurnya       |
| Objek hilang setelah impor     | Baris di Excel terhapus atau namanya berubah sehingga slug berubah; lihat `data/id-map.json` |
| Peta kosong saat `npm run dev` | Jalankan ulang `npm run dev` supaya berkas `public/maplibre-gl-worker.js` tersalin           |
| Objek tidak muncul di peta     | Koordinatnya kosong atau di luar wilayah Jakarta; lihat `import-report.csv`                  |
