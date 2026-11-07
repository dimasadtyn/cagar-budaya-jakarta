import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import mentah from "../../data/heritage-sites.json";
import berandaMentah from "../../data/home.json";
import tambahanMentah from "../../data/supplements.json";
import fotoMentah from "../../data/photos.json";
import { berkasFoto, DaftarFotoSchema } from "./photos";
import { dokumenCari } from "./search";
import { jarakMeter } from "./geo";
import { ringkas } from "./summary";
import { DataSchema, JENIS, TambahanSchema, WILAYAH, type CagarBudaya, type Jenis, type Wilayah } from "./schema";

const tambahan = TambahanSchema.parse(tambahanMentah);
const tanpaPasangan = Object.keys(tambahan).filter((slug) => !mentah.some((cb) => cb.slug === slug));
if (tanpaPasangan.length)
  throw new Error(`data/supplements.json memuat slug yang tidak dikenal: ${tanpaPasangan.join(", ")}`);

const daftarFoto = DaftarFotoSchema.parse(fotoMentah);
const fotoTanpaPasangan = Object.keys(daftarFoto.objek).filter((slug) => !mentah.some((cb) => cb.slug === slug));
if (fotoTanpaPasangan.length)
  throw new Error(`data/photos.json memuat slug yang tidak dikenal: ${fotoTanpaPasangan.join(", ")}`);

const fotoObjek = (slug: string) => {
  const o = daftarFoto.objek[slug];
  if (!o) return [];
  return o.foto.map((f) => {
    const jalur = berkasFoto(slug, f.asal);
    for (const p of Object.values(jalur))
      if (!existsSync(join("public", p))) throw new Error(`${p} belum ada, jalankan npm run photos`);
    return {
      ...jalur,
      kredit: o.kredit ?? daftarFoto.kredit,
      lisensi: o.lisensi ?? daftarFoto.lisensi,
      ...(f.keterangan && { keterangan: f.keterangan }),
    };
  });
};

const semua: CagarBudaya[] = DataSchema.parse(
  mentah.map((cb) => {
    const t = tambahan[cb.slug];
    return { ...cb, ...t, foto: [...fotoObjek(cb.slug), ...(t?.foto ?? [])] };
  }),
);
const perSlug = new Map(semua.map((cb) => [cb.slug, cb]));

export { LABEL_AREA, LABEL_JENIS, LABEL_WILAYAH, skPendek, tautan, teksKepemilikan } from "./labels";

export const cariSlug = (slug: string) => perSlug.get(slug) ?? null;

export function terdekat(cb: CagarBudaya, jumlah = 5) {
  const asal = cb.koordinat;
  if (!asal) return [];
  return semua
    .filter((x) => x.id !== cb.id && x.koordinat)
    .map((x) => ({ cb: x, jarak: jarakMeter(asal, x.koordinat!) }))
    .sort((a, b) => a.jarak - b.jarak)
    .slice(0, jumlah);
}

export const anggotaKawasan = (slug: string) => semua.filter((cb) => cb.kawasan_induk === slug);

export const daftarCagarBudaya = () => semua;

export const cariCagarBudaya = (jenis: string, slug: string) => {
  const cb = perSlug.get(slug);
  return cb?.jenis === jenis ? cb : null;
};

export const adalahJenis = (s: string): s is Jenis => (JENIS as readonly string[]).includes(s);

export const jumlahPerJenis = () =>
  Object.fromEntries(JENIS.map((j) => [j, semua.filter((cb) => cb.jenis === j).length])) as Record<Jenis, number>;

export const jumlahPerWilayah = () =>
  Object.fromEntries(WILAYAH.map((w) => [w, semua.filter((cb) => cb.wilayah.includes(w)).length])) as Record<
    Wilayah,
    number
  >;

const BerandaSchema = z.object({
  slide: z.array(
    z.object({
      slug: z.string(),
      foto: z.string().startsWith("/"),
      alt: z.string().min(1),
      kredit: z.string().nullable(),
      lisensi: z.string().nullable(),
    }),
  ),
  pernah_bernama_lain: z.array(z.string()),
});

const beranda = BerandaSchema.parse(berandaMentah);

const wajibAda = (slug: string) => {
  const cb = perSlug.get(slug);
  if (!cb) throw new Error(`data/home.json: slug "${slug}" tidak ada di heritage-sites.json`);
  return cb;
};

export const slideBeranda = () => beranda.slide.map((s) => ({ ...s, cb: wajibAda(s.slug) }));

export const pernahBernamaLain = () =>
  beranda.pernah_bernama_lain.map(wajibAda).filter((cb) => cb.nama_dahulu.length > 0);

export const denganModel3D = () => semua.filter((cb) => cb.model_3d);

export const daftarRingkas = () => semua.map(ringkas);

export const daftarDokumenCari = () =>
  semua.map((cb) => dokumenCari(cb, cb.kawasan_induk ? (perSlug.get(cb.kawasan_induk)?.nama ?? null) : null));
