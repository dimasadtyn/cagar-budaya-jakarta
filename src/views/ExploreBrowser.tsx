"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Photo from "@/components/Photo";
import Card from "@/components/Card";
import MapView, { type Titik } from "@/components/MapView";
import RecentSearches from "@/components/RecentSearches";
import { LABEL, RUTE, tautan, type Bahasa } from "@/lib/labels";
import { buatIndeks, cari, type DokumenCari } from "@/lib/search";
import { catatRiwayat } from "@/lib/search-history";
import type { Ringkas } from "@/lib/summary";
import { JENIS, KEPEMILIKAN, WILAYAH } from "@/lib/schema";
import { TEKS } from "@/lib/messages";
import css from "./explore.module.css";

export type Pilihan = { nilai: string; label: string };

const PER_HALAMAN = 24;
const KUNCI = ["jenis", "wilayah", "kecamatan", "kepemilikan", "kawasan", "model3d"] as const;
type Kunci = (typeof KUNCI)[number];
type Saring = Partial<Record<Kunci, string>>;

const cocok: Record<Kunci, (r: Ringkas, v: string) => boolean> = {
  jenis: (r, v) => r.jenis === v,
  wilayah: (r, v) => (r.wilayah as string[]).includes(v),
  kecamatan: (r, v) => r.kecamatan.includes(v),
  kepemilikan: (r, v) => r.kepemilikan === v,
  kawasan: (r, v) => r.kawasan === v || r.area === v || r.slug === v,
  model3d: (r) => r.model3d,
};

function saring(data: Ringkas[], s: Saring, skor: Map<string, number> | null, kecuali?: Kunci) {
  return data.filter(
    (r) => (!skor || skor.has(r.id)) && KUNCI.every((k) => k === kecuali || !s[k] || cocok[k](r, s[k])),
  );
}

const TAMPILAN = ["grid", "daftar", "peta"] as const;
type Tampilan = (typeof TAMPILAN)[number];

function baca(qs: string) {
  const params = new URLSearchParams(qs);
  const t = params.get("tampilan");
  const q = params.get("q") ?? "";
  return {
    q,
    s: Object.fromEntries(KUNCI.flatMap((k) => (params.get(k) ? [[k, params.get(k)!]] : []))) as Saring,
    urut: params.get("urut") ?? (q ? "relevan" : "foto"),
    tampilan: (TAMPILAN as readonly string[]).includes(t ?? "") ? (t as Tampilan) : "grid",
  };
}

const hitung = (data: Ringkas[], f: (r: Ringkas) => boolean) => data.filter(f).length;
const urutan = (i: number) => ({ "--i": i % PER_HALAMAN }) as CSSProperties;

function FilterGroup({ judul, children, gaya }: { judul: string; children: ReactNode; gaya?: string }) {
  return (
    <fieldset className={css.grup}>
      <legend className={css.judulGrup}>{judul}</legend>
      <div className={gaya}>{children}</div>
    </fieldset>
  );
}

function useParameter() {
  const router = useRouter();
  const pathname = usePathname();
  const qs = useSearchParams().toString();

  function ubah(perubahan: Record<string, string | null>) {
    const baru = new URLSearchParams(qs);
    for (const [k, v] of Object.entries(perubahan)) {
      if (v) baru.set(k, v);
      else baru.delete(k);
    }
    if (perubahan.wilayah !== undefined) baru.delete("kecamatan");
    const teks = baru.toString();
    router.replace(teks ? `${pathname}?${teks}` : pathname, { scroll: false });
  }

  return { qs, pathname, ubah };
}

