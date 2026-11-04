# Skema data

Versi 0.1 · 30 Oktober 2026 · dikunci bersama Disbud pada 6 November 2026.

Satu objek = satu cagar budaya. Kelima jenis (Benda, Struktur, Bangunan, Situs, Kawasan) memakai skema yang sama; isian yang tidak berlaku dibiarkan kosong dan bagiannya tidak tampil di website.

Sumber: `data/source/DT_20250813_DataCagarBudayaDinasKebudayaan_v01.xlsx`

- **U** = sheet "Update Data CB ~ 2026" (data utama, 333 objek)
- **W** = sheet "Data CB Perwilayah" (koordinat dan kepemilikan)
- **K** = sheet "CB Kawasan Kota Tua / Menteng / Kebayoran Baru / Onrust"

## Isian

| Isian                | Tipe                                                    | Wajib | Sumber                                         | Aturan                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------- | ----- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | string                                                  | ya    | dibuat skrip                                   | `cb-0001` dst. Dibuat sekali lalu disimpan di `data/id-map.json` supaya tidak berubah walau urutan Excel berubah                                                                                                                  |
| `slug`               | string                                                  | ya    | dari `nama`                                    | huruf kecil, tanda hubung, tanpa tanda baca. Maks. 70 karakter; awalan kelompok yang panjang dipendekkan. Bila bentrok: tambahkan nomor jalan (`-no-12`), lalu kelurahan, lalu angka. Disimpan di `data/id-map.json` bersama `id` |
| `nama`               | string                                                  | ya    | U: Nama cagar budaya, baris pertama            | Spasi dirapikan. Tanda kurung dipindah ke `nama_lain`                                                                                                                                                                             |
| `kelompok`           | string                                                  | null  | tidak                                          | U: baris pertama sel nama                                                                                                                                                                                                         | Untuk sel "nama kelompok ⏎ nama bagian", mis. "Golok Cakung ⏎ No.I" atau "Kompleks Gelanggang Olahraga Senayan ⏎ Stadion Aquatik". Lihat "Nama kelompok" di bawah |
| `nama_dahulu`        | string[]                                                | tidak | U: Nama cagar budaya, baris kedua dst.         | Sel berisi beberapa baris: baris pertama nama kini, sisanya nama dahulu. Contoh: "Asrama Perikanan⏎Landhuis Vredestein"                                                                                                           |
| `nama_lain`          | string[]                                                | tidak | U/W: teks dalam kurung                         | Contoh: "Masjid Al-Azhar (Masjid Agung Al-Azhar)". Ikut dicari, tidak ditonjolkan                                                                                                                                                 |
| `jenis`              | enum                                                    | ya    | U: kolom Benda/Struktur/Bangunan/Situs/Kawasan | Tepat satu kolom terisi; bila nol atau lebih dari satu → masuk laporan                                                                                                                                                            |
| `nomor_sk`           | string                                                  | ya    | U: Nomor SK                                    | Dinormalkan ke bentuk "Keputusan Gubernur DKI Jakarta Nomor 475 Tahun 1993". **Bukan ID**, tidak unik                                                                                                                             |
| `sk`                 | object                                                  | ya    | dari `nomor_sk`                                | `{ jenis: "Kepgub", nomor: "475", tahun: 1993 }` untuk penyaringan dan pengurutan                                                                                                                                                 |
| `wilayah`            | enum[]                                                  | ya    | U: Wilayah                                     | Slug: `jakarta-pusat` … `kepulauan-seribu`. Array karena kawasan bisa melintasi wilayah                                                                                                                                           |
| `kecamatan`          | string[]                                                | ya    | U: Kecamatan                                   | Spasi di ujung dibuang, huruf kapital diseragamkan                                                                                                                                                                                |
| `kelurahan`          | string[]                                                | ya    | U: Kelurahan                                   | Array karena kawasan bisa mencakup beberapa kelurahan (Kota Tua: 6)                                                                                                                                                               |
| `alamat`             | string                                                  | ya    | U: Alamat                                      | Apa adanya, spasi dirapikan                                                                                                                                                                                                       |
| `koordinat`          | `{lat, lng}` \| null                                    | tidak | W: Koordinat Lokasi                            | Lihat "Koordinat" di bawah                                                                                                                                                                                                        |
| `kawasan_induk`      | string \| null                                          | tidak | K                                              | Slug objek berjenis Kawasan (saat ini hanya Kota Tua dan Gugusan Pulau Onrust) bila objek tercantum di sheet kawasannya                                                                                                           |
| `area`               | string \| null                                          | tidak | K                                              | Untuk sheet Menteng dan Kebayoran Baru, yang belum tercatat sebagai objek Kawasan. Dipakai sebagai filter saja. Lihat temuan data #6                                                                                              |
| `kepemilikan`        | enum                                                    | ya    | W: Jenis Status Kepemilikan Aset               | `pemerintah` \| `non-pemerintah` \| `belum-ada-informasi`. Lihat pemetaan di bawah                                                                                                                                                |
| `kepemilikan_detail` | enum \| null                                            | tidak | W                                              | `swasta-yayasan` \| `perorangan` (hanya untuk non-pemerintah)                                                                                                                                                                     |
| `pemilik`            | string \| null                                          | tidak | W: Pemilik                                     | **Hanya bila instansi atau badan usaha.** Kosongkan bila perorangan                                                                                                                                                               |
| `pengelola`          | string \| null                                          | tidak | W: Pengelola                                   | Aturan sama dengan `pemilik`                                                                                                                                                                                                      |
| `nilai_penting`      | string                                                  | tidak | U: Catatan Nilai Penting                       | Ditampilkan sebagai bagian **Sejarah**. Teks HURUF BESAR semua diubah ke kapitalisasi kalimat                                                                                                                                     |
| `bacaan_terkait`     | `{judul, url?, keterangan?}[]`                          | tidak | `data/supplements.json`                        | Tampil sebagai bagian **Bacaan terkait**                                                                                                                                                                                          |
| `foto`               | `{berkas, kredit, lisensi, sumber_url?, keterangan?}[]` | tidak | `data/supplements.json`                        | Foto 1 = sampul, foto 2 di bagian Deskripsi, foto 3 di bagian Sejarah                                                                                                                                                             |
| `model_3d`           | object \| null                                          | tidak | `data/3d-models.json`                          | Hanya 5 museum. `{ model, point_cloud }`. `model` berupa jalur `.glb` di `public/models/`, atau `null` bila belum tersedia (tampil "sedang diperbarui")                                                                           |

