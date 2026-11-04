import Link from "next/link";
import { LABEL, tautan, type Bahasa } from "@/lib/labels";
import type { Ringkas } from "@/lib/summary";
import { TEKS } from "@/lib/messages";
import Photo from "./Photo";
import css from "./Card.module.css";

export default function Card({ cb, keterangan, b = "id" }: { cb: Ringkas; keterangan?: string; b?: Bahasa }) {
  const l = LABEL[b];
  return (
    <Link href={tautan(cb, b)} className={css.kartu}>
      <div className={css.media}>
        <Photo src={cb.foto} alt={cb.nama} nama={cb.nama} b={b} />
        {cb.model3d && <span className={css.lencana}>{TEKS[b].model3d}</span>}
      </div>
      <div className={css.isi}>
        <span className={css.sk}>{keterangan ?? cb.sk}</span>
        <span className={css.nama} lang="id">
          {cb.nama}
        </span>
        {cb.namaDahulu && (
          <span className={`dulu ${css.dahulu}`}>
            {TEKS[b].dahulu} <span lang="id">{cb.namaDahulu}</span>
          </span>
        )}
        <span className={css.meta}>
          {l.jenis[cb.jenis]} · {cb.wilayah.map((w) => l.wilayah[w]).join(", ")}
          <span className={css.panah} aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
