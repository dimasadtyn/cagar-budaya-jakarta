# Cagar Budaya Jakarta

Katalog publik 333 cagar budaya DKI Jakarta untuk Dinas Kebudayaan Provinsi DKI Jakarta, dalam bahasa Indonesia dan Inggris. Menggantikan website HBIM Jakarta, yang hanya memuat lima museum.

Website ini statis: seluruh halaman dibangun dari data Excel Disbud saat build, lalu diunggah ke server sebagai berkas biasa. Tidak ada database atau panel admin.

## Menjalankan

Butuh Node.js 24.

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Untuk build produksi, buat `.env.local` berisi `NEXT_PUBLIC_SITE_URL=https://alamat-website` lalu jalankan `npm run build`; hasilnya di `out/`.

| Perintah            | Fungsi                                                                          |
| ------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`       | Server pengembangan                                                             |
| `npm run build`     | Build statis ke `out/`                                                          |
| `npm run import`    | Excel di `data/source/` → `data/heritage-sites.json` + `data/import-report.csv` |
| `npm run models`    | IFC di `data/source/models/` → `public/models/*/model.glb` (butuh Python)       |
| `npm run preview`   | Build lalu jalankan secara lokal di runtime Cloudflare                          |
| `npm run deploy`    | Build lalu terbitkan ke Cloudflare (butuh `npx wrangler login`)                 |
| `npm test`          | Test skrip impor (parser koordinat, normalisasi nama dan slug)                  |
| `npm run typecheck` | Pemeriksaan tipe TypeScript                                                     |
| `npm run lint`      | ESLint                                                                          |
| `npm run format`    | Prettier                                                                        |

## Alur data

```
Excel Disbud ─┐
              ├─(npm run import)──> data/heritage-sites.json ─┐
corrections.json ─┘        │                                   ├─(npm run build)──> out/ ──> server Disbud
                       │                  supplements.json ───┘
                       └──> data/import-report.csv   baris bermasalah, dikirim balik ke Disbud
```

- `data/corrections.json`: perbaikan nilai Excel (mis. koordinat), diterapkan saat impor.
- `data/supplements.json`: isian yang tidak ada di Excel (deskripsi, kondisi, foto, bacaan), digabung saat build.
- `data/photos.json`: foto objek per slug; `npm run photos` mengonversinya dari folder foto asli ke `public/photos/`.

Excel mentah tidak masuk repo karena memuat data pribadi narahubung. Lihat [data/source/README.md](data/source/README.md).

## Struktur

```
data/       data hasil impor dan isian manual (JSON)
docs/       kebutuhan produk, skema data, keputusan teknis, panduan pengelolaan
scripts/    skrip impor Excel, konversi model 3D, dan pascabuild
server/     konfigurasi Apache/nginx: pengalihan URL lama, header keamanan, cache
wrangler.jsonc  konfigurasi Cloudflare; pengalihan dan header-nya di public/_redirects, public/_headers
src/app/    rute Next.js (ID tanpa awalan, EN di /en/)
src/views/  isi halaman
src/components/, src/lib/, src/styles/
```

Rincian tiap folder ada di [docs/03-technical-decisions.md](docs/03-technical-decisions.md#struktur-folder).

## Dokumen

| Dokumen                                                     | Isi                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [01-prd.md](docs/01-prd.md)                                 | Kebutuhan produk: halaman, fitur, kriteria selesai                                       |
| [02-data-schema.md](docs/02-data-schema.md)                 | Format data, pemetaan dari Excel, isian tambahan                                         |
| [03-technical-decisions.md](docs/03-technical-decisions.md) | Stack, struktur folder, dua bahasa, peta, build dan pemasangan                           |
| [04-data-findings.md](docs/04-data-findings.md)             | Hasil pemeriksaan Excel dan hal yang perlu dikonfirmasi ke Disbud                        |
| [05-maintenance-guide.md](docs/05-maintenance-guide.md)     | Untuk petugas: memperbarui data, menambah foto, mengoreksi koordinat, memasang di server |

## Lisensi konten

Foto dan data yang tampil di website wajib boleh dipakai untuk keperluan komersial; kredit dan lisensinya dicantumkan di bawah setiap foto. Peta memakai data © kontributor OpenStreetMap lewat OpenFreeMap.
