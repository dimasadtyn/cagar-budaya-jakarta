export const rapikan = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/\s+/g, " ")
    .replace(/(\p{L})- (?=\p{L})/gu, "$1-")
    .trim();

export const rapikanBaris = (s: string | null | undefined) =>
  (s ?? "")
    .split(/\r?\n/)
    .map((b) => rapikan(b))
    .filter(Boolean)
    .join("\n");

const tanpaAksen = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "");

export const slugify = (s: string, maks = 70) => {
  const slug = tanpaAksen(s)
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= maks) return slug;
  return slug.slice(0, maks).replace(/-[^-]*$/, "");
};

export const kunci = (s: string) =>
  tanpaAksen(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const kunciNama = (s: string) => kunci((s.split(/\r?\n/)[0] ?? "").replace(/\([^)]*\)/g, " "));

export const kunciAlamat = (s: string) => {
  const jalan = rapikan(s)
    .split(/,|\bkel(?:urahan)?\b\.?/i)[0]
    .toLowerCase()
    .replace(/\bjalan\b/g, "jl")
    .replace(/\bnomor\b|\bno\b\.?/g, "no");
  return kunci(jalan);
};

export function barisNama(mentah: string): string[] {
  const hasil: string[] = [];
  for (const b of mentah.split(/\r?\n/).map((x) => rapikan(x))) {
    if (!b || /^(jl\.?|jalan)\s/i.test(b)) continue;
    if (hasil.length && /^[(\p{Ll}]/u.test(b)) hasil[hasil.length - 1] += ` ${b}`;
    else hasil.push(b);
  }
  return hasil;
}

export const kunciNamaLengkap = (mentah: string) =>
  kunci(
    barisNama(mentah)
      .join(" ")
      .replace(/\([^)]*\)/g, " "),
  );

const tanpaKurung = (s: string) => rapikan(s.replace(/\([^)]*\)/g, " "));
const isiKurung = (s: string) => [...s.matchAll(/\(([^)]+)\)/g)].map((m) => rapikan(m[1]));

const BAGIAN_BERNOMOR =
  /^(?:(?:bangunan|rumah|rumah\/toko|kantor|gedung)\s+)?(?:no\.?|nomor)?\s*[\dIVX]+[a-z]?(?:\s*-\s*\d+)?$/i;
const KATA_BANGUNAN =
  /^(gedung|stadion|istora|patung|jalan|bangunan|kantor|bank|ruko|gudang|pt\.?|museum|tanah|rumah|toko|old|de|banteng)\b/i;

export function pecahNama(mentah: string, kelompok: Set<string> = new Set()) {
  const baris = barisNama(mentah);
  const [pertama = "", kedua, ...sisa] = baris;
  const pisahDahulu = (xs: string[]) =>
    xs
      .join(" ")
      .split(/,\s+(?=\p{Lu})|\s\/\s/u)
      .map((x) => rapikan(x).replace(/\s*\/$/, ""))
      .filter(Boolean);

  const adalahKelompok =
    kedua !== undefined && (BAGIAN_BERNOMOR.test(kedua) || kelompok.has(kunci(tanpaKurung(pertama))));
  if (adalahKelompok) {
    const [bagian, ...dahuluBagian] = kedua.split(/\s\/\s/).map((x) => rapikan(x).replace(/\s*\/$/, ""));
    const gabung =
      BAGIAN_BERNOMOR.test(tanpaKurung(bagian)) || (bagian.split(" ").length <= 3 && !KATA_BANGUNAN.test(bagian));
    return {
      nama: gabung ? `${tanpaKurung(pertama)} ${tanpaKurung(bagian)}` : tanpaKurung(bagian),
      kelompok: tanpaKurung(pertama),
      namaDahulu: pisahDahulu([...dahuluBagian, ...sisa]),
      namaLain: [...isiKurung(pertama), ...isiKurung(bagian)],
    };
  }
  return {
    nama: tanpaKurung(pertama),
    kelompok: null,
    namaDahulu: pisahDahulu(baris.slice(1)),
    namaLain: isiKurung(pertama),
  };
}

export function variasiNama(mentah: string): Set<string> {
  const baris = barisNama(mentah);
  const penuh = baris.join(" ");
  const bagian = [penuh, ...baris].flatMap((b) => [b, ...b.split(/\s*\/\s*/)]);
  const semua = bagian.flatMap((b) => [tanpaKurung(b), ...isiKurung(b)]).map((b) => kunci(b.replace(/\//g, " ")));
  const tanpaJalan = semua.map((k) => k.replace(/\b(?:jl|jalan) .*?(?=\bno\b)/, ""));
  return new Set(
    [...semua, ...tanpaJalan]
      .filter((k) => k.split(" ").filter(Boolean).length >= 2 && !/^(no|nomor) /.test(k))
      .map((k) => k.replace(/ /g, "")),
  );
}

export const kunciTempat = (s: string) => kunci(s).replace(/ /g, "");

export const judulKata = (s: string) =>
  rapikan(s)
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

export function hurufBesarSemua(s: string) {
  const huruf = s.match(/\p{L}/gu) ?? [];
  if (huruf.length < 20) return false;
  return huruf.filter((h) => h === h.toUpperCase()).length / huruf.length > 0.8;
}

export const kalimat = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[.!?]\s+|\n\s*(?:-\s*)?)(\p{L})/gu, (_, awal: string, h: string) => awal + h.toUpperCase());

export type SK = { jenis: string; nomor: string; tahun: number };

export function parseSK(mentah: string): { teks: string; sk: SK | null } {
  const teks = rapikan(mentah);
  const kepgub = /keputusan gubernur|kepgub/i.test(teks);
  const m = teks.match(/(?:no\.?|nomor)?\s*(\d+[A-Za-z]?)\s+tahun\s+(\d{4})/i);
  if (!m) return { teks, sk: null };
  const sk = { jenis: kepgub ? "Kepgub" : "Lainnya", nomor: m[1], tahun: Number(m[2]) };
  return {
    teks: kepgub ? `Keputusan Gubernur DKI Jakarta Nomor ${sk.nomor} Tahun ${sk.tahun}` : teks,
    sk,
  };
}
