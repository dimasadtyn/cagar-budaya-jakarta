import Link from "next/link";
import type { CSSProperties } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import Card from "@/components/Card";
import MapView, { type Titik } from "@/components/MapView";
import RecentSearches from "@/components/RecentSearches";
import {
  daftarCagarBudaya,
  denganModel3D,
  jumlahPerJenis,
  jumlahPerWilayah,
  pernahBernamaLain,
  slideBeranda,
} from "@/lib/data";
import { LABEL, RUTE, tautan, type Bahasa } from "@/lib/labels";
import { ringkas } from "@/lib/summary";
import { JENIS, WILAYAH, type Jenis } from "@/lib/schema";
import css from "./home.module.css";

const CONTOH_JENIS: Record<Bahasa, Record<Jenis, string>> = {
  id: {
    bangunan: "Gedung, rumah, rumah ibadah, kantor",
    struktur: "Jembatan, makam, tugu, kanal",
    benda: "Prasasti, arca, lukisan, senjata",
    situs: "Lokasi temuan dan bekas bangunan",
    kawasan: "Kota Tua, Gugusan Pulau Onrust",
  },
  en: {
    bangunan: "Buildings, houses, places of worship, offices",
    struktur: "Bridges, tombs, monuments, canals",
    benda: "Inscriptions, statues, paintings, weapons",
    situs: "Find spots and former building sites",
    kawasan: "Old Town, Onrust Island cluster",
  },
};

const TEKS = {
  id: {
    labelHero: "Katalog cagar budaya Provinsi DKI Jakarta",
    judul: ["Kenali cagar budaya Jakarta, ", "dari masa ke masa."],
    lead: (n: number) =>
      `${n} benda, struktur, bangunan, situs, dan kawasan yang telah ditetapkan, lengkap dengan sejarah dan lokasinya.`,
    cariLabel: "Cari cagar budaya",
    cariPlaceholder: "Cari nama, alamat, atau kata kunci",
    cari: "Cari",
    kategori: ["Jelajahi berdasarkan ", "kategori"],
    semua: (n: number) => `Lihat semua ${n} →`,
    jumlah: (n: number) => `${n} cagar budaya`,
    wilayah: ["Atau berdasarkan ", "wilayah"],
    petaPenuh: "Buka peta penuh →",
    petaLabel: "Peta sebaran cagar budaya di Jakarta",
    sorotan: ["Sorotan ", "katalog"],
    sorotanLead: "Bangunan yang dulu dikenal dengan nama lain.",
    lebih: "Lihat lebih banyak →",
    model: ["Model ", "3D"],
    modelLead: (n: number, nama: string) =>
      `${n === 5 ? "Lima" : n} bangunan sudah dipindai dengan laser dan dimodelkan 3D: ${nama}.`,
    modelSemua: (n: number) => (n === 5 ? "Lihat kelimanya →" : "Lihat semuanya →"),
    dan: "dan",
    altPointCloud: (nama: string) => `Point cloud ${nama}`,
  },
  en: {
    labelHero: "Catalogue of cultural heritage in DKI Jakarta Province",
    judul: ["Discover Jakarta's cultural heritage, ", "through the ages."],
    lead: (n: number) =>
      `${n} designated objects, structures, buildings, sites, and areas, each with its history and location.`,
    cariLabel: "Search cultural heritage",
    cariPlaceholder: "Search by name, address, or keyword",
    cari: "Search",
    kategori: ["Explore by ", "category"],
    semua: (n: number) => `See all ${n} →`,
    jumlah: (n: number) => `${n} heritage sites`,
    wilayah: ["Or by ", "region"],
    petaPenuh: "Open full map →",
    petaLabel: "Map of cultural heritage across Jakarta",
    sorotan: ["Catalogue ", "highlights"],
    sorotanLead: "Buildings once known by another name.",
    lebih: "See more →",
    model: ["3D ", "models"],
    modelLead: (n: number, nama: string) =>
      `${n === 5 ? "Five" : n} buildings have been laser-scanned and modelled in 3D: ${nama}.`,
    modelSemua: (n: number) => (n === 5 ? "See all five →" : "See all →"),
    dan: "and",
    altPointCloud: (nama: string) => `Point cloud of ${nama}`,
  },
};

const PUSAT_DARATAN = { lat: -6.2, lng: 106.835 };

const urut = (i: number) => ({ "--urut": i }) as CSSProperties;

