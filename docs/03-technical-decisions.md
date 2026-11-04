# Keputusan teknis

Versi 0.1 · 30 Oktober 2026

## Ringkasan

| Bagian        | Pilihan                                                                | Alasan                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router) + TypeScript, `output: "export"`               | Sama dengan website HBIM lama, jadi komponen dan embed 3D bisa dipakai ulang. Hasilnya folder HTML statis yang bisa dipasang di server Disbud |
| Gaya          | CSS biasa + CSS Modules, token warna/huruf di `:root`                  | Tidak perlu Tailwind/UI kit untuk ±10 komponen. Token mengikuti sistem visual di presentasi                                                   |
| Huruf         | `next/font/google`: Plus Jakarta Sans, Instrument Serif                | Berkas huruf diunduh saat build dan disajikan dari server sendiri. Keduanya OFL                                                               |
| Baca Excel    | `exceljs` (di skrip impor saja, bukan di website)                      | Masih dirawat. Paket `xlsx` di npm sudah lama tidak diperbarui                                                                                |
| Validasi data | `zod`                                                                  | Build gagal bila data rusak, sebelum sampai ke pengunjung                                                                                     |
| Konversi UTM  | `proj4` (skrip impor saja)                                             | 16 koordinat memakai UTM zona 48S                                                                                                             |
| Pencarian     | MiniSearch di browser, indeks dibangun dari `src/lib/search.ts`        | 333 objek cukup diindeks di browser; tahan salah ketik, pencarian awalan kata, peringkat relevansi, dan sinonim ID/EN tanpa server pencarian  |
| Peta          | `maplibre-gl` + tile vektor berbasis OpenStreetMap                     | Lihat "Peta" di bawah                                                                                                                         |
| Carousel      | komponen sendiri (CSS scroll-snap + sedikit JS)                        | Kebutuhannya spesifik (blur kiri, jeda, reduced motion); pustaka carousel tidak sepadan bebannya                                              |
| Foto          | WebP disiapkan manual (`sharp`) dan dicatat di `data/corrections.json` | Optimasi gambar bawaan `next/image` tidak berjalan di static export. Skrip ukuran ganda menyusul setelah foto resmi diterima                  |
| Model 3D      | `@google/model-viewer` + `.glb` di `public/models/`                    | Lihat "Model 3D" di bawah                                                                                                                     |

Sebelum menulis kode, baca panduan di `node_modules/next/dist/docs/` untuk versi yang terpasang (lihat `AGENTS.md`).

## Model 3D

Model HBIM dulu tampil lewat embed Autodesk yang terikat akun pribadi pembuatnya; tautannya bisa mati kapan saja. Sekarang modelnya disajikan dari situs sendiri.

- Sumber: berkas IFC yang diekspor dari Revit, disimpan di `data/source/models/` (tidak masuk git). Berkas `.rvt` aslinya ikut disimpan di sana sebagai arsip.
- `scripts/ifc-to-glb.py` membaca IFC dengan IfcOpenShell, mengelompokkan elemen per jenis (dinding, kolom, atap, pintu, jendela, lantai, plafon, kayu, railing, kaca), memberi warna yang dicocokkan dengan foto bangunan, lalu mengompresnya dengan `gltf-transform` (meshopt). Hasilnya hanya bentuk dan warna; properti BIM, ID Revit, dan jalur berkas asli tidak ikut.
- Warna dari IFC tidak dipakai karena sebagian besar masih bawaan Revit (abu-abu, merah) dan kolom serta plafon tidak berwarna sama sekali.
- `<model-viewer>` dimuat hanya setelah pengunjung menekan "Muat model 3D". Decoder meshopt disalin ke `public/meshopt-decoder.js`, jadi tidak ada permintaan ke CDN atau layanan luar.
- Konversi lewat `rvt-gltf` (membaca `.rvt` langsung, tanpa Revit) sudah dicoba dan ditolak: dinding keluar sebagai balok tanpa lubang, atap dan fasad hilang, dan berkas Revit 2019 tidak didukung.

## Static export: yang tidak tersedia

Dari `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`, dengan `output: "export"` fitur berikut **tidak bisa dipakai**:

- `redirects`, `rewrites`, `headers` di `next.config.ts` → diatur di konfigurasi server Disbud
- `proxy.ts` (dulu middleware) → tidak ada deteksi bahasa otomatis; pengunjung memilih ID/EN di header
- Route dinamis tanpa `generateStaticParams()` atau dengan `dynamicParams: true`
- Optimasi gambar `next/image` dengan loader bawaan → foto diproses skrip `sharp`
- Server Actions, cookies, ISR, Route Handler yang membaca `Request`

Konsekuensi: setiap halaman `/{jenis}/{slug}/` dibuat saat build lewat `generateStaticParams()` dari `data/heritage-sites.json`, dengan `dynamicParams = false`. Filter Jelajah dibaca dari query string di sisi browser.

Pengaturan `next.config.ts` awal:

```ts
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // /bangunan/masjid-al-azhar/index.html: paling mudah dilayani Apache/nginx
  images: { unoptimized: true },
  poweredByHeader: false,
};
```

