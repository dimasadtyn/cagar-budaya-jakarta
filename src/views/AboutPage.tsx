import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { daftarCagarBudaya, denganModel3D, jumlahPerJenis } from "@/lib/data";
import { alternatif, LABEL, RUTE, type Bahasa } from "@/lib/labels";
import { JENIS } from "@/lib/schema";
import { TEKS } from "@/lib/messages";
import css from "./shared.module.css";

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener">
    {children}
  </a>
);

const ISI = {
  id: {
    judul: "Tentang",
    judulH1: ["Tentang ", "katalog ini"],
    deskripsi:
      "Tentang katalog cagar budaya Provinsi DKI Jakarta: sumber data, dasar hukum, dan cara menghubungi Dinas Kebudayaan.",
    lead: "Katalog daring cagar budaya yang telah ditetapkan di Provinsi DKI Jakarta, disusun oleh Dinas Kebudayaan supaya siapa pun bisa mengenali, menemukan, dan ikut menjaga warisan kota.",
    isiKatalog: "Isi katalog",
    cagarBudaya: "Cagar budaya",
    punyaTitik: "Punya titik peta",
    punya3d: "Punya model 3D",
    sumber: "Sumber data",
    teksSumber: (b: Bahasa) => (
      <>
        <p>
          Data diambil dari daftar cagar budaya yang dikelola Dinas Kebudayaan Provinsi DKI Jakarta: nama, nomor surat
          keputusan penetapan, alamat, kepemilikan, catatan nilai penting, dan titik koordinat. Daftar ini diperbarui
          setiap kali ada penetapan baru.
        </p>
        <p>
          Sebagian data masih dilengkapi, misalnya titik koordinat dan foto. Untuk pemilik perorangan, katalog hanya
          mencantumkan status kepemilikannya, tanpa nama.
        </p>
        <p>
          Model 3D dan point cloud berasal dari program pendokumentasian Heritage Building Information Modelling (HBIM)
          Dinas Kebudayaan sejak 2022. Lihat <Link href={RUTE.model3d[b]}>Model 3D</Link>.
        </p>
      </>
    ),
    hukum: "Dasar hukum",
    teksHukum: (
      <p>
        Cagar budaya ditetapkan berdasarkan Undang-Undang Nomor 11 Tahun 2010 tentang Cagar Budaya. Nomor surat
        keputusan penetapan setiap objek tercantum di lembar datanya.
      </p>
    ),
    peta: "Peta dan foto",
    teksPeta: (
      <p>
        Peta memakai data © kontributor{" "}
        <ExternalLink href="https://www.openstreetmap.org/copyright">OpenStreetMap</ExternalLink>, tile dari{" "}
        <ExternalLink href="https://openfreemap.org">OpenFreeMap</ExternalLink> dan{" "}
        <ExternalLink href="https://openmaptiles.org">OpenMapTiles</ExternalLink>. Kredit dan lisensi foto tercantum di
        bawah setiap foto.
      </p>
    ),
    privasi: "Privasi",
    teksPrivasi: (
      <>
        <p>Situs ini tidak memakai cookie, analitik, atau pelacak, dan tidak meminta data pribadi apa pun.</p>
        <p>
          Lima pencarian terakhir Anda disimpan di penyimpanan lokal (localStorage) browser supaya bisa ditampilkan lagi
          di bawah kotak pencarian. Riwayat ini tidak pernah dikirim ke Dinas Kebudayaan maupun pihak lain, dan bisa
          dihapus kapan saja lewat tombol &ldquo;Hapus riwayat&rdquo; atau dengan menghapus data situs di browser.
        </p>
        <p>
          Peta dimuat dari server OpenFreeMap. Seperti setiap permintaan di internet, layanan tersebut menerima alamat
          IP perangkat Anda. Model 3D disajikan langsung dari situs ini.
        </p>
      </>
    ),
    bahasa: null as string | null,
    teksBahasa: null as ReactNode,
    kontak: "Kontak",
    teksKontak: (
      <p>
        Menemukan data yang keliru atau punya informasi tambahan tentang sebuah cagar budaya? Sampaikan kepada Dinas
        Kebudayaan Provinsi DKI Jakarta.
      </p>
    ),
  },
  en: {
    judul: "About",
    judulH1: ["About ", "this catalogue"],
    deskripsi:
      "About the catalogue of cultural heritage in DKI Jakarta Province: data sources, legal basis, and how to reach the Department of Culture.",
    lead: "An online catalogue of designated cultural heritage in DKI Jakarta Province, compiled by the Department of Culture so that anyone can recognise, find, and help care for the city's heritage.",
    isiKatalog: "In the catalogue",
    cagarBudaya: "Heritage sites",
    punyaTitik: "With map location",
    punya3d: "With 3D model",
    sumber: "Data sources",
    teksSumber: (b: Bahasa) => (
      <>
        <p>
          The data comes from the register of cultural heritage kept by the Department of Culture of DKI Jakarta
          Province: names, designation decree numbers, addresses, ownership, statements of significance, and
          coordinates. The register is updated whenever a new designation is made.
        </p>
        <p>
          Some data is still being completed, such as coordinates and photos. For privately owned heritage, the
          catalogue lists only the ownership status, without the owner&rsquo;s name.
        </p>
        <p>
          The 3D models and point clouds come from the Department of Culture&rsquo;s Heritage Building Information
          Modelling (HBIM) documentation programme, running since 2022. See{" "}
          <Link href={RUTE.model3d[b]}>3D Models</Link>.
        </p>
      </>
    ),
    hukum: "Legal basis",
    teksHukum: (
      <p>
        Cultural heritage is designated under Law No. 11 of 2010 on Cultural Heritage. The decree number for each
        designation appears on its fact sheet.
      </p>
    ),
    peta: "Maps and photos",
    teksPeta: (
      <p>
        Maps use data © <ExternalLink href="https://www.openstreetmap.org/copyright">OpenStreetMap</ExternalLink>{" "}
        contributors, with tiles from <ExternalLink href="https://openfreemap.org">OpenFreeMap</ExternalLink> and{" "}
        <ExternalLink href="https://openmaptiles.org">OpenMapTiles</ExternalLink>. Photo credits and licences appear
        below each photo.
      </p>
    ),
    privasi: "Privacy",
    teksPrivasi: (
      <>
        <p>This site uses no cookies, analytics, or trackers, and does not ask for any personal data.</p>
        <p>
          Your five most recent searches are kept in your browser&rsquo;s local storage (localStorage) so they can be
          shown again below the search box. This history is never sent to the Department of Culture or anyone else, and
          you can delete it at any time with the &ldquo;Clear history&rdquo; button or by clearing this site&rsquo;s
          data in your browser.
        </p>
        <p>
          Maps are loaded from OpenFreeMap&rsquo;s servers. As with any request on the internet, that service receives
          your device&rsquo;s IP address. 3D models are served directly from this site.
        </p>
      </>
    ),
    bahasa: "Language",
    teksBahasa: (
      <p>
        The interface of this site is available in English. Names, histories, and addresses of heritage sites come from
        the official register and are shown in Indonesian.
      </p>
    ),
    kontak: "Contact",
    teksKontak: (
      <p>
        Found an error, or have more information about a heritage site? Please let the Department of Culture of DKI
        Jakarta Province know.
      </p>
    ),
  },
};