export default function HomePage({ b }: { b: Bahasa }) {
  const t = TEKS[b];
  const l = LABEL[b];
  const semua = daftarCagarBudaya();
  const perJenis = jumlahPerJenis();
  const perWilayah = jumlahPerWilayah();
  const model3d = denganModel3D();
  const sorotan = pernahBernamaLain().slice(0, 3);
  const namaModel = model3d.map((cb) => cb.nama);
  const daftarModel =
    namaModel.length > 1 ? `${namaModel.slice(0, -1).join(", ")}, ${t.dan} ${namaModel.at(-1)}` : namaModel[0];
  const contohPointCloud = model3d.find((cb) => cb.model_3d?.point_cloud.length);

  const titik: Titik[] = semua.flatMap((cb) =>
    cb.koordinat
      ? [{ id: cb.id, ...cb.koordinat, nama: cb.nama, href: tautan(cb, b), keterangan: l.jenis[cb.jenis] }]
      : [],
  );

  const slide = slideBeranda().map(({ cb, foto, alt, kredit }) => ({
    foto,
    alt,
    kredit,
    nama: cb.nama,
    namaDahulu: cb.nama_dahulu[0] ?? null,
    keterangan: `${l.jenis[cb.jenis]} · ${cb.wilayah.map((w) => l.wilayah[w]).join(", ")}`,
    href: tautan(cb, b),
  }));

  return (
    <>
      <HeroCarousel slide={slide} b={b}>
        <div className={css.pembuka}>
          <p className="label">{t.labelHero}</p>
          <h1>
            {t.judul[0]}
            <span className="dulu">{t.judul[1]}</span>
          </h1>
          <p className={css.lead}>{t.lead(semua.length)}</p>
          <form action={RUTE.jelajah[b]} method="get" role="search" className={css.cari}>
            <label htmlFor="cari-beranda" className="sr-only">
              {t.cariLabel}
            </label>
            <input id="cari-beranda" name="q" type="search" placeholder={t.cariPlaceholder} />
            <button type="submit">{t.cari}</button>
          </form>
          <RecentSearches b={b} gelap />
        </div>
      </HeroCarousel>

      <section className={css.pitaPutih} aria-labelledby="judul-jenis">
        <div className={`wadah ${css.bagian}`}>
          <div className={css.kepala} data-muncul="">
            <h2 id="judul-jenis">
              {t.kategori[0]}
              <span className="dulu">{t.kategori[1]}</span>
            </h2>
            <Link href={RUTE.jelajah[b]} className={css.semua}>
              {t.semua(semua.length)}
            </Link>
          </div>
          <ul className={css.jenis}>
            {JENIS.map((j, i) => (
              <li key={j} data-muncul="" style={urut(i)}>
                <Link href={`${RUTE.jelajah[b]}?jenis=${j}`}>
                  <span className={css.angka}>{t.jumlah(perJenis[j])}</span>
                  <span>
                    <span className={css.namaJenis}>
                      {l.jenis[j]}
                      <span className={css.panah} aria-hidden="true">
                        →
                      </span>
                    </span>
                    <span className={css.contoh}>{CONTOH_JENIS[b][j]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`wadah ${css.wilayah}`} aria-labelledby="judul-wilayah">
        <div className={css.kolomDaftar} data-muncul="">
          <h2 id="judul-wilayah">
            {t.wilayah[0]}
            <span className="dulu">{t.wilayah[1]}</span>
          </h2>
          <ul className={css.daftar}>
            {WILAYAH.map((w) => (
              <li key={w}>
                <Link href={`${RUTE.jelajah[b]}?wilayah=${w}`}>
                  <span>{l.wilayah[w]}</span>
                  <span className={css.hitung}>
                    {perWilayah[w]} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={css.kolomPeta} data-muncul="" style={urut(1)}>
          <MapView
            titik={titik}
            label={t.petaLabel}
            kelompok
            pusat={PUSAT_DARATAN}
            zoom={10.6}
            className={css.peta}
            b={b}
          />
          <Link href={`${RUTE.jelajah[b]}?tampilan=peta`} className={css.semua}>
            {t.petaPenuh}
          </Link>
        </div>
      </section>

      {sorotan.length > 0 && (
        <section className={css.pitaPutih} aria-labelledby="judul-sorotan">
          <div className={`wadah ${css.bagian}`}>
            <div className={css.kepala} data-muncul="">
              <div>
                <h2 id="judul-sorotan">
                  {t.sorotan[0]}
                  <span className="dulu">{t.sorotan[1]}</span>
                </h2>
                <p className={css.subjudul}>{t.sorotanLead}</p>
              </div>
              <Link href={RUTE.jelajah[b]} className={css.semua}>
                {t.lebih}
              </Link>
            </div>
            <ul className={css.sorotan}>
              {sorotan.map((cb, i) => (
                <li key={cb.id} data-muncul="" style={urut(i)}>
                  <Card cb={ringkas(cb)} b={b} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className={`wadah ${css.bagianModel}`} aria-labelledby="judul-3d">
        <div className={css.strip} data-muncul="">
          {contohPointCloud && (
            <img
              src={contohPointCloud.model_3d!.point_cloud[0]}
              alt={t.altPointCloud(contohPointCloud.nama)}
              loading="lazy"
            />
          )}
          <div className={css.stripTeks}>
            <h2 id="judul-3d">
              {t.model[0]}
              <span className="dulu">{t.model[1]}</span>
            </h2>
            <p>{t.modelLead(model3d.length, daftarModel)}</p>
          </div>
          <Link href={RUTE.model3d[b]} className={css.semua}>
            {t.modelSemua(model3d.length)}
          </Link>
        </div>
      </section>
    </>
  );
}