export function SearchForm({
  b,
  q = "",
  onCari,
  children,
}: {
  b: Bahasa;
  q?: string;
  onCari?: (q: string | null) => void;
  children?: ReactNode;
}) {
  const [teks, setTeks] = useState(q);
  const [qTerakhir, setQTerakhir] = useState(q);
  if (q !== qTerakhir) {
    setQTerakhir(q);
    setTeks(q);
  }

  return (
    <div className={css.kolomCari}>
      <form
        action={RUTE.jelajah[b]}
        method="get"
        role="search"
        className={css.cari}
        onSubmit={(e) => {
          if (!onCari) return;
          e.preventDefault();
          onCari(String(new FormData(e.currentTarget).get("q") ?? "").trim() || null);
        }}
      >
        <label htmlFor="cari-jelajah" className="sr-only">
          {TEKS[b].cariCagarBudaya}
        </label>
        <input
          id="cari-jelajah"
          name="q"
          type="search"
          value={teks}
          onChange={(e) => {
            setTeks(e.target.value);
            if (onCari && q && !e.target.value.trim()) onCari(null);
          }}
          placeholder={TEKS[b].jelajah.placeholder}
        />
        <button type="submit">{TEKS[b].cari}</button>
      </form>
      {children}
    </div>
  );
}

export function ExploreSearch({ b }: { b: Bahasa }) {
  const { qs, ubah } = useParameter();
  const q = new URLSearchParams(qs).get("q") ?? "";
  return (
    <SearchForm b={b} q={q} onCari={(q) => ubah({ q })}>
      {!q && <RecentSearches b={b} onPilih={(q) => ubah({ q })} />}
    </SearchForm>
  );
}

