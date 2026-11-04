import type { CagarBudaya, Jenis, Wilayah } from "./schema";

export type Bahasa = "id" | "en";

export const LABEL = {
  id: {
    jenis: { benda: "Benda", struktur: "Struktur", bangunan: "Bangunan", situs: "Situs", kawasan: "Kawasan" },
    wilayah: {
      "jakarta-pusat": "Jakarta Pusat",
      "jakarta-utara": "Jakarta Utara",
      "jakarta-barat": "Jakarta Barat",
      "jakarta-selatan": "Jakarta Selatan",
      "jakarta-timur": "Jakarta Timur",
      "kepulauan-seribu": "Kepulauan Seribu",
    },
    kepemilikan: {
      pemerintah: "Pemerintah",
      "non-pemerintah": "Non-pemerintah",
      "belum-ada-informasi": "Belum ada informasi",
    },
    perorangan: "Non-pemerintah · Perorangan",
    swasta: "Non-pemerintah · Swasta/Yayasan",
  },
  en: {
    jenis: { benda: "Object", struktur: "Structure", bangunan: "Building", situs: "Site", kawasan: "Area" },
    wilayah: {
      "jakarta-pusat": "Central Jakarta",
      "jakarta-utara": "North Jakarta",
      "jakarta-barat": "West Jakarta",
      "jakarta-selatan": "South Jakarta",
      "jakarta-timur": "East Jakarta",
      "kepulauan-seribu": "Thousand Islands",
    },
    kepemilikan: {
      pemerintah: "Government",
      "non-pemerintah": "Non-government",
      "belum-ada-informasi": "No information yet",
    },
    perorangan: "Non-government · Individual",
    swasta: "Non-government · Private/Foundation",
  },
} satisfies Record<
  Bahasa,
  {
    jenis: Record<Jenis, string>;
    wilayah: Record<Wilayah, string>;
    kepemilikan: Record<CagarBudaya["kepemilikan"], string>;
    perorangan: string;
    swasta: string;
  }
>;

export const LABEL_JENIS = LABEL.id.jenis;
export const LABEL_WILAYAH = LABEL.id.wilayah;
export const LABEL_KEPEMILIKAN = LABEL.id.kepemilikan;

export const LABEL_AREA: Record<string, string> = {
  menteng: "Menteng",
  "kebayoran-baru": "Kebayoran Baru",
};

export function teksKepemilikan(cb: Pick<CagarBudaya, "kepemilikan" | "kepemilikan_detail">, b: Bahasa = "id") {
  const l = LABEL[b];
  if (cb.kepemilikan !== "non-pemerintah") return l.kepemilikan[cb.kepemilikan];
  return cb.kepemilikan_detail === "perorangan" ? l.perorangan : l.swasta;
}

export const NAMA_KAWASAN: Record<string, Record<Bahasa, string>> = {
  "kawasan-kota-tua": { id: "Kota Tua", en: "Old Town (Kota Tua)" },
  "gugusan-pulau-onrust-pulau-cipir-pulau-kelor-dan-pulau-bidadari": {
    id: "Gugusan Pulau Onrust",
    en: "Onrust Island cluster",
  },
};

export const skPendek = (cb: Pick<CagarBudaya, "sk" | "nomor_sk">) =>
  cb.sk ? `${cb.sk.jenis === "Kepgub" ? "Kepgub" : "SK"} ${cb.sk.nomor}/${cb.sk.tahun}` : cb.nomor_sk;

export const JENIS_EN: Record<Jenis, string> = {
  benda: "object",
  struktur: "structure",
  bangunan: "building",
  situs: "site",
  kawasan: "area",
};

export const tautan = (cb: Pick<CagarBudaya, "jenis" | "slug">, b: Bahasa = "id") =>
  b === "en" ? `/en/${JENIS_EN[cb.jenis]}/${cb.slug}/` : `/${cb.jenis}/${cb.slug}/`;

export const RUTE = {
  beranda: { id: "/", en: "/en/" },
  jelajah: { id: "/jelajah/", en: "/en/explore/" },
  model3d: { id: "/model-3d/", en: "/en/3d-models/" },
  tentang: { id: "/tentang/", en: "/en/about/" },
} as const;

export const bahasaDari = (path: string): Bahasa => (/^\/en(\/|$)/.test(path) ? "en" : "id");

export function padanan(path: string): string {
  const p = path.endsWith("/") ? path : `${path}/`;
  for (const r of Object.values(RUTE)) {
    if (p === r.id) return r.en;
    if (p === r.en) return r.id;
  }
  const en = p.match(/^\/en\/([^/]+)\/([^/]+)\/$/);
  if (en) {
    const jenis = Object.entries(JENIS_EN).find(([, v]) => v === en[1])?.[0];
    if (jenis) return `/${jenis}/${en[2]}/`;
  }
  const id = p.match(/^\/([^/]+)\/([^/]+)\/$/);
  if (id && id[1] in JENIS_EN) return `/en/${JENIS_EN[id[1] as Jenis]}/${id[2]}/`;
  return bahasaDari(p) === "en" ? "/" : "/en/";
}

export const alternatif = (id: string, en: string) => ({ id, en, "x-default": id });
