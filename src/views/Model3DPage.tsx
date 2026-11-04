import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import Card from "@/components/Card";
import { denganModel3D } from "@/lib/data";
import { alternatif, RUTE, type Bahasa } from "@/lib/labels";
import { ringkas } from "@/lib/summary";
import { TEKS } from "@/lib/messages";
import css from "./shared.module.css";

const ISI: Record<
  Bahasa,
  {
    judul: string;
    deskripsi: string;
    lead: (n: number) => string;
    hbim: ReactNode;
    pointCloud: ReactNode;
  }
> = {
  id: {
    judul: "Model 3D",
    deskripsi:
      "Lima museum di Jakarta yang didokumentasikan dengan pemindaian laser dan dimodelkan dalam Heritage Building Information Modelling (HBIM).",
    lead: (n) =>
      `Sejak 2022 Dinas Kebudayaan DKI Jakarta mendokumentasikan bangunan cagar budaya dengan pemindaian laser 3D dan memodelkannya dalam Heritage Building Information Modelling (HBIM). ${n} museum sudah bisa dilihat modelnya.`,
    hbim: (
      <>
        <p>
          Heritage Building Information Modelling adalah model digital bangunan bersejarah yang menyimpan bentuk
          sekaligus informasinya: struktur, material, dekorasi, dan elemen arsitektur yang khas.
        </p>
        <p>
          Model ini dipakai untuk merencanakan perawatan dan pemugaran, mencatat perubahan bangunan dari waktu ke waktu,
          dan membuka akses informasi kepada publik.
        </p>
        <p>
          Model yang tampil di situs ini adalah versi ringan dari model HBIM: hanya bentuk bangunan, dengan warna yang
          disederhanakan per jenis elemen dan dicocokkan dengan foto bangunannya. Informasi material dan strukturnya
          tetap tersimpan dalam berkas HBIM aslinya.
        </p>
      </>
    ),
    pointCloud: (
      <p>
        Point cloud adalah kumpulan jutaan titik hasil pemindaian laser. Setiap titik menyimpan posisi dalam ruang tiga
        dimensi dan warnanya, sehingga bentuk bangunan terekam dengan teliti. Dari point cloud inilah model HBIM dibuat.
      </p>
    ),
  },
  en: {
    judul: "3D Models",
    deskripsi:
      "Five museums in Jakarta documented by laser scanning and modelled with Heritage Building Information Modelling (HBIM).",
    lead: (n) =>
      `Since 2022 the Jakarta Department of Culture has documented heritage buildings with 3D laser scanning and modelled them with Heritage Building Information Modelling (HBIM). Models of ${n} museums can be viewed now.`,
    hbim: (
      <>
        <p>
          Heritage Building Information Modelling produces a digital model of a historic building that holds both its
          shape and its information: structure, materials, ornament, and distinctive architectural elements.
        </p>
        <p>
          The models are used to plan maintenance and restoration, to record how a building changes over time, and to
          open that information to the public.
        </p>
        <p>
          The models on this site are lightweight versions of the HBIM models: the building&rsquo;s shape only, with
          colours simplified by element type and matched to photographs of the building. Information on materials and
          structure remains in the original HBIM files.
        </p>
      </>
    ),
    pointCloud: (
      <p>
        A point cloud is a set of millions of points captured by a laser scanner. Each point stores a position in
        three-dimensional space and a colour, so the building&rsquo;s form is recorded precisely. The HBIM model is
        built from it.
      </p>
    ),
  },
};

export const metadataModel3D = (b: Bahasa): Metadata => ({
  title: ISI[b].judul,
  description: ISI[b].deskripsi,
  alternates: { canonical: RUTE.model3d[b], languages: alternatif(RUTE.model3d.id, RUTE.model3d.en) },
});

const urut = (i: number) => ({ "--urut": i }) as CSSProperties;

export default function Model3DPage({ b }: { b: Bahasa }) {
  const isi = ISI[b];
  const museum = denganModel3D();
  const contoh = museum.flatMap((cb) =>
    cb.model_3d!.point_cloud.slice(0, 1).map((berkas) => ({ berkas, nama: cb.nama })),
  );

  return (
    <div className="wadah">
      <header className={css.kepala}>
        <nav aria-label={TEKS[b].remah} className={css.remah}>
          <Link href={RUTE.beranda[b]}>{TEKS[b].beranda}</Link> / {isi.judul}
        </nav>
        <h1>
          {b === "en" ? (
            <>
              <span className="dulu">3D</span> Models
            </>
          ) : (
            <>
              Model <span className="dulu">3D</span>
            </>
          )}
        </h1>
        <p className={css.lead}>{isi.lead(museum.length)}</p>
      </header>

      <ul className={css.grid}>
        {museum.map((cb, i) => (
          <li key={cb.id} data-muncul="" style={urut(i)}>
            <Card cb={ringkas(cb)} b={b} />
          </li>
        ))}
      </ul>

      <section className={css.bagian} aria-labelledby="judul-hbim">
        <h2 id="judul-hbim" data-muncul="">
          HBIM
        </h2>
        <div className={css.prosa} data-muncul="" style={urut(1)}>
          {isi.hbim}
        </div>
      </section>

      <section className={css.bagian} aria-labelledby="judul-point-cloud">
        <h2 id="judul-point-cloud" data-muncul="">
          Point cloud
        </h2>
        <div data-muncul="" style={urut(1)}>
          <div className={css.prosa}>{isi.pointCloud}</div>
          {contoh.length > 0 && (
            <ul className={css.galeri}>
              {contoh.map((c) => (
                <li key={c.berkas}>
                  <figure>
                    <div className={css.bingkai}>
                      <img src={c.berkas} alt={`Point cloud ${c.nama}`} loading="lazy" />
                    </div>
                    <figcaption>{c.nama}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