## Struktur folder

```
cagar-budaya-jakarta/
├─ AGENTS.md, CLAUDE.md            aturan kerja untuk agen
├─ docs/                           dokumen ini
├─ data/
│  ├─ source/                      Excel mentah dari Disbud (tidak masuk git)
│  │                               ── diisi manual ──
│  ├─ supplements.json             deskripsi, rincian, kondisi, foto, bacaan per slug
│  ├─ corrections.json             perbaikan hasil impor per id (mis. koordinat)
│  ├─ manual-matches.json          pasangan sheet utama ↔ sheet perwilayah
│  ├─ 3d-models.json               jalur model 3D (.glb) dan foto point cloud
│  ├─ dki-boundary.json            batas Provinsi DKI dari OpenStreetMap
│  ├─ home.json                    isi carousel beranda
│  │                               ── hasil npm run import, jangan diedit ──
│  ├─ heritage-sites.json
│  ├─ id-map.json
│  └─ import-report.csv
├─ scripts/
│  ├─ import-excel.ts              Excel → heritage-sites.json + laporan
│  ├─ coordinates.ts               parser DMS/UTM
│  ├─ normalize.ts                 perapian teks, slug, kunci pencocokan nama/alamat
│  ├─ *.test.ts                    test coordinates, normalize, dan pencarian
│  ├─ ifc-to-glb.py               IFC (ekspor Revit) → public/models/*/model.glb
│  ├─ dki-boundary.py             unduh batas DKI dari OpenStreetMap
│  ├─ copy-browser-assets.mjs     worker MapLibre dan decoder meshopt → public/ sebelum dev/build
│  └─ fix-prefetch-paths.mjs       pascabuild: salin berkas prefetch ke nama yang diminta browser
├─ server/                         pengalihan URL lama, header keamanan, cache untuk Apache/nginx
├─ wrangler.jsonc                  konfigurasi Cloudflare (padanan server/ ada di public/_headers, public/_redirects)
├─ public/                         photos/, models/ (model 3D, point cloud), logo
└─ src/
   ├─ app/                         hanya rute; nama foldernya = URL, jadi tetap bahasa Indonesia
   │  ├─ (id)/                     /, /jelajah/, /model-3d/, /tentang/, /{jenis}/{slug}/
   │  ├─ en/                       /en/, /en/explore/, /en/3d-models/, /en/about/, ...
   │  └─ global-not-found.tsx, sitemap.ts, robots.ts
   ├─ views/                       {Home,Explore,Detail,Model3D,About}Page.tsx
   │                               + ExploreBrowser.tsx (filter, grid, peta; klien)
   │                               + *.module.css per halaman, shared.module.css
   ├─ components/                  SiteShell, Header, Footer, HeroCarousel, Card, Photo,
   │                               MapView, Model3D, DataSheet, ConditionReport,
   │                               RecentSearches, ShareButtons, CountUp, Reveal, JsonLd
   ├─ lib/
   │  ├─ schema.ts                 skema zod, satu sumber tipe TypeScript
   │  ├─ data.ts                   baca + gabung supplements.json + validasi, fungsi query
   │  ├─ summary.ts                data ringkas untuk Jelajah dan peta
   │  ├─ search.ts                 indeks pencarian, sinonim, saran ejaan
   │  ├─ search-history.ts         riwayat pencarian di localStorage pengunjung
   │  ├─ labels.ts                 label jenis/wilayah/kepemilikan, rute, nama kawasan
   │  ├─ messages.ts               teks antarmuka ID/EN
   │  ├─ geo.ts                    jarak dan format koordinat
   │  └─ site.ts                   URL situs dan penerbit
   └─ styles/                      tokens.css, global.css
```

Segmen `[jenis]` hanya menerima lima nilai (`benda`, `struktur`, `bangunan`, `situs`, `kawasan`). Kawasan memakai halaman detail yang sama, ditambah daftar dan peta isi kawasannya.

## Dua bahasa

Antarmuka tersedia dalam bahasa Indonesia (URL tanpa awalan) dan Inggris (`/en/...`). Isi data dari Excel (nama, sejarah, alamat) hanya berbahasa Indonesia dan diberi `lang="id"` di halaman Inggris.

| Indonesia          | Inggris                                             |
| ------------------ | --------------------------------------------------- |
| `/`                | `/en/`                                              |
| `/jelajah/`        | `/en/explore/`                                      |
| `/model-3d/`       | `/en/3d-models/`                                    |
| `/tentang/`        | `/en/about/`                                        |
| `/{jenis}/{slug}/` | `/en/{object,structure,building,site,area}/{slug}/` |