## Isian tambahan (`data/supplements.json`)

Isian yang tidak ada di Excel diisi di `data/supplements.json`, dengan slug sebagai kunci. Isinya digabung ke data hasil impor saat build. Slug yang tidak dikenal membuat build gagal, supaya salah ketik langsung ketahuan. Semua isian boleh dihilangkan; bagian halamannya hanya tampil bila datanya ada.

| Isian                    | Tipe                                                                                               | Tampil di                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `deskripsi`              | string, paragraf dipisah baris baru                                                                | Bagian **Deskripsi**. Paragraf pertama tampil sebagai kalimat pembuka                                                                        |
| `rincian`                | `{tipe, arsitek, gaya, fungsi, bahan, ukuran, pembuat, lokasi_simpan, luas, zona}`, semua opsional | Lembar data, di bawah Jenis                                                                                                                  |
| `kondisi`                | `{tahun, umum?, elemen: {nama, tingkat}[], lingkungan?, keterancaman?}`                            | Bagian **Kondisi keterawatan**. `umum` juga tampil sebagai lencana di kepala halaman dan masuk ringkasan kondisi di halaman kawasan induknya |
| `batas`                  | `{utara?, timur?, selatan?, barat?}`                                                               | Bagian Lokasi, "Batas-batas"                                                                                                                 |
| `akses`                  | string                                                                                             | Bagian Lokasi, di bawah alamat (mis. stasiun atau halte terdekat)                                                                            |
| `lembar_pdf`             | `{berkas, ukuran_kb}`                                                                              | Tombol "Unduh lembar data (PDF)". Berkas diletakkan di `public/`                                                                             |
| `foto`, `bacaan_terkait` | lihat tabel di atas                                                                                |                                                                                                                                              |

`tingkat` dan `umum`: `terawat` \| `rusak-ringan` \| `rusak-sedang` \| `rusak-berat`.

Contoh:

