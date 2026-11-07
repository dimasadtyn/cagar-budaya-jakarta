import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import ShareButtons from "@/components/ShareButtons";
import Photo from "@/components/Photo";
import { ogDasar } from "@/components/SiteShell";
import JsonLd, { remahLd } from "@/components/JsonLd";
import Card from "@/components/Card";
import ConditionReport, { warnaTingkat } from "@/components/ConditionReport";
import DataSheet from "@/components/DataSheet";
import Model3D from "@/components/Model3D";
import PhotoAlbum from "@/components/PhotoAlbum";
import MapView, { type Titik } from "@/components/MapView";
import { anggotaKawasan, cariCagarBudaya, daftarCagarBudaya, terdekat } from "@/lib/data";
import { formatJarak, formatKoordinat } from "@/lib/geo";
import { alternatif, JENIS_EN, LABEL, RUTE, skPendek, tautan, type Bahasa } from "@/lib/labels";
import { ringkas } from "@/lib/summary";
import { PENERBIT, URL_SITUS } from "@/lib/site";
import { JENIS, type CagarBudaya, type Jenis } from "@/lib/schema";
import { TEKS } from "@/lib/messages";
import css from "./detail.module.css";

const jenisDari = (segmen: string, b: Bahasa) =>
  b === "en"
    ? (Object.entries(JENIS_EN).find(([, v]) => v === segmen)?.[0] as Jenis | undefined)
    : JENIS.find((j) => j === segmen);

const temukan = (segmen: string, slug: string, b: Bahasa) => {
  const jenis = jenisDari(segmen, b);
  return jenis ? cariCagarBudaya(jenis, slug) : null;
};

export const paramsDetail = (b: Bahasa) =>
  daftarCagarBudaya().map((cb) => ({ jenis: b === "en" ? JENIS_EN[cb.jenis] : cb.jenis, slug: cb.slug }));

export function metadataDetail(b: Bahasa, jenis: string, slug: string): Metadata {
  const cb = temukan(jenis, slug, b);
  if (!cb) return {};
  const foto = cb.foto[0];
  return {
    title: cb.nama,
    description: deskripsi(cb, b),
    alternates: { canonical: tautan(cb, b), languages: alternatif(tautan(cb), tautan(cb, "en")) },
    openGraph: {
      ...ogDasar(b),
      title: cb.nama,
      url: tautan(cb, b),
      ...(foto && { images: [{ url: foto.berkas, alt: cb.nama }] }),
    },
  };
}