export const metadataTentang = (b: Bahasa): Metadata => ({
  title: ISI[b].judul,
  description: ISI[b].deskripsi,
  alternates: { canonical: RUTE.tentang[b], languages: alternatif(RUTE.tentang.id, RUTE.tentang.en) },
});

const urut = (i: number) => ({ "--urut": i }) as CSSProperties;

function Section({ id, judul, children }: { id: string; judul: string; children: ReactNode }) {
  return (
    <section className={css.bagian} aria-labelledby={`judul-${id}`}>
      <h2 id={`judul-${id}`} data-muncul="">
        {judul}
      </h2>
      <div className={css.prosa} data-muncul="" style={urut(1)}>
        {children}
      </div>
    </section>
  );
}

export default function AboutPage({ b }: { b: Bahasa }) {
  const isi = ISI[b];
  const semua = daftarCagarBudaya();
  const perJenis = jumlahPerJenis();
  const angka = [
    [isi.cagarBudaya, semua.length],
    ...JENIS.map((j) => [LABEL[b].jenis[j], perJenis[j]] as const),
    [isi.punyaTitik, semua.filter((cb) => cb.koordinat).length],
    [isi.punya3d, denganModel3D().length],
  ] as const;

  return (
    <div className="wadah">
      <header className={css.kepala}>
        <nav aria-label={TEKS[b].remah} className={css.remah}>
          <Link href={RUTE.beranda[b]}>{TEKS[b].beranda}</Link> / {isi.judul}
        </nav>
        <h1>
          {isi.judulH1[0]}
          <span className="dulu">{isi.judulH1[1]}</span>
        </h1>
        <p className={css.lead}>{isi.lead}</p>
      </header>

      <section className={css.bagian} aria-labelledby="judul-isi">
        <h2 id="judul-isi" data-muncul="">
          {isi.isiKatalog}
        </h2>
        <dl className={css.angka}>
          {angka.map(([label, n], i) => (
            <div key={label} data-muncul="" style={urut(i)}>
              <dt>{label}</dt>
              <dd>{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section id="sumber" judul={isi.sumber}>
        {isi.teksSumber(b)}
      </Section>
      <Section id="hukum" judul={isi.hukum}>
        {isi.teksHukum}
      </Section>
      <Section id="peta" judul={isi.peta}>
        {isi.teksPeta}
      </Section>
      {isi.bahasa && (
        <Section id="bahasa" judul={isi.bahasa}>
          {isi.teksBahasa}
        </Section>
      )}
      <Section id="privasi" judul={isi.privasi}>
        {isi.teksPrivasi}
      </Section>
      <Section id="kontak" judul={isi.kontak}>
        {isi.teksKontak}
      </Section>
    </div>
  );
}
