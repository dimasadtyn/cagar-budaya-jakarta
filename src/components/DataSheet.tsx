import Link from "next/link";
import type { ReactNode } from "react";
import { cariSlug } from "@/lib/data";
import { LABEL, LABEL_AREA, tautan, teksKepemilikan, type Bahasa } from "@/lib/labels";
import { RINCIAN, type CagarBudaya } from "@/lib/schema";
import { TEKS } from "@/lib/messages";
import { normal } from "@/lib/summary";
import css from "./DataSheet.module.css";

export default function DataSheet({ cb, b, jumlahAnggota }: { cb: CagarBudaya; b: Bahasa; jumlahAnggota: number }) {
  const t = TEKS[b].detail;
  const l = LABEL[b];
  const kawasan = cb.kawasan_induk ? cariSlug(cb.kawasan_induk) : null;
  const alamat = normal(cb.alamat);
  const diluarAlamat = (xs: string[]) => xs.filter((x) => !alamat.includes(normal(x))).join(", ");
  const baris: [string, ReactNode, boolean?][] = [
    [t.nomorSk, cb.nomor_sk],
    [t.jenis, l.jenis[cb.jenis]],
    ...RINCIAN.map((k): [string, ReactNode, boolean] => [t.rincian[k], cb.rincian[k], true]),
    [t.isiKawasan, jumlahAnggota > 0 && t.jumlahCagarBudaya(jumlahAnggota)],
    [t.kepemilikan, teksKepemilikan(cb, b)],
    [t.pemilik, cb.pemilik, true],
    [t.pengelola, cb.pengelola, true],
    [t.alamat, cb.alamat, true],
    [t.kelurahan, diluarAlamat(cb.kelurahan)],
    [t.kecamatan, diluarAlamat(cb.kecamatan)],
    [t.wilayah, cb.wilayah.map((w) => l.wilayah[w]).join(", ")],
    [t.kawasan, kawasan && <Link href={tautan(kawasan, b)}>{kawasan.nama}</Link>, true],
    [t.area, cb.area && LABEL_AREA[cb.area]],
  ];
  return (
    <dl className={css.lembar}>
      {baris
        .filter(([, isi]) => isi)
        .map(([label, isi, asli]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd lang={asli && b === "en" ? "id" : undefined}>{isi}</dd>
          </div>
        ))}
    </dl>
  );
}
