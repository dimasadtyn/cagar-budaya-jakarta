# Temuan data sumber

Pemeriksaan awal `DT_20250813_DataCagarBudayaDinasKebudayaan_v01.xlsx`, 30 Oktober 2026. Angka di sini dihitung langsung dari Excel; laporan per baris nanti dihasilkan skrip impor (`data/import-report.csv`).

## Isi Excel

| Sheet                                                                    | Isi                                                                                         | Dipakai                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| Update Data CB ~ 2026                                                    | Data utama: 333 objek (338 baris; Kawasan Kota Tua tertulis di 6 baris, satu per kelurahan) | ya, sumber utama                   |
| Data CB Perwilayah                                                       | Data yang sama per kelurahan + koordinat, kepemilikan, narahubung                           | ya, koordinat dan kepemilikan saja |
| CB Kawasan Kota Tua (139), Menteng (35), Kebayoran Baru (11), Onrust (3) | Objek di dalam tiap kawasan                                                                 | ya, untuk `kawasan_induk`          |
| Rekap CB Perwilayah, Pivot, Pivot Kawasan Kota Tua                       | Rekapitulasi                                                                                | tidak (website menghitung sendiri) |
| Data CB 2024                                                             | Versi 2024                                                                                  | tidak                              |

## Ringkasan isi

|                                                               | Jumlah                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| Objek                                                         | 333                                                                |
| Bangunan / Struktur / Benda / Kawasan / Situs                 | 267 / 31 / 31 / 2 / 2 (Kawasan: Kota Tua dan Gugusan Pulau Onrust) |
| Jakarta Barat / Pusat / Timur / Utara / Selatan / Kep. Seribu | 138 / 124 / 31 / 21 / 19 / 5 (hitungan per baris)                  |
| Nomor SK berbeda                                              | 91; 226 objek berbagi Kepgub No. 475 Tahun 1993                    |
| Catatan Nilai Penting kosong                                  | 21                                                                 |
| Panjang Catatan Nilai Penting (median)                        | ±100 karakter (satu–dua kalimat)                                   |
| Baris W dengan koordinat                                      | 290 dari 338                                                       |
| Baris W dengan status kepemilikan terisi jelas                | ±250                                                               |

## Masalah yang perlu ditangani

### Ditangani skrip (tidak perlu menunggu Disbud)

1. **Nama dahulu di dalam sel nama.** Beberapa sel berisi dua baris, misalnya "Asrama Perikanan⏎Landhuis Vredestein", "Masjid Jami Al-Anwar⏎Masjid Angke". Baris kedua dijadikan `nama_dahulu`, jadi justru berguna untuk pencarian.
2. **Penulisan kepemilikan tidak seragam**: "Perorangan", "Perseorangan", "Perseroangan"; "Swasta / Yayasan" dengan spasi ganda. Dipetakan (lihat skema data).
3. **Format koordinat beragam**: DMS, derajat-menit desimal, UTM, simbol derajat salah ketik. Diurai skrip; yang gagal masuk laporan.
4. **Spasi berlebih** di ujung nama kecamatan/kelurahan ("Tamansari ", "Penjaringan ").
5. **Huruf besar semua** di sebagian Catatan Nilai Penting.
6. **Kolom narahubung** (nama dan nomor HP di 127 baris): tidak dibaca skrip sama sekali.

### Perlu dikonfirmasi ke Disbud

1. **Sheet utama dan sheet perwilayah tidak punya ID bersama.** Nama sering ditulis berbeda (hanya 153 dari 332 nama yang sama persis). Usulan: tambahkan kolom No yang sama di kedua sheet.
2. **Kawasan Kota Tua di 6 baris**: satu objek yang mencakup 6 kelurahan (Pinangsia, Glodok, Pekojan, Roa Malaka, Ancol, Penjaringan)? Untuk sementara dianggap satu objek.
3. **±90 objek tanpa status kepemilikan** (kosong, "-", "Tidak ada Informasi"). Ditampilkan "Belum ada informasi".
4. **48 objek tanpa koordinat.** Tidak muncul di peta sampai dilengkapi.
5. **Tidak ada foto** di Excel. Perlu foto resmi + izin pemakaian, minimal untuk carousel (4–6 foto).
6. **Menteng dan Kebayoran Baru punya sheet kawasan, tapi tidak tercatat sebagai objek berjenis Kawasan** di sheet utama (yang tercatat hanya Kota Tua dan Gugusan Pulau Onrust). Apakah keduanya kawasan cagar budaya yang sudah ditetapkan? Bila belum, di website keduanya hanya menjadi pengelompokan "Area", tanpa halaman kawasan sendiri.
7. **Satu baris di sheet Kawasan Menteng** (Prasasti dan Pintu Air Manggarai) berisi alamat di kolom Nomor SK.

## Data pribadi

Excel memuat nama dan nomor telepon narahubung pemilik/pengelola, termasuk perorangan. Aturan proyek:

- Excel mentah tidak masuk git (`data/source/` di-`.gitignore`).
- Skrip impor tidak membaca kolom narahubung.
- Nama pemilik/pengelola perorangan tidak diimpor; website hanya menampilkan "Non-pemerintah · Perorangan".
- `data/import-report.csv` tidak boleh memuat nilai dari kolom narahubung.
