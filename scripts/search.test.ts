import { test } from "node:test";
import assert from "node:assert/strict";
import mentah from "../data/heritage-sites.json";
import { buatIndeks, cari, dokumenCari } from "../src/lib/search";
import { DataSchema } from "../src/lib/schema";

const data = DataSchema.parse(mentah);
const perSlug = new Map(data.map((cb) => [cb.slug, cb]));
const indeks = buatIndeks(
  data.map((cb) => dokumenCari(cb, cb.kawasan_induk ? (perSlug.get(cb.kawasan_induk)?.nama ?? null) : null)),
);
const nama = new Map(data.map((cb) => [cb.id, cb.nama]));

const hasil = (q: string) =>
  [...(cari(indeks, q)?.skor ?? new Map())].sort((a, b) => b[1] - a[1]).map(([id]) => nama.get(id)!);
const teratas = (q: string) => hasil(q)[0];

test("kueri kosong tidak menyaring", () => {
  assert.equal(cari(indeks, "  "), null);
  assert.equal(cari(indeks, "--"), null);
});

test("tahan salah ketik", () => {
  assert.equal(teratas("musium bahri"), "Museum Bahari");
  assert.match(teratas("misium"), /^Museum/);
  assert.equal(teratas("gedung kesenain"), "Gedung Kesenian Jakarta");
});

test("ejaan yang benar tidak ikut melebar ke kata mirip", () => {
  assert.deepEqual(hasil("klenteng"), hasil("kelenteng"));
  assert.ok(hasil("klenteng").length < 5);
  assert.ok(hasil("menara").length < 10);
});

test("awalan kata", () => {
  assert.ok(hasil("fatahil").some((n) => n.includes("Fatahillah")));
});

test("nama dahulu", () => {
  assert.equal(teratas("Landhuis Vredestein"), "Asrama Perikanan");
});

test("sinonim dan kata bahasa Inggris", () => {
  assert.match(teratas("mesjid"), /^Masjid/);
  assert.match(teratas("church"), /Gereja|Kapel/);
  assert.match(teratas("lighthouse"), /^Mercusuar/);
});

test("semua kata harus cocok bila ada hasilnya", () => {
  const h = hasil("gereja jakarta barat");
  assert.ok(h.length > 0);
  for (const id of cari(indeks, "gereja jakarta barat")!.skor.keys()) {
    const cb = data.find((x) => x.id === id)!;
    assert.ok(cb.wilayah.includes("jakarta-barat"), cb.nama);
  }
});

test("anggota kawasan ikut ditemukan lewat nama kawasannya", () => {
  assert.ok(hasil("kota tua").length > 1);
});

test("kata yang tidak ada di data tidak menghasilkan apa pun", () => {
  assert.deepEqual(hasil("qwertyuiop"), []);
});

test("nama wilayah dibaca utuh, ID maupun EN", () => {
  assert.deepEqual(hasil("gereja west jakarta"), hasil("gereja jakarta barat"));
  assert.ok(!hasil("gereja jakarta barat").includes("Gereja Tugu"));
});

test("saran ejaan hanya muncul bila ada kata yang dikoreksi", () => {
  assert.equal(cari(indeks, "misium wayang")?.saran, "museum wayang");
  assert.equal(cari(indeks, "gedung kesenain")?.saran, "gedung kesenian");
  assert.equal(cari(indeks, "museum wayang")?.saran, null);
  assert.equal(cari(indeks, "fata")?.saran, null);
});

test("nama yang memuat semua kata didahulukan", () => {
  const atas = hasil("gedung kantor").slice(0, 5);
  assert.ok(atas.includes("Gedung Kantor Perum Peruri"));
  assert.ok(atas.every((n) => /gedung/i.test(n) && /kantor/i.test(n)));
});

test("kata umum tidak menyamakan semua bangunan", () => {
  assert.ok(hasil("gedung").length < 100);
});
