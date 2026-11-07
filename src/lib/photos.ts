import { z } from "zod";

export const LEBAR_BESAR = 1600;
export const LEBAR_KECIL = 640;

export const DaftarFotoSchema = z.object({
  kredit: z.string().min(1),
  lisensi: z.string().min(1),
  objek: z.record(
    z.string(),
    z.object({
      folder: z.string().min(1),
      kredit: z.string().min(1).optional(),
      lisensi: z.string().min(1).optional(),
      foto: z.array(z.object({ asal: z.string().min(1), keterangan: z.string().min(1).optional() })),
      abaikan: z.array(z.string()).default([]),
    }),
  ),
});

export type DaftarFoto = z.infer<typeof DaftarFotoSchema>;

const dasar = (asal: string) =>
  asal
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/^salinan\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const berkasFoto = (slug: string, asal: string) => ({
  berkas: `/photos/${slug}/${dasar(asal)}.webp`,
  kecil: `/photos/${slug}/${dasar(asal)}-${LEBAR_KECIL}.webp`,
});
