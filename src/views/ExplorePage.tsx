import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CountUp from "@/components/CountUp";
import { daftarCagarBudaya, daftarDokumenCari, daftarRingkas } from "@/lib/data";
import { alternatif, LABEL_AREA, NAMA_KAWASAN, RUTE, type Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import ExploreBrowser, { ExploreSearch, SearchForm, type Pilihan } from "./ExploreBrowser";
import css from "./explore.module.css";

export const metadataJelajah = (b: Bahasa): Metadata => ({
  title: TEKS[b].jelajah.judulMeta,
  description: TEKS[b].jelajah.deskripsi,
  alternates: { canonical: RUTE.jelajah[b], languages: alternatif(RUTE.jelajah.id, RUTE.jelajah.en) },
});

export default function ExplorePage({ b }: { b: Bahasa }) {
  const t = TEKS[b].jelajah;
  const data = daftarRingkas();
  const kawasan: Pilihan[] = [
    ...daftarCagarBudaya()
      .filter((cb) => cb.jenis === "kawasan")
      .map((cb) => ({ nilai: cb.slug, label: NAMA_KAWASAN[cb.slug]?.[b] ?? cb.nama })),
    ...Object.entries(LABEL_AREA).map(([nilai, label]) => ({ nilai, label })),
  ];

  return (
    <div className="wadah">
      <header className={css.kepala}>
        <nav aria-label={TEKS[b].remah} className={css.remah}>
          <Link href={RUTE.beranda[b]}>{TEKS[b].beranda}</Link> / {t.judul}
        </nav>
        <div className={css.barisJudul}>
          <h1>
            {t.ajakan}{" "}
            <span className="dulu">
              <CountUp nilai={data.length} />
            </span>{" "}
            {t.judulSesudah}
          </h1>
          <Suspense fallback={<SearchForm b={b} />}>
            <ExploreSearch b={b} />
          </Suspense>
        </div>
      </header>
      <Suspense>
        <ExploreBrowser data={data} dokumen={daftarDokumenCari()} kawasan={kawasan} b={b} />
      </Suspense>
    </div>
  );
}
