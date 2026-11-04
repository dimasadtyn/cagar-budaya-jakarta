import { test } from "node:test";
import assert from "node:assert/strict";
import { jarakMeter } from "../src/lib/geo";
import { dalamBatasDki, parseKoordinat } from "./coordinates";

const dekat = (a: { lat: number; lng: number } | null, lat: number, lng: number, toleransiM = 30) => {
  assert.ok(a, "koordinat null");
  const d = jarakMeter(a, { lat, lng });
  assert.ok(d < toleransiM, `selisih ${Math.round(d)} m dari (${lat}, ${lng}); dapat (${a.lat}, ${a.lng})`);
};

test("kosong", () => {
  assert.equal(parseKoordinat(null).format, "kosong");
  assert.equal(parseKoordinat("  ").format, "kosong");
  assert.equal(parseKoordinat("-").format, "kosong");
});

test("desimal dengan ketinggian", () => {
  const h = parseKoordinat("6.2016468,106.8994473,298\n");
  assert.equal(h.format, "desimal");
  dekat(h.koordinat, -6.2016468, 106.8994473, 1);
});

test("DMS dengan awalan S/E", () => {
  const h = parseKoordinat(`S 06°14'28.32" E 106°48'01.19"`);
  assert.equal(h.format, "dms");
  dekat(h.koordinat, -(6 + 14 / 60 + 28.32 / 3600), 106 + 48 / 60 + 1.19 / 3600, 1);
});

test("DMS dengan koma desimal dan LS/BT", () => {
  dekat(parseKoordinat(`06°12'04,02" LS--106°50'31,29" BT`).koordinat, -6.201117, 106.842025, 1);
});

test("derajat + menit desimal, simbol derajat 'o'", () => {
  dekat(parseKoordinat("06o21.722' LS--106o49.280' BT ").koordinat, -6.362033, 106.821333, 1);
});

test("simbol derajat rusak (karakter pengganti)", () => {
  dekat(parseKoordinat("6�21.734� LS--106�49.280� BT \n").koordinat, -6.362233, 106.821333, 1);
});

test("DMS + UTM dalam satu sel, berdekatan", () => {
  const h = parseKoordinat(`S 6°14'02" E 106°48'10" \n699492.12 E 9309309.18 S),`);
  assert.equal(h.format, "dms");
  dekat(h.koordinat, -(6 + 14 / 60 + 2 / 3600), 106 + 48 / 60 + 10 / 3600, 1);
});

test("label TITIK diabaikan, UTM dalam kurung dibuang", () => {
  const h = parseKoordinat(`(TITIK BARAT 1) 6°10'50.60"S 106°55'19.50"E (48 M 712684.00 E 9316433.74 S) `);
  assert.equal(h.format, "dms");
  dekat(h.koordinat, -(6 + 10 / 60 + 50.6 / 3600), 106 + 55 / 60 + 19.5 / 3600, 1);
});

test("beberapa titik: dipakai titik pertama", () => {
  const h = parseKoordinat(
    "(Titik A) \nS6°12'51.7\"E106°51'14.5\";\n(Titik B) \nS6°12'47.1\" E106°51'28.9\";\n(Titik C) \nS6°12'43.1\" E106°51'39.0\";",
  );
  assert.equal(h.format, "dms");
  assert.ok(h.catatan.some((c) => c.includes("beberapa titik")));
  dekat(h.koordinat, -(6 + 12 / 60 + 51.7 / 3600), 106 + 51 / 60 + 14.5 / 3600, 1);
});

test("DMS rusak, UTM dipakai", () => {
  const h = parseKoordinat(`(TITIK 1) S 6°1410.42" E 106°524.45/48 M 706665.00 E\n9310316.00 S `);
  assert.equal(h.format, "utm");
  dekat(h.koordinat, -(6 + 14 / 60 + 10.42 / 3600), 106 + 52 / 60 + 4.45 / 3600, 60);
});

test("detik di atas 60 ditolak", () => {
  assert.equal(parseKoordinat(`S 06°21'86.43" E 106°85'16.87"`).format, "gagal");
});

test("tanpa simbol derajat sama sekali ditolak", () => {
  assert.equal(parseKoordinat("06012,120°LS--106054.053°B").format, "gagal");
});

test("titik di Depok di luar batas DKI, Monas dan Pulau Onrust di dalam", () => {
  assert.equal(dalamBatasDki({ lat: -6.362233, lng: 106.821333 }), false);
  assert.equal(dalamBatasDki({ lat: -6.175392, lng: 106.827153 }), true);
  assert.equal(dalamBatasDki({ lat: -6.0332, lng: 106.7353 }), true);
});
