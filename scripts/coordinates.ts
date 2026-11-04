import proj4 from "proj4";
import batasDki from "../data/dki-boundary.json";
import { jarakMeter } from "../src/lib/geo";
import type { Koordinat, Wilayah } from "../src/lib/schema";

export type HasilKoordinat = {
  koordinat: Koordinat | null;
  format: "kosong" | "desimal" | "dms" | "utm" | "gagal";
  catatan: string[];
};

const UTM_48S = "+proj=utm +zone=48 +south +datum=WGS84 +units=m +no_defs";

const UTM_RE = /(?:48\s*M\s*)?0?(\d{6}(?:[.,]\d+)?)\s*(?:m\s*)?E[\s\-–]*(\d{7}(?:[.,]\d+)?)\s*(?:m\s*)?[NS]?/i;
const UTM_RE_G = new RegExp(UTM_RE.source, "gi");
const DESIMAL_RE = /(-?\d{1,2}\.\d{4,})\s*[,;\s]\s*(\d{3}\.\d{4,})/;

const BATAS_WILAYAH: Record<Wilayah, { lat: [number, number]; lng: [number, number] }> = {
  "jakarta-pusat": { lat: [-6.25, -6.1], lng: [106.76, 106.91] },
  "jakarta-utara": { lat: [-6.21, -6.05], lng: [106.65, 107.0] },
  "jakarta-barat": { lat: [-6.26, -6.06], lng: [106.65, 106.85] },
  "jakarta-selatan": { lat: [-6.4, -6.17], lng: [106.72, 106.9] },
  "jakarta-timur": { lat: [-6.4, -6.12], lng: [106.8, 107.0] },
  "kepulauan-seribu": { lat: [-6.1, -5.1], lng: [106.3, 106.9] },
};

export function dalamWilayah(k: Koordinat, wilayah: Wilayah[]): boolean {
  return wilayah.some((w) => {
    const b = BATAS_WILAYAH[w];
    return k.lat >= b.lat[0] && k.lat <= b.lat[1] && k.lng >= b.lng[0] && k.lng <= b.lng[1];
  });
}

// Kotak per wilayah di atas terlalu kasar di perbatasan (mis. Jakarta Selatan–Depok), jadi dicek juga ke batas provinsi.
export function dalamBatasDki({ lat, lng }: Koordinat): boolean {
  return batasDki.geometry.coordinates.some(([cincin]) => {
    let dalam = false;
    for (let i = 0, j = cincin.length - 1; i < cincin.length; j = i++) {
      const [xi, yi] = cincin[i];
      const [xj, yj] = cincin[j];
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dalam = !dalam;
    }
    return dalam;
  });
}

const bulat = (n: number) => Math.round(n * 1e6) / 1e6;

function dariUtm(teks: string): Koordinat | null {
  const m = teks.match(UTM_RE);
  if (!m) return null;
  const e = Number(m[1].replace(",", "."));
  const n = Number(m[2].replace(",", "."));
  const [lng, lat] = proj4(UTM_48S, "WGS84", [e, n]);
  return { lat: bulat(lat), lng: bulat(lng) };
}

function keDerajat(bagian: number[]): number | null {
  const [d, m = 0, s = 0] = bagian;
  if (m >= 60 || s >= 60) return null;
  return d + m / 60 + s / 3600;
}

function dariDms(teks: string): { koordinat: Koordinat | null; banyakTitik: boolean } {
  const bersih = teks
    .replace(/\((?:titik|tititk)[^)]*\)/gi, " ")
    .replace(UTM_RE_G, " ")
    .replace(/(\d),(\d)/g, "$1.$2");
  const angka = (bersih.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

  const iBujur = angka.findIndex((n) => n >= 100 && n < 181);
  if (iBujur < 1 || iBujur > 3) return { koordinat: null, banyakTitik: false };

  const lintang = angka.slice(0, iBujur);
  const bujur = angka.slice(iBujur, iBujur + lintang.length);
  const banyakTitik = angka.length > iBujur + lintang.length;

  const lat = keDerajat(lintang);
  const lng = keDerajat(bujur);
  if (lat === null || lng === null || bujur.length !== lintang.length) return { koordinat: null, banyakTitik };
  return { koordinat: { lat: bulat(-Math.abs(lat)), lng: bulat(lng) }, banyakTitik };
}

const dalamDki = (k: Koordinat) => k.lat >= -6.5 && k.lat <= -5.1 && k.lng >= 106.3 && k.lng <= 107.0;

export function parseKoordinat(mentah: string | null | undefined): HasilKoordinat {
  const teks = (mentah ?? "").trim();
  if (!teks || teks === "-") return { koordinat: null, format: "kosong", catatan: [] };

  const des = teks.match(DESIMAL_RE);
  if (des) {
    const k = { lat: bulat(-Math.abs(Number(des[1]))), lng: bulat(Number(des[2])) };
    if (dalamDki(k)) return { koordinat: k, format: "desimal", catatan: [] };
  }

  const catatan: string[] = [];
  const utm = dariUtm(teks);
  const { koordinat: dms, banyakTitik } = dariDms(teks);
  if (banyakTitik) catatan.push("beberapa titik dalam satu sel; dipakai titik pertama");

  if (dms && dalamDki(dms)) {
    if (utm && dalamDki(utm) && jarakMeter(dms, utm) > 200) {
      catatan.push(`DMS dan UTM berselisih ${Math.round(jarakMeter(dms, utm))} m; dipakai DMS`);
    }
    return { koordinat: dms, format: "dms", catatan };
  }
  if (utm && dalamDki(utm)) {
    if (dms === null) catatan.push("DMS tidak terbaca; dipakai UTM");
    return { koordinat: utm, format: "utm", catatan };
  }
  return { koordinat: null, format: "gagal", catatan: [...catatan, "format tidak dikenali atau di luar DKI"] };
}