```json
{
  "museum-bahari": {
    "deskripsi": "Deretan gudang panjang berlantai dua …\nDenahnya memanjang di tepi muara Ciliwung …",
    "rincian": { "arsitek": "…", "gaya": "…", "fungsi": "Museum" },
    "kondisi": {
      "tahun": 2022,
      "umum": "terawat",
      "elemen": [{ "nama": "Atap", "tingkat": "terawat" }],
      "keterancaman": "…"
    },
    "batas": { "utara": "Jl. Pasar Ikan" },
    "akses": "Terdekat: Stasiun KRL Jakarta Kota."
  }
}
```

**Dihapus atas masukan rapat:** periode dibangun, jam buka/tutup, timeline.

**Tidak pernah diimpor:** kolom "Narahubung Pemilik / Pengelola" (Nama, Keterangan, Nomor/Email) dan "Tahun Update Data". Skrip impor tidak membaca kolom-kolom ini sama sekali.

## Nama kelompok

Sel "Nama cagar budaya" punya dua pola:

1. **Nama kini ⏎ nama dahulu**: "Istana Merdeka ⏎ Koningsplein Paleis".
2. **Kelompok ⏎ bagian**: baris pertama berulang di beberapa baris Excel (Golok Cakung, Batu Penggilingan, Kompleks GOR Senayan, Kali Besar Timur/Barat, Langgam Cina Pekojan/Mansyur, dll.).

Skrip menganggap baris pertama sebagai kelompok bila muncul di ≥ 2 sel bernama banyak baris, atau bila baris kedua hanya berupa nomor ("No.I", "Bangunan 1", "Rumah/Toko No.16"). Untuk kelompok:

- bagian berupa nomor atau frasa pendek → `nama` = "kelompok + bagian" ("Golok Cakung No.I");
- bagian berupa nama bangunan sendiri → `nama` = bagian saja ("Stadion Aquatik"), kelompok disimpan di `kelompok`.

Baris yang diawali "Jl."/"Jalan" dibuang dari nama; baris yang diawali huruf kecil atau "(" disambung ke baris sebelumnya. Hasil yang masih keliru diperbaiki lewat `data/corrections.json`.

## Pemetaan kepemilikan

| Nilai di Excel (W)                     | `kepemilikan`       | `kepemilikan_detail` |
| -------------------------------------- | ------------------- | -------------------- |
| Negara                                 | pemerintah          | –                    |
| Swasta / Yayasan, Swasta / Yayasan     | non-pemerintah      | swasta-yayasan       |
| Perorangan, Perseorangan, Perseroangan | non-pemerintah      | perorangan           |
| kosong, "-", "Tidak ada Informasi"     | belum-ada-informasi | –                    |

Bila jenis kosong tetapi kolom Pemilik jelas instansi pemerintah (mengandung "Pemerintah Provinsi", "Pemprov", "Kementerian", "Dinas"), skrip mengisi `pemerintah` dan mencatatnya di laporan untuk dikonfirmasi.

Tampilan di website:

- `pemerintah` → "Pemerintah" (+ nama instansi bila ada)
- `non-pemerintah` + `swasta-yayasan` → "Non-pemerintah · Swasta/Yayasan" (+ nama badan bila ada)
- `non-pemerintah` + `perorangan` → "Non-pemerintah · Perorangan" (tanpa nama)
- `belum-ada-informasi` → "Belum ada informasi"

Nama pemilik dan pengelola hanya diambil bila jelas nama lembaga (mengandung PT, Yayasan, Masjid, Gereja, Bank, Kementerian, Dinas, Museum, dan sejenisnya; daftar lengkapnya `LEMBAGA` di `scripts/import-excel.ts`). Nama lain dikosongkan dan dicatat di laporan tanpa nilai aslinya, karena Excel kadang mengisi nama orang di baris "Swasta/Yayasan". Nama lembaga sah yang ikut terbuang bisa diisi lewat `data/corrections.json` (misalnya `{ "cb-0213": { "pemilik": "..." } }`) setelah dikonfirmasi Disbud. Isian "Swasta", "Tidak Diketahui", dan "Tidak Memperoleh Informasi" dianggap kosong.

## Koordinat

Format di Excel beragam (dari 338 baris W: 273 derajat-menit-detik dengan berbagai penulisan, 16 UTM, 1 desimal, 48 kosong). Skrip mengenali:

1. Desimal: `-6.1234, 106.8123`
2. Derajat-menit-detik: `06°14'28.32" LS 106°48'01.19" BT`, `S 6°14'02" E 106°48'10"`, termasuk koma sebagai pemisah desimal dan simbol derajat yang salah ketik (`o`, `º`)
3. Derajat-menit desimal: `06°21.722' LS 106°49.280' BT`
4. UTM zona 48S: `699492.12 E 9309309.18 S`

