import type { MetadataRoute } from "next";
import { daftarCagarBudaya } from "@/lib/data";
import { RUTE, tautan } from "@/lib/labels";
import { URL_SITUS } from "@/lib/site";

export const dynamic = "force-static";

const entri = (id: string, en: string, priority: number) => ({
  url: `${URL_SITUS}${id}`,
  priority,
  alternates: { languages: { id: `${URL_SITUS}${id}`, en: `${URL_SITUS}${en}` } },
});

export default function sitemap(): MetadataRoute.Sitemap {
  const halaman = Object.values(RUTE).map((r) => entri(r.id, r.en, r.id === "/" ? 1 : 0.8));
  const objek = daftarCagarBudaya().map((cb) =>
    entri(tautan(cb), tautan(cb, "en"), cb.jenis === "kawasan" ? 0.7 : 0.6),
  );
  const semua = [...halaman, ...objek];
  return [
    ...semua,
    ...semua.map((e) => ({ ...e, url: e.alternates.languages.en, priority: Math.round(e.priority * 8) / 10 })),
  ];
}