- Dua root layout: `src/app/(id)/layout.tsx` (`lang="id"`) dan `src/app/en/layout.tsx` (`lang="en"`). Pindah bahasa memuat ulang halaman penuh; tombol ID/EN membawa query filter Jelajah.
- Isi halaman ada di `src/views/` dan menerima `b: "id" | "en"`; file di `src/app/` hanya pembungkus.
- Penamaan: nama berkas, folder, dan komponen React berbahasa Inggris (`DetailPage`, `MapView`, `search.ts`), kecuali folder rute di `src/app/` karena menentukan URL. Isian data, fungsi, dan variabel tetap berbahasa Indonesia mengikuti istilah Disbud dan skema data (`nilai_penting`, `kawasan_induk`, `tautan()`).
- Teks antarmuka di `src/lib/messages.ts`; label jenis, wilayah, kepemilikan, dan rute di `src/lib/labels.ts`.
- Halaman 404 memakai `global-not-found.tsx` (flag `experimental.globalNotFound`) karena tidak ada root layout tunggal; isinya dua bahasa.
- Setiap halaman memuat `hreflang` id/en/x-default; `sitemap.xml` memuat kedua versi.

## Peta

Tile `tile.openstreetmap.org` tidak ditujukan untuk website dengan lalu lintas tinggi (kebijakan pemakaian OSMF), jadi tidak dipakai langsung.

Dipakai: `maplibre-gl` 6.14.0 dengan gaya `positron` dari OpenFreeMap (gratis, tanpa kunci API, boleh komersial; atribusi tampil otomatis). Warna dasar disesuaikan dengan palet situs lewat `transformStyle` di `src/components/MapView.tsx`. Google Maps dipertimbangkan dan tidak dipakai (butuh akun penagihan dan kunci API).

MapLibre 6 memuat worker dari berkas terpisah. Skrip `predev`/`prebuild` menyalinnya ke `public/maplibre-gl-worker.js` (berakhiran `.js` supaya tipe MIME-nya benar di server mana pun).

Cadangan bila OpenFreeMap berhenti: penyedia dengan paket gratis (MapTiler, Stadia) cukup dengan mengganti URL gaya.

Peta dibatasi ke DKI Jakarta. `maxBounds` mencegah peta digeser jauh keluar provinsi; kotaknya sengaja lebih lebar dari provinsi supaya Kepulauan Seribu tetap muat di layar desktop. Area di luar DKI diredupkan dengan poligon "dunia berlubang", dan lubangnya adalah batas provinsi dari `data/dki-boundary.json`. Batas itu diambil dari OpenStreetMap (relation 6362934, ODbL, boleh komersial dengan atribusi yang sudah tampil di peta) oleh `scripts/dki-boundary.py`, lalu disederhanakan menjadi sekitar 800 titik (17 KB). Batas administratif DKI di OSM mencakup perairan sampai Kepulauan Seribu, jadi sebagian laut ikut terang.

## Build dan pemasangan

```
npm run import     # Excel → data/*.json + import-report.csv
npm run build     # next build → out/, lalu scripts/fix-prefetch-paths.mjs
```

`scripts/fix-prefetch-paths.mjs` menyalin data prefetch Next dari `__next.a/b/__PAGE__.txt` ke `__next.a.b.__PAGE__.txt`, nama yang diminta browser. Tanpa itu setiap tautan memicu 404 dan perpindahan halaman jadi lebih lambat.

Folder `out/` diunggah ke server Disbud. Pengalihan URL lama (PRD bagian 5) dipasang lewat `server/.htaccess` atau `server/nginx.conf`, tergantung jenis server (pertanyaan terbuka #1 di PRD). Header keamanan dan cache juga diatur di sana. Content-Security-Policy membatasi semua sumber ke situs sendiri, kecuali `tiles.openfreemap.org` untuk peta. `script-src` masih butuh `'unsafe-inline'` karena skrip bawaan ekspor statis Next tidak bisa diberi nonce, dan `'wasm-unsafe-eval'` untuk dekoder meshopt. `blob:` di `connect-src` dipakai tekstur model 3D. Bila menambah layanan luar, perbarui CSP di kedua berkas. HSTS belum dipasang karena bergantung pada pengaturan HTTPS server Disbud.

Pembaruan data setelah tayang: Disbud mengirim Excel baru → `npm run import` → periksa `import-report.csv` dan diff `heritage-sites.json` → `npm run build` → unggah `out/`. Rinciannya di `docs/05-maintenance-guide.md`.

Di Cloudflare, `out/` disajikan oleh Workers Static Assets (`wrangler.jsonc`), dengan header dan pengalihan di `public/_headers` dan `public/_redirects`. `@opennextjs/cloudflare` tidak dipakai: adapter itu untuk situs yang butuh server Next, sedangkan semua halaman di sini statis. Bila menambah layanan luar atau URL lama, perbarui `public/` dan `server/` bersamaan.

## Yang dipakai ulang dari `../hbim-jakarta-next`

- Gambar point cloud tiga museum → `public/models/`
- Daftar URL lama di `src/i18n/routing.ts` → bahan aturan pengalihan
- Logika SEO/JSON-LD di `src/lib/seo/` sebagai rujukan

Tidak dipakai ulang: `next-intl`, `proxy.ts`, `redirects()`/`headers()` di config, dan optimasi `next/image`; semuanya bergantung pada server Node.