function deskripsi(cb: CagarBudaya, b: Bahasa) {
  const teks = (cb.deskripsi ?? cb.nilai_penting)?.replace(/\s+/g, " ").trim();
  if (b === "en" || !teks) return TEKS[b].detail.deskripsiCadangan(LABEL[b].jenis[cb.jenis], cb.alamat);
  return teks.length <= 160 ? teks : `${teks.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

function dataTerstruktur(cb: CagarBudaya, b: Bahasa) {
  return {
    "@context": "https://schema.org",
    "@type": cb.jenis === "benda" ? "Thing" : "LandmarksOrHistoricalBuildings",
    name: cb.nama,
    ...(cb.nama_dahulu.length + cb.nama_lain.length > 0 && {
      alternateName: [...cb.nama_dahulu, ...cb.nama_lain],
    }),
    description: deskripsi(cb, b),
    url: `${URL_SITUS}${tautan(cb, b)}`,
    inLanguage: b,
    ...(cb.foto.length > 0 && { image: cb.foto.map((f) => `${URL_SITUS}${f.berkas}`) }),
    ...(cb.jenis !== "benda" && {
      address: {
        "@type": "PostalAddress",
        streetAddress: cb.alamat,
        addressLocality: cb.kecamatan[0],
        addressRegion: "DKI Jakarta",
        addressCountry: "ID",
      },
      ...(cb.koordinat && {
        geo: { "@type": "GeoCoordinates", latitude: cb.koordinat.lat, longitude: cb.koordinat.lng },
      }),
    }),
    subjectOf: { "@type": "WebPage", publisher: PENERBIT },
  };
}

const Paragraphs = ({ teks }: { teks: string }) =>
  teks
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p, i) => <p key={i}>{p}</p>);

function History({ teks }: { teks: string }) {
  const blok: (string | string[])[] = [];
  for (const baris of teks.split("\n")) {
    const butir = baris.match(/^[-•]\s*(.+)/)?.[1];
    const akhir = blok.at(-1);
    if (butir && Array.isArray(akhir)) akhir.push(butir);
    else blok.push(butir ? [butir] : baris);
  }
  return blok.map((b, i) =>
    Array.isArray(b) ? (
      <ul key={i}>
        {b.map((x, j) => (
          <li key={j}>{x}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{b}</p>
    ),
  );
}

const keTitik = (x: CagarBudaya, b: Bahasa, keterangan: string, utama = false): Titik[] =>
  x.koordinat ? [{ id: x.id, ...x.koordinat, nama: x.nama, href: tautan(x, b), keterangan, utama }] : [];

function Section({
  id,
  judul,
  keterangan,
  children,
  latar,
}: {
  id: string;
  judul: ReactNode;
  keterangan?: ReactNode;
  children: ReactNode;
  latar?: string;
}) {
  return (
    <section id={id} aria-labelledby={`judul-${id}`} className={latar}>
      <div className={`wadah ${css.bagian}`}>
        <div className={css.kepalaBagian} data-muncul="">
          <h2 id={`judul-${id}`}>{judul}</h2>
          {keterangan && <p>{keterangan}</p>}
        </div>
        <div className={css.isiBagian} data-muncul="" style={{ "--urut": 1 } as CSSProperties}>
          {children}
        </div>
      </div>
    </section>
  );
}

export default function DetailPage({ b, jenis, slug }: { b: Bahasa; jenis: string; slug: string }) {
  const cb = temukan(jenis, slug, b);
  if (!cb) notFound();

  const t = TEKS[b].detail;
  const l = LABEL[b];
  const asli = b === "en" ? "id" : undefined;
  const sekitar = terdekat(cb);
  const anggota = cb.jenis === "kawasan" ? anggotaKawasan(cb.slug) : [];
  const titikUtama = keTitik(cb, b, cb.alamat, true)[0];
  const titikPeta = titikUtama
    ? [
        titikUtama,
        ...sekitar.flatMap(({ cb: x, jarak }) => keTitik(x, b, `${l.jenis[x.jenis]} · ${formatJarak(jarak, b)}`)),
      ]
    : [];
  const titikAnggota = anggota.flatMap((a) => keTitik(a, b, `${l.jenis[a.jenis]} · ${a.alamat}`));
  const foto = cb.foto[0];
  const adaKondisi = !!cb.kondisi || anggota.some((a) => a.kondisi?.umum);
  const tujuan = cb.koordinat
    ? `${cb.koordinat.lat},${cb.koordinat.lng}`
    : encodeURIComponent(`${cb.nama}, ${cb.alamat}`);
  const jelajah = RUTE.jelajah[b];

  const isi = [
    cb.foto.length > 1 && { id: "galeri", label: t.galeri },
    cb.deskripsi && { id: "deskripsi", label: t.deskripsi },
    cb.nilai_penting && { id: "sejarah", label: t.sejarah },
    cb.model_3d && { id: "model-3d", label: TEKS[b].model3d },
    adaKondisi && { id: "kondisi", label: t.kondisi },
    anggota.length > 0 && { id: "anggota", label: t.anggota },
    { id: "lokasi", label: t.lokasi },
    cb.bacaan_terkait.length > 0 && { id: "bacaan", label: t.bacaan },
    sekitar.length > 0 && { id: "sekitar", label: t.sekitar },
  ].filter((x) => !!x);

  return (
    <article>
      <JsonLd data={dataTerstruktur(cb, b)} />
      <JsonLd
        data={remahLd([
          { nama: TEKS[b].beranda, href: RUTE.beranda[b] },
          { nama: l.jenis[cb.jenis], href: `${jelajah}?jenis=${cb.jenis}` },
          { nama: cb.nama, href: tautan(cb, b) },
        ])}
      />
      <header className={`wadah ${css.kepala}`}>
        <nav aria-label={TEKS[b].remah} className={css.remah}>
          <Link href={RUTE.beranda[b]}>{TEKS[b].beranda}</Link> /{" "}
          <Link href={`${jelajah}?jenis=${cb.jenis}`}>{l.jenis[cb.jenis]}</Link> /{" "}
          <Link href={`${jelajah}?wilayah=${cb.wilayah[0]}`}>{l.wilayah[cb.wilayah[0]]}</Link>
        </nav>
        <p className={css.lencana}>
          <span className={css.lencanaSk}>{skPendek(cb)}</span>
          <span>{l.jenis[cb.jenis]}</span>
          {cb.wilayah.map((w) => (
            <span key={w}>{l.wilayah[w]}</span>
          ))}
          {cb.kondisi?.umum && (
            <span className={css.lencanaKondisi} style={warnaTingkat(cb.kondisi.umum)}>
              {t.kondisiLencana(t.tingkat[cb.kondisi.umum])}
            </span>
          )}
          {cb.model_3d && <span className={css.lencana3d}>{TEKS[b].model3d}</span>}
        </p>
        {cb.kelompok && (
          <p className={css.kelompok} lang={asli}>
            {cb.kelompok}
          </p>
        )}
        <h1
          lang={asli}
          className={cb.nama.length > 60 ? css.judulPanjang : cb.nama.length > 32 ? css.judulSedang : undefined}
        >
          {cb.nama}
        </h1>
        {cb.nama_dahulu.length > 0 && (
          <p className={`dulu ${css.dahulu}`}>
            {TEKS[b].dahulu} <span lang={asli}>{cb.nama_dahulu.join(", ")}</span>
          </p>
        )}
        {cb.nama_lain.length > 0 && (
          <p className={css.namaLain}>
            {t.dikenal} <span lang={asli}>{cb.nama_lain.join(", ")}</span>
          </p>
        )}
        <div className={css.aksi}>
          {cb.lembar_pdf && (
            <a href={cb.lembar_pdf.berkas} download className={css.tombolUtama}>
              {t.unduhPdf(cb.lembar_pdf.ukuran_kb)}
            </a>
          )}
          <a href="#lokasi" className={cb.lembar_pdf ? css.tombolKedua : css.tombolUtama}>
            {t.lihatLokasi}
          </a>
          <ShareButtons judul={cb.nama} b={b} />
        </div>
      </header>

      <div className={`wadah ${css.sampul} ${foto ? "" : css.tanpaFoto}`}>
        {foto && (
          <figure className={css.figur}>
            <Photo
              src={foto.berkas}
              srcSet={foto.kecil && `${foto.kecil} 640w, ${foto.berkas} 1600w`}
              sizes="(min-width: 64rem) 60vw, 100vw"
              prioritas
              alt={foto.keterangan ? `${cb.nama}: ${foto.keterangan}` : cb.nama}
              nama={cb.nama}
              rasio="3/2"
              ukuran="besar"
              b={b}
            />
            <figcaption>
              <span className="dulu">{foto.keterangan ?? cb.nama}</span>
              <span>
                {TEKS[b].foto}: {foto.kredit} · {foto.lisensi}
              </span>
            </figcaption>
          </figure>
        )}
        <aside aria-labelledby="judul-lembar" className={css.samping}>
          <h2 id="judul-lembar" className="label">
            {t.lembarData}
          </h2>
          <DataSheet cb={cb} b={b} jumlahAnggota={anggota.length} />
        </aside>
      </div>

      {isi.length > 1 && (
        <nav aria-label={t.isiHalaman} className={css.navIsi}>
          <ul className="wadah">
            {isi.map((x) => (
              <li key={x.id}>
                <a href={`#${x.id}`}>{x.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {cb.foto.length > 1 && (
        <Section id="galeri" judul={t.galeri} keterangan={t.jumlahFoto(cb.foto.length)} latar={css.latarPutih}>
          <PhotoAlbum
            b={b}
            foto={cb.foto.map((f, i) => ({
              src: f.berkas,
              kecil: f.kecil,
              alt: f.keterangan ? `${cb.nama}: ${f.keterangan}` : `${cb.nama}, ${t.fotoKe(i + 1)}`,
              kredit: `${TEKS[b].foto}: ${f.kredit} · ${f.lisensi}`,
            }))}
          />
        </Section>
      )}

      {cb.deskripsi && (
        <Section id="deskripsi" judul={t.deskripsi}>
          {t.hanyaId && <p className={css.hanyaId}>{t.hanyaId}</p>}
          <div className={`${css.prosa} ${css.prosaDeskripsi}`} lang={asli}>
            <Paragraphs teks={cb.deskripsi} />
          </div>
        </Section>
      )}

      {cb.nilai_penting && (
        <Section id="sejarah" judul={t.sejarah} latar={cb.deskripsi ? css.latarArsip : undefined}>
          {t.hanyaId && !cb.deskripsi && <p className={css.hanyaId}>{t.hanyaId}</p>}
          <div className={css.prosa} lang={asli}>
            <History teks={cb.nilai_penting} />
          </div>
        </Section>
      )}

      {cb.model_3d && (
        <Section id="model-3d" judul={TEKS[b].model3d} latar={cb.deskripsi ? css.latarPutih : css.latarArsip}>
          <Model3D nama={cb.nama} data={cb.model_3d} b={b} />
        </Section>
      )}

      {adaKondisi && (
        <Section id="kondisi" judul={t.kondisiJudul} keterangan={cb.kondisi && t.pendataan(cb.kondisi.tahun)}>
          <ConditionReport cb={cb} anggota={anggota} b={b} />
        </Section>
      )}

      {anggota.length > 0 && (
        <Section id="anggota" judul={t.diKawasan(anggota.length)}>
          {titikAnggota.length > 0 && (
            <MapView titik={titikAnggota} label={t.petaKawasan(cb.nama)} kelompok className={css.petaKawasan} b={b} />
          )}
          {JENIS.filter((j) => anggota.some((a) => a.jenis === j)).map((j) => (
            <div key={j} className={css.kelompokAnggota}>
              <h3 className="label">{l.jenis[j]}</h3>
              <ul className={css.daftar} lang={asli}>
                {anggota
                  .filter((a) => a.jenis === j)
                  .map((a) => (
                    <li key={a.id}>
                      <Link href={tautan(a, b)}>{a.nama}</Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      <section id="lokasi" aria-labelledby="judul-lokasi" className={css.latarPutih}>
        <div className={`wadah ${css.lokasi}`}>
          <div className={css.infoLokasi} data-muncul="">
            <h2 id="judul-lokasi">{t.lokasi}</h2>
            <p lang={asli}>{cb.alamat}</p>
            {cb.akses && (
              <p lang={asli} className={css.akses}>
                {cb.akses}
              </p>
            )}
            {cb.batas && (
              <div>
                <p className="label">{t.batas}</p>
                <dl className={css.batas}>
                  {(["utara", "timur", "selatan", "barat"] as const).map(
                    (k) =>
                      cb.batas?.[k] && (
                        <div key={k}>
                          <dt>
                            <abbr title={t.mataAngin[k][1]}>{t.mataAngin[k][0]}</abbr>
                          </dt>
                          <dd lang={asli}>{cb.batas[k]}</dd>
                        </div>
                      ),
                  )}
                </dl>
              </div>
            )}
            {cb.koordinat && (
              <div>
                <p className="label">{t.koordinat}</p>
                <p className={css.angka}>{formatKoordinat(cb.koordinat, b)}</p>
              </div>
            )}
            <p className={css.tautanPeta}>
              {cb.koordinat && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${cb.koordinat.lat}&mlon=${cb.koordinat.lng}#map=18/${cb.koordinat.lat}/${cb.koordinat.lng}`}
                  target="_blank"
                  rel="noopener"
                >
                  {t.bukaOsm}
                </a>
              )}
              <a
                href={
                  cb.koordinat
                    ? `https://www.google.com/maps/dir/?api=1&destination=${tujuan}`
                    : `https://www.google.com/maps/search/?api=1&query=${tujuan}`
                }
                target="_blank"
                rel="noopener"
              >
                {cb.koordinat ? t.arah : t.cariGoogle}
              </a>
            </p>
          </div>
          {titikUtama ? (
            <MapView titik={titikPeta} pusat={titikUtama} label={t.petaLokasi(cb.nama)} className={css.peta} b={b} />
          ) : (
            <div className={css.petaKosong}>
              <p>{t.tanpaKoordinat}</p>
            </div>
          )}
        </div>
      </section>

      {cb.bacaan_terkait.length > 0 && (
        <Section id="bacaan" judul={t.bacaan}>
          <ol className={css.bacaan}>
            {cb.bacaan_terkait.map((x) => (
              <li key={x.judul}>
                {x.url ? (
                  <a href={x.url} target="_blank" rel="noopener">
                    {x.judul}
                  </a>
                ) : (
                  x.judul
                )}
                {x.keterangan && <span> · {x.keterangan}</span>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {sekitar.length > 0 && (
        <section id="sekitar" aria-labelledby="judul-sekitar" className={css.sekitar}>
          <div className="wadah">
            <h2 id="judul-sekitar" data-muncul="">
              {t.sekitarJudul[0]} <span className="dulu">{t.sekitarJudul[1]}</span>
            </h2>
            <ul>
              {sekitar.map(({ cb: x, jarak }, i) => (
                <li key={x.id} data-muncul="" style={{ "--urut": i } as CSSProperties}>
                  <Card cb={ringkas(x)} keterangan={formatJarak(jarak, b)} b={b} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
