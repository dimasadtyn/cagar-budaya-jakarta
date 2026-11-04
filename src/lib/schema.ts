import { z } from "zod";

export const JENIS = ["benda", "struktur", "bangunan", "situs", "kawasan"] as const;
export const WILAYAH = [
  "jakarta-pusat",
  "jakarta-utara",
  "jakarta-barat",
  "jakarta-selatan",
  "jakarta-timur",
  "kepulauan-seribu",
] as const;
export const KEPEMILIKAN = ["pemerintah", "non-pemerintah", "belum-ada-informasi"] as const;
export const TINGKAT = ["terawat", "rusak-ringan", "rusak-sedang", "rusak-berat"] as const;
export const RINCIAN = [
  "tipe",
  "arsitek",
  "gaya",
  "fungsi",
  "bahan",
  "ukuran",
  "pembuat",
  "lokasi_simpan",
  "luas",
  "zona",
] as const;

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const KoordinatSchema = z.object({
  lat: z.number().min(-6.5).max(-5.1),
  lng: z.number().min(106.3).max(107.0),
});

export const FotoSchema = z.object({
  berkas: z.string().startsWith("/"),
  kredit: z.string(),
  lisensi: z.string(),
  sumber_url: z.httpUrl().optional(),
  keterangan: z.string().optional(),
});

export const BacaanSchema = z.object({
  judul: z.string(),
  url: z.httpUrl().optional(),
  keterangan: z.string().optional(),
});

export const Model3DSchema = z.object({
  model: z.string().startsWith("/models/").nullable(),
  point_cloud: z.array(z.string()),
});

export const KondisiSchema = z.object({
  tahun: z.number().int(),
  umum: z.enum(TINGKAT).nullable().default(null),
  elemen: z.array(z.object({ nama: z.string(), tingkat: z.enum(TINGKAT) })).default([]),
  lingkungan: z.string().nullable().default(null),
  keterancaman: z.string().nullable().default(null),
});

const ISIAN_TAMBAHAN = {
  deskripsi: z.string().nullable().default(null),
  rincian: z.partialRecord(z.enum(RINCIAN), z.string()).default({}),
  kondisi: KondisiSchema.nullable().default(null),
  batas: z
    .object({ utara: z.string(), timur: z.string(), selatan: z.string(), barat: z.string() })
    .partial()
    .nullable()
    .default(null),
  akses: z.string().nullable().default(null),
  lembar_pdf: z.object({ berkas: z.string(), ukuran_kb: z.number() }).nullable().default(null),
  bacaan_terkait: z.array(BacaanSchema).default([]),
  foto: z.array(FotoSchema).default([]),
};

export const TambahanSchema = z.record(slug, z.object(ISIAN_TAMBAHAN).partial().strict());

export const CagarBudayaSchema = z
  .object({
    id: z.string().regex(/^cb-\d{4}$/),
    slug,
    nama: z.string().min(1),
    kelompok: z.string().nullable(),
    nama_dahulu: z.array(z.string()),
    nama_lain: z.array(z.string()),
    jenis: z.enum(JENIS),
    nomor_sk: z.string().min(1),
    sk: z.object({ jenis: z.string(), nomor: z.string(), tahun: z.number().int() }).nullable(),
    wilayah: z.array(z.enum(WILAYAH)).min(1),
    kecamatan: z.array(z.string()).min(1),
    kelurahan: z.array(z.string()).min(1),
    alamat: z.string(),
    koordinat: KoordinatSchema.nullable(),
    kawasan_induk: slug.nullable(),
    area: slug.nullable(),
    kepemilikan: z.enum(KEPEMILIKAN),
    kepemilikan_detail: z.enum(["swasta-yayasan", "perorangan"]).nullable(),
    pemilik: z.string().nullable(),
    pengelola: z.string().nullable(),
    nilai_penting: z.string().nullable(),
    model_3d: Model3DSchema.nullable(),
    ...ISIAN_TAMBAHAN,
  })
  .refine((cb) => cb.kepemilikan_detail !== "perorangan" || (cb.pemilik === null && cb.pengelola === null), {
    message: "Nama pemilik/pengelola perorangan tidak boleh disimpan",
  });

export const DataSchema = z.array(CagarBudayaSchema);

export type CagarBudaya = z.infer<typeof CagarBudayaSchema>;
export type CagarBudayaMasukan = z.input<typeof CagarBudayaSchema>;
export type Jenis = (typeof JENIS)[number];
export type Wilayah = (typeof WILAYAH)[number];
export type Kepemilikan = (typeof KEPEMILIKAN)[number];
export type Koordinat = z.infer<typeof KoordinatSchema>;
export type Tingkat = (typeof TINGKAT)[number];
export type Rincian = (typeof RINCIAN)[number];
