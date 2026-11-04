import MiniSearch from "minisearch";
import { LABEL, LABEL_AREA } from "./labels";
import { normal } from "./summary";
import type { CagarBudaya } from "./schema";

export type DokumenCari = { id: string; nama: string; lain: string; tempat: string; kategori: string; isi: string };

const BOBOT = { nama: 4, lain: 3, kategori: 1.5, tempat: 1.5, isi: 0.5 };

const SINONIM: Record<string, string[]> = {
  masjid: ["mesjid", "mosque", "musala", "musholla", "langgar"],
  gereja: ["church", "kapel", "chapel", "katedral", "cathedral"],
  klenteng: ["kelenteng", "temple", "vihara", "wihara"],
  makam: ["kuburan", "pemakaman", "grave", "tomb", "cemetery", "kerkhof"],
  rumah: ["house", "home", "residence", "kediaman"],
  gedung: ["building", "bangunan"],
  jembatan: ["bridge"],
  pelabuhan: ["harbour", "harbor", "port"],
  pasar: ["market"],
  sekolah: ["school"],
  stasiun: ["station"],
  benteng: ["fort", "fortress", "bastion"],
  kantor: ["office"],
  pulau: ["island"],
  patung: ["statue"],
  monumen: ["monument", "tugu"],
  menara: ["tower"],
  mercusuar: ["lighthouse"],
  gudang: ["warehouse"],
  taman: ["park", "garden"],
  lapangan: ["field", "square"],
  penjara: ["prison", "jail"],
  belanda: ["kolonial", "colonial", "dutch", "hindia"],
  tionghoa: ["cina", "china", "chinese", "pecinan"],
  jalan: ["jl", "street", "road"],
};

const KANONIK = new Map(Object.entries(SINONIM).flatMap(([k, xs]) => xs.map((x) => [x, k] as const)));

const KATA_SAMBUNG = new Set(["dan", "di", "ke", "dari", "yang", "the", "of", "and", "in", "at"]);

const olahKata = (kata: string) => (KATA_SAMBUNG.has(kata) ? null : (KANONIK.get(kata) ?? kata));

const ARAH: Record<string, string> = {
  central: "pusat",
  north: "utara",
  west: "barat",
  south: "selatan",
  east: "timur",
};

const pecah = (s: string) =>
  normal(s)
    .replace(/\b(central|north|west|south|east) jakarta\b/g, (_, arah: string) => `jakarta${ARAH[arah]}`)
    .replace(/\bjakarta (pusat|utara|barat|selatan|timur)\b/g, "jakarta$1")
    .replace(/\b(kepulauan seribu|thousand islands)\b/g, "kepulauanseribu")
    .split(" ");

const gabung = (xs: (string | null | undefined)[]) => xs.filter(Boolean).join(" ");

export function dokumenCari(cb: CagarBudaya, namaKawasan: string | null): DokumenCari {
  return {
    id: cb.id,
    nama: gabung([cb.nama, cb.kelompok]),
    lain: gabung([...cb.nama_dahulu, ...cb.nama_lain]),
    tempat: gabung([cb.alamat, ...cb.kelurahan, ...cb.kecamatan, namaKawasan, cb.area && LABEL_AREA[cb.area]]),
    kategori: gabung([
      LABEL.id.jenis[cb.jenis],
      LABEL.en.jenis[cb.jenis],
      ...cb.wilayah.flatMap((w) => [LABEL.id.wilayah[w], LABEL.en.wilayah[w]]),
      cb.nomor_sk,
    ]),
    isi: gabung([cb.deskripsi, cb.nilai_penting, ...Object.values(cb.rincian)]),
  };
}

const jarakMaks = (kata: string) => (kata.length >= 6 ? 2 : kata.length >= 4 ? 1 : 0);

function jarakEdit(a: string, b: string) {
  let baris = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const baru = [i];
    for (let j = 1; j <= b.length; j++) {
      baru[j] = Math.min(baris[j] + 1, baru[j - 1] + 1, baris[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    baris = baru;
  }
  return baris[b.length];
}

export type Indeks = { mini: MiniSearch<DokumenCari>; kosakata: Map<string, number> };

export function buatIndeks(dokumen: DokumenCari[]): Indeks {
  const mini = new MiniSearch<DokumenCari>({
    fields: Object.keys(BOBOT),
    tokenize: pecah,
    processTerm: olahKata,
    searchOptions: {
      tokenize: pecah,
      processTerm: olahKata,
      boost: BOBOT,
      prefix: (kata) => kata.length >= 3,
      fuzzy: (kata) => jarakMaks(kata) || false,
      weights: { fuzzy: 0.4, prefix: 0.7 },
    },
  });
  mini.addAll(dokumen);

  const kosakata = new Map<string, number>();
  for (const d of dokumen) {
    for (const medan of Object.keys(BOBOT) as (keyof typeof BOBOT)[]) {
      for (const kata of pecah(d[medan]).map(olahKata)) {
        if (kata && kata.length >= 3 && !/\d/.test(kata)) kosakata.set(kata, (kosakata.get(kata) ?? 0) + 1);
      }
    }
  }
  return { mini, kosakata };
}

const tampilkan = (kata: string) =>
  kata
    .replace(/^jakarta(pusat|utara|barat|selatan|timur)$/, "jakarta $1")
    .replace(/^kepulauanseribu$/, "kepulauan seribu");

function saranEjaan(kosakata: Map<string, number>, q: string) {
  let berubah = false;
  const kata = pecah(q)
    .filter(Boolean)
    .map((asli) => {
      const istilah = olahKata(asli);
      const maks = istilah ? jarakMaks(istilah) : 0;
      if (!istilah || !maks || kosakata.has(istilah)) return asli;
      if ([...kosakata.keys()].some((k) => k.startsWith(istilah))) return asli;
      let terbaik: { kata: string; jarak: number; jumlah: number } | null = null;
      for (const [k, jumlah] of kosakata) {
        if (Math.abs(k.length - istilah.length) > maks) continue;
        const jarak = jarakEdit(istilah, k);
        if (jarak > maks) continue;
        if (!terbaik || jarak < terbaik.jarak || (jarak === terbaik.jarak && jumlah > terbaik.jumlah))
          terbaik = { kata: k, jarak, jumlah };
      }
      if (!terbaik) return asli;
      berubah = true;
      return terbaik.kata;
    });
  return berubah ? kata.map(tampilkan).join(" ") : null;
}

export type HasilCari = { skor: Map<string, number>; saran: string | null };

export function cari({ mini, kosakata }: Indeks, q: string): HasilCari | null {
  if (!normal(q)) return null;
  const persis = mini.search(q, { combineWith: "AND", fuzzy: false });
  if (persis.length) return { skor: new Map(persis.map((h) => [h.id as string, h.score])), saran: null };
  const longgar = mini.search(q, { combineWith: "AND" });
  const hasil = longgar.length ? longgar : mini.search(q, { combineWith: "OR" });
  return { skor: new Map(hasil.map((h) => [h.id as string, h.score])), saran: saranEjaan(kosakata, q) };
}
