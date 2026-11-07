import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { berkasFoto, DaftarFotoSchema, LEBAR_BESAR, LEBAR_KECIL } from "../src/lib/photos";
import type { Jenis, Wilayah } from "../src/lib/schema";
import { tulisProgres } from "./photo-progress";

const sumber = process.argv[2] ?? process.env.FOTO_SUMBER;
if (!sumber || !existsSync(sumber)) {
  console.error('Pakai: npm run photos -- "<folder foto asli>"');
  process.exit(1);
}

const daftar = DaftarFotoSchema.parse(JSON.parse(readFileSync("data/photos.json", "utf8")));
const data = JSON.parse(readFileSync("data/heritage-sites.json", "utf8")) as {
  id: string;
  slug: string;
  nama: string;
  jenis: Jenis;
  wilayah: Wilayah[];
}[];
const slugData = new Set(data.map((x) => x.slug));
const KELUARAN = "public/photos";
const GAMBAR = /\.(jpe?g|png|tiff?|webp|heic)$/i;

const masalah: string[] = [];
const peringatan: string[] = [];
let dibuat = 0;
let dilewati = 0;

async function ubah(asal: string, tujuan: string, lebar: number, kualitas: number) {
  if (existsSync(tujuan) && statSync(tujuan).mtimeMs >= statSync(asal).mtimeMs) {
    dilewati++;
    return;
  }
  await sharp(asal, { limitInputPixels: false })
    .rotate()
    .resize({ width: lebar, withoutEnlargement: true })
    .toColorspace("srgb")
    .webp({ quality: kualitas, effort: 5 })
    .toFile(tujuan);
  dibuat++;
}

const folderTerdaftar = new Set<string>();
const isiFolder = new Map<string, number>();

for (const [slug, o] of Object.entries(daftar.objek)) {
  if (!slugData.has(slug)) {
    masalah.push(`${slug}: slug tidak ada di heritage-sites.json`);
    continue;
  }
  folderTerdaftar.add(o.folder);
  const dir = join(sumber, o.folder);
  if (!existsSync(dir)) {
    masalah.push(`${slug}: folder "${o.folder}" tidak ditemukan`);
    continue;
  }

  const isi = readdirSync(dir).filter((f) => GAMBAR.test(f));
  isiFolder.set(slug, isi.length);
  const dipakai = new Set(o.foto.map((f) => f.asal));
  for (const f of isi)
    if (!dipakai.has(f) && !o.abaikan.includes(f)) peringatan.push(`${o.folder}: "${f}" belum didaftarkan`);

  const keluaran = join(KELUARAN, slug);
  const diharapkan = new Set<string>();
  for (const f of o.foto) {
    const asal = join(dir, f.asal);
    if (!existsSync(asal)) {
      masalah.push(`${slug}: berkas "${f.asal}" tidak ada di folder`);
      continue;
    }
    mkdirSync(keluaran, { recursive: true });
    const { berkas, kecil } = berkasFoto(slug, f.asal);
    for (const p of [berkas, kecil]) {
      if (diharapkan.has(p)) masalah.push(`${slug}: dua berkas menghasilkan nama yang sama (${p})`);
      diharapkan.add(p);
    }
    await ubah(asal, join("public", berkas), LEBAR_BESAR, 74);
    await ubah(asal, join("public", kecil), LEBAR_KECIL, 70);
  }

  if (existsSync(keluaran))
    for (const f of readdirSync(keluaran)) if (!diharapkan.has(`/photos/${slug}/${f}`)) rmSync(join(keluaran, f));
}

if (existsSync(KELUARAN))
  for (const d of readdirSync(KELUARAN))
    if (slugData.has(d) && !daftar.objek[d]?.foto.length) rmSync(join(KELUARAN, d), { recursive: true });

for (const d of readdirSync(sumber, { withFileTypes: true }))
  if (d.isDirectory() && !folderTerdaftar.has(d.name)) peringatan.push(`folder "${d.name}" belum dipetakan ke objek`);

console.log(`foto: ${dibuat} berkas dibuat, ${dilewati} sudah ada`);

const PROGRES = join(sumber, "Progres Foto Cagar Budaya.xlsx");
try {
  const j = await tulisProgres(PROGRES, data, daftar, isiFolder);
  console.log(
    `progres: ${j.tampil} tampil, ${j.belumDidaftarkan} belum didaftarkan, ${j.kosong} folder kosong, ${j.tanpaFolder} tanpa folder → ${PROGRES}`,
  );
} catch (e) {
  peringatan.push(`sheet progres tidak bisa ditulis (sedang dibuka di Excel?): ${(e as Error).message}`);
}
for (const p of peringatan) console.warn(`peringatan: ${p}`);
if (masalah.length) {
  for (const m of masalah) console.error(`masalah: ${m}`);
  process.exit(1);
}
