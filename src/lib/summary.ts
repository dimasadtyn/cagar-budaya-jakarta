import { skPendek } from "./labels";
import type { CagarBudaya, Jenis, Kepemilikan, Koordinat, Wilayah } from "./schema";

export type Ringkas = {
  id: string;
  slug: string;
  jenis: Jenis;
  nama: string;
  namaDahulu: string | null;
  sk: string;
  wilayah: Wilayah[];
  kecamatan: string[];
  kepemilikan: Kepemilikan;
  kawasan: string | null;
  area: string | null;
  model3d: boolean;
  koordinat: Koordinat | null;
  foto: string | null;
};

export const normal = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const ringkas = (cb: CagarBudaya): Ringkas => ({
  id: cb.id,
  slug: cb.slug,
  jenis: cb.jenis,
  nama: cb.nama,
  namaDahulu: cb.nama_dahulu[0] ?? null,
  sk: skPendek(cb),
  wilayah: cb.wilayah,
  kecamatan: cb.kecamatan,
  kepemilikan: cb.kepemilikan,
  kawasan: cb.kawasan_induk,
  area: cb.area,
  model3d: cb.model_3d !== null,
  koordinat: cb.koordinat,
  foto: cb.foto[0] ? (cb.foto[0].kecil ?? cb.foto[0].berkas) : null,
});