Hasil divalidasi: lintang −6,5 s.d. −5,1 dan bujur 106,3 s.d. 107,0 (batas DKI termasuk Kepulauan Seribu). Setelah itu dicek ke kotak kasar per wilayah dan ke poligon batas Provinsi DKI (`data/dki-boundary.json`), karena kotak saja meloloskan titik di perbatasan seperti Depok. Di luar batas atau tidak terbaca → `null` + masuk laporan. Bila satu sel memuat dua format (DMS dan UTM), DMS dipakai dan keduanya harus menunjuk titik yang berdekatan (< 200 m); bila tidak, masuk laporan.

## Menggabungkan sheet U dan W

Kedua sheet tidak punya ID bersama, dan nama di W sering memakai bentuk berbeda (hanya 153 dari 332 nama yang sama persis setelah tanda kurung dibuang). Cara pencocokan (dipakai juga untuk sheet kawasan):

1. Pasangan manual di `data/manual-matches.json` dulu: `{ "cb-0123": { "nama": "nama di W", "alamat": "alamat di W" } }`.
2. Setiap sel nama diurai jadi beberapa **varian** (nama penuh, tiap baris, tiap bagian yang dipisah "/", isi kurung, versi tanpa nama jalan), dibandingkan tanpa spasi ("Kalibesar" = "Kali Besar").
3. Skor tiap pasangan = 2 × jumlah varian yang sama + 3 bila alamat (jalan + nomor) sama + 1 bila kelurahan sama.
4. Pasangan diambil dari skor tertinggi; satu baris W hanya untuk satu objek. Bila skor terbaik seri antara dua baris W, objek dibiarkan tidak cocok dan masuk laporan (lebih baik kosong daripada salah).

Hasil impor 30 Okt 2026: 319 dari 333 objek cocok; 14 tidak ada di sheet W.

Yang tidak cocok tetap diimpor dari U (tanpa koordinat dan kepemilikan) dan masuk laporan. **Usulan ke Disbud:** tambahkan kolom No yang sama di kedua sheet, supaya pencocokan tidak perlu ditebak lagi.

## Berkas hasil

| Berkas                     | Isi                                             | Masuk git                    |
| -------------------------- | ----------------------------------------------- | ---------------------------- |
| `data/heritage-sites.json` | Array objek sesuai skema, terurut menurut `id`  | ya                           |
| `data/id-map.json`         | Pasangan kunci sumber → `id` tetap              | ya                           |
| `data/manual-matches.json` | Pasangan U ↔ W yang dicocokkan manual           | ya                           |
| `data/3d-models.json`      | Berkas model 3D lima museum                     | ya                           |
| `data/import-report.csv`   | Baris bermasalah: id, nama, masalah, nilai asli | ya (untuk dikirim ke Disbud) |

Build website gagal bila `heritage-sites.json` tidak lolos validasi skema (zod).

## Contoh satu objek

```json
{
  "id": "cb-0002",
  "slug": "masjid-al-azhar",
  "nama": "Masjid Al-Azhar",
  "nama_dahulu": [],
  "nama_lain": ["Masjid Agung Al-Azhar"],
  "jenis": "bangunan",
  "nomor_sk": "Keputusan Gubernur DKI Jakarta Nomor 475 Tahun 1993",
  "sk": { "jenis": "Kepgub", "nomor": "475", "tahun": 1993 },
  "wilayah": "jakarta-selatan",
  "kecamatan": "Kebayoran Baru",
  "kelurahan": ["Selong"],
  "alamat": "Jl. Sisingamangaraja Nomor 1, Kel. Selong, Kec. Kebayoran Baru",
  "koordinat": { "lat": -6.2353, "lng": 106.7992 },
  "kawasan_induk": null,
  "area": "kebayoran-baru",
  "kepemilikan": "non-pemerintah",
  "kepemilikan_detail": "swasta-yayasan",
  "pemilik": null,
  "pengelola": "Yayasan Masjid Al-Azhar",
  "nilai_penting": "Dibangun pada tahun 1953–1958.",
  "bacaan_terkait": [],
  "foto": [],
  "model_3d": null
}
```

Nilai koordinat di contoh hanyalah ilustrasi format; nilai sebenarnya dihitung skrip dari Excel.
