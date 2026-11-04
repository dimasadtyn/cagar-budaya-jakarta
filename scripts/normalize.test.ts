import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hurufBesarSemua,
  judulKata,
  kalimat,
  kunciAlamat,
  kunciNama,
  parseSK,
  pecahNama,
  rapikan,
  rapikanBaris,
  slugify,
  variasiNama,
} from "./normalize";

test("rapikan: spasi ganda, tepi, dan tanda hubung terpotong", () => {
  assert.equal(rapikan("  Masjid   Al-\nAzhar "), "Masjid Al-Azhar");
  assert.equal(rapikan("Gedung Bank- Indonesia"), "Gedung Bank-Indonesia");
  assert.equal(rapikan(null), "");
});

test("rapikanBaris: baris kosong dibuang, baris lain dipertahankan", () => {
  assert.equal(rapikanBaris("Satu \r\n\n  Dua  dua"), "Satu\nDua dua");
});

test("slugify: huruf kecil, tanpa aksen, & jadi dan", () => {
  assert.equal(slugify("Masjid Al-Azhar"), "masjid-al-azhar");
  assert.equal(slugify("Gereja Santo Yosef & Pastoran"), "gereja-santo-yosef-dan-pastoran");
  assert.equal(slugify("Café Batavia (Kota Tua)"), "cafe-batavia-kota-tua");
});

test("slugify: dipotong di batas kata tanpa tanda hubung di ujung", () => {
  const s = slugify("Gugusan Pulau Onrust Pulau Cipir Pulau Kelor dan Pulau Bidadari Kepulauan Seribu", 40);
  assert.ok(s.length <= 40);
  assert.ok(!s.endsWith("-"));
  assert.equal(s, "gugusan-pulau-onrust-pulau-cipir-pulau");
});

test("kunciNama: hanya baris pertama, isi kurung dibuang", () => {
  assert.equal(kunciNama("Masjid Al-Azhar (Masjid Agung)\nJl. Sisingamangaraja"), "masjid al azhar");
});

test("kunciAlamat: keluaran tetap, karena dipakai sebagai kunci di data/id-map.json", () => {
  assert.equal(kunciAlamat("Jalan Pekojan Nomor 72, Kel. Pekojan"), "jl pekojan no 72");
  assert.equal(kunciAlamat("Jl. Pekojan No.72 Kelurahan Pekojan"), "jl pekojan no72");
  assert.equal(kunciAlamat("Jl. Medan Merdeka Barat No. 12"), "jl medan merdeka barat no 12");
});

test("pecahNama: nama tunggal dengan nama dahulu dan nama lain", () => {
  assert.deepEqual(pecahNama("Gereja Koinonia (GPIB Koinonia Jatinegara)\nGPIB Koinonia"), {
    nama: "Gereja Koinonia",
    kelompok: null,
    namaDahulu: ["GPIB Koinonia"],
    namaLain: ["GPIB Koinonia Jatinegara"],
  });
});

test("pecahNama: baris jalan bukan nama dahulu", () => {
  assert.deepEqual(pecahNama("Masjid Assalafiyah\nJl. Pangeran Jayakarta").namaDahulu, []);
});

test("pecahNama: kelompok dengan bagian bernomor digabung", () => {
  const h = pecahNama("Kompleks Perusahaan Umum Produksi Film Negara\nBangunan 1");
  assert.equal(h.nama, "Kompleks Perusahaan Umum Produksi Film Negara Bangunan 1");
  assert.equal(h.kelompok, "Kompleks Perusahaan Umum Produksi Film Negara");
});

test("pecahNama: kelompok dengan bagian bernama sendiri", () => {
  const kelompok = new Set(["kompleks gelanggang olahraga senayan"]);
  const h = pecahNama("Kompleks Gelanggang Olahraga Senayan\nStadion Aquatik", kelompok);
  assert.equal(h.nama, "Stadion Aquatik");
  assert.equal(h.kelompok, "Kompleks Gelanggang Olahraga Senayan");
});

test("variasiNama: memuat nama tanpa kurung dan isi kurung", () => {
  const v = variasiNama("Masjid Al-Azhar (Masjid Agung Al-Azhar)");
  assert.ok(v.has("masjidalazhar"));
  assert.ok(v.has("masjidagungalazhar"));
});

test("judulKata dan kalimat", () => {
  assert.equal(judulKata("GEDUNG  ARSIP nasional"), "Gedung Arsip Nasional");
  assert.equal(kalimat("DIBANGUN TAHUN 1760. KEMUDIAN DIPUGAR."), "Dibangun tahun 1760. Kemudian dipugar.");
});

test("hurufBesarSemua: hanya teks panjang yang hampir semuanya kapital", () => {
  assert.equal(hurufBesarSemua("GEDUNG INI DIBANGUN PADA MASA KOLONIAL"), true);
  assert.equal(hurufBesarSemua("Gedung ini dibangun pada masa kolonial"), false);
  assert.equal(hurufBesarSemua("MUSEUM"), false);
});

test("parseSK: Kepgub dinormalkan, selain itu teks asli dipertahankan", () => {
  assert.deepEqual(parseSK("Kepgub No. 475 Tahun 1993"), {
    teks: "Keputusan Gubernur DKI Jakarta Nomor 475 Tahun 1993",
    sk: { jenis: "Kepgub", nomor: "475", tahun: 1993 },
  });
  assert.deepEqual(parseSK("SK Menteri Nomor 12 Tahun 2010").sk, { jenis: "Lainnya", nomor: "12", tahun: 2010 });
  assert.deepEqual(parseSK("belum ditetapkan"), { teks: "belum ditetapkan", sk: null });
});