export default function ExploreBrowser({
  data,
  dokumen,
  kawasan,
  b,
}: {
  data: Ringkas[];
  dokumen: DokumenCari[];
  kawasan: Pilihan[];
  b: Bahasa;
}) {
  const t = TEKS[b].jelajah;
  const l = LABEL[b];
  const { qs, pathname, ubah } = useParameter();
  const { q, s, urut, tampilan } = useMemo(() => baca(qs), [qs]);

  const [lihat, setLihat] = useState({ kunci: qs, n: PER_HALAMAN });
  const batas = lihat.kunci === qs ? lihat.n : PER_HALAMAN;
  const [buka, setBuka] = useState(false);

  const indeks = useMemo(() => buatIndeks(dokumen), [dokumen]);
  const hasilCari = useMemo(() => cari(indeks, q), [indeks, q]);
  const skor = hasilCari?.skor ?? null;

  useEffect(() => {
    if (q && hasilCari?.skor.size && !hasilCari.saran) catatRiwayat(q);
  }, [q, hasilCari]);
  const faset = (k: Kunci) => saring(data, s, skor, k);

  const pilihan = (k: Kunci, nilai: string | null, label: string, jumlah: number, gaya: string) => {
    const aktif = nilai === null ? !s[k] : s[k] === nilai;
    return (
      <button
        key={nilai ?? "semua"}
        type="button"
        aria-pressed={aktif}
        className={gaya}
        disabled={!aktif && jumlah === 0}
        onClick={() => ubah({ [k]: aktif || nilai === null ? null : nilai })}
      >
        <span>{label}</span>
        <span className={css.jumlah}>{jumlah}</span>
      </button>
    );
  };

  const hasil = useMemo(
    () =>
      saring(data, s, skor).sort((a, b) =>
        urut === "relevan" && skor
          ? skor.get(b.id)! - skor.get(a.id)!
          : urut === "nama-z"
            ? b.nama.localeCompare(a.nama, "id")
            : (urut === "foto" ? Number(!!b.foto) - Number(!!a.foto) : 0) || a.nama.localeCompare(b.nama, "id"),
      ),
    [data, s, skor, urut],
  );
  const titik = useMemo<Titik[]>(
    () =>
      hasil.flatMap((r) =>
        r.koordinat
          ? [
              {
                id: r.id,
                ...r.koordinat,
                nama: r.nama,
                href: tautan(r, b),
                keterangan: `${l.jenis[r.jenis]} · ${r.kecamatan.join(", ") || l.wilayah[r.wilayah[0]]}`,
              },
            ]
          : [],
      ),
    [hasil, b, l],
  );

  const dasarJenis = faset("jenis");
  const dasarWilayah = faset("wilayah");
  const dasarKepemilikan = faset("kepemilikan");
  const dasarKawasan = faset("kawasan");
  const dasarKecamatan = faset("kecamatan");
  const kecamatan = [
    ...new Set(data.filter((r) => !s.wilayah || cocok.wilayah(r, s.wilayah)).flatMap((r) => r.kecamatan)),
  ].sort((a, b) => a.localeCompare(b, "id"));
  const jumlahAktif = KUNCI.filter((k) => s[k]).length;
  const adaSaring = q !== "" || jumlahAktif > 0;
  const punya3d = s.model3d === "1";

  return (
    <div className={css.tata}>
      <aside className={css.saring} aria-label={t.saring}>
        <button
          type="button"
          className={css.bukaSaring}
          aria-expanded={buka}
          aria-controls="panel-saring"
          onClick={() => setBuka(!buka)}
        >
          <span>
            {t.filter}
            {jumlahAktif > 0 && ` (${jumlahAktif})`}
          </span>
          <span aria-hidden="true" className={css.tanda} />
        </button>

        <div id="panel-saring" className={css.panel} data-buka={buka}>
          <FilterGroup judul={t.kategori} gaya={css.chips}>
            {pilihan("jenis", null, t.semua, dasarJenis.length, css.chip)}
            {JENIS.map((j) =>
              pilihan(
                "jenis",
                j,
                l.jenis[j],
                hitung(dasarJenis, (r) => r.jenis === j),
                css.chip,
              ),
            )}
          </FilterGroup>

          <FilterGroup judul={t.wilayah} gaya={css.baris}>
            {pilihan("wilayah", null, t.semua, dasarWilayah.length, css.pilihan)}
            {WILAYAH.map((w) =>
              pilihan(
                "wilayah",
                w,
                l.wilayah[w],
                hitung(dasarWilayah, (r) => cocok.wilayah(r, w)),
                css.pilihan,
              ),
            )}
          </FilterGroup>

          <FilterGroup judul={t.kecamatan}>
            <select
              className={css.pilih}
              aria-label={t.kecamatan}
              value={s.kecamatan ?? ""}
              onChange={(e) => ubah({ kecamatan: e.target.value || null })}
            >
              <option value="">{t.semuaKecamatan}</option>
              {kecamatan.map((k) => (
                <option key={k} value={k}>
                  {k} ({hitung(dasarKecamatan, (r) => r.kecamatan.includes(k))})
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup judul={t.kepemilikan} gaya={css.chips}>
            {KEPEMILIKAN.map((k) =>
              pilihan(
                "kepemilikan",
                k,
                l.kepemilikan[k],
                hitung(dasarKepemilikan, (r) => r.kepemilikan === k),
                css.chip,
              ),
            )}
          </FilterGroup>

          <FilterGroup judul={t.kawasan} gaya={css.baris}>
            {kawasan.map((k) =>
              pilihan(
                "kawasan",
                k.nilai,
                k.label,
                hitung(dasarKawasan, (r) => cocok.kawasan(r, k.nilai)),
                css.pilihan,
              ),
            )}
          </FilterGroup>

          <FilterGroup judul={t.data3d}>
            <button
              type="button"
              role="switch"
              aria-checked={punya3d}
              className={css.sakelar}
              onClick={() => ubah({ model3d: punya3d ? null : "1" })}
            >
              <span className={css.kotak} aria-hidden="true" />
              <span>{t.punya3d}</span>
              <span className={css.jumlah}>{hitung(faset("model3d"), (r) => r.model3d)}</span>
            </button>
          </FilterGroup>

          {adaSaring && (
            <Link href={pathname} scroll={false} className={css.hapus}>
              {t.hapus}
            </Link>
          )}
        </div>
      </aside>

      <section className={css.hasil} aria-labelledby="jumlah-hasil">
        <div className={css.alat}>
          {hasilCari?.saran && (
            <p className={css.saran}>
              {t.saran}{" "}
              <button type="button" onClick={() => ubah({ q: hasilCari.saran })}>
                {hasilCari.saran}
              </button>
            </p>
          )}
          <p id="jumlah-hasil" aria-live="polite" className={css.jumlahHasil}>
            <strong key={hasil.length}>{hasil.length}</strong> {t.ditemukan}
          </p>
          <div className={css.kontrol}>
            <label>
              {t.urutkan}{" "}
              <select
                className={css.pilih}
                value={urut}
                onChange={(e) => ubah({ urut: e.target.value === (q ? "relevan" : "foto") ? null : e.target.value })}
              >
                {q && <option value="relevan">{t.relevan}</option>}
                <option value="foto">{t.berfoto}</option>
                <option value="nama">{t.az}</option>
                <option value="nama-z">{t.za}</option>
              </select>
            </label>
            <div role="group" aria-label={t.tampilan} className={css.tampilan}>
              {TAMPILAN.map((x) => (
                <button
                  key={x}
                  type="button"
                  aria-pressed={tampilan === x}
                  onClick={() => ubah({ tampilan: x === "grid" ? null : x })}
                >
                  {t[x]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {hasil.length === 0 ? (
          <div className={css.kosong}>
            <p className={css.kosongJudul}>{t.kosong}</p>
            <p>{t.kosongSaran}</p>
            <Link href={pathname} scroll={false} className={css.tombol}>
              {t.hapus}
            </Link>
          </div>
        ) : tampilan === "peta" ? (
          <div className={css.muncul}>
            <MapView titik={titik} label={t.petaLabel} zoom={17} kelompok className={css.peta} b={b} />
            {hasil.length > titik.length && (
              <p className={css.catatanPeta}>{t.tanpaKoordinat(hasil.length - titik.length, hasil.length)}</p>
            )}
          </div>
        ) : tampilan === "grid" ? (
          <ul className={css.grid}>
            {hasil.slice(0, batas).map((r, i) => (
              <li key={r.id} style={urutan(i)}>
                <Card cb={r} b={b} />
              </li>
            ))}
          </ul>
        ) : (
          <table className={css.tabel}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">{t.kolom.foto}</span>
                </th>
                <th scope="col">{t.kolom.nama}</th>
                <th scope="col">{t.kolom.jenis}</th>
                <th scope="col">{t.kolom.wilayah}</th>
                <th scope="col">{t.kolom.kecamatan}</th>
              </tr>
            </thead>
            <tbody>
              {hasil.slice(0, batas).map((r, i) => (
                <tr key={r.id} style={urutan(i)}>
                  <td className={css.selFoto}>
                    <Photo src={r.foto} alt="" nama={r.nama} jenis={r.jenis} ukuran="kecil" b={b} />
                  </td>
                  <td className={css.selNama}>
                    <Link href={tautan(r, b)} lang="id">
                      {r.nama}
                    </Link>
                    {r.namaDahulu && (
                      <span className="dulu">
                        {TEKS[b].dahulu} <span lang="id">{r.namaDahulu}</span>
                      </span>
                    )}
                    <span className={css.sk}>{r.sk}</span>
                  </td>
                  <td data-label={t.kolom.jenis}>
                    {l.jenis[r.jenis]}
                    {r.model3d && <span className={css.lencana3d}>3D</span>}
                  </td>
                  <td data-label={t.kolom.wilayah}>{r.wilayah.map((w) => l.wilayah[w]).join(", ")}</td>
                  <td data-label={t.kolom.kecamatan} className={css.selKecamatan}>
                    {r.kecamatan.join(", ") || "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tampilan !== "peta" && hasil.length > batas && (
          <button type="button" className={css.lagi} onClick={() => setLihat({ kunci: qs, n: batas + PER_HALAMAN })}>
            {t.lagi(hasil.length - batas)}
          </button>
        )}
      </section>
    </div>
  );
}
