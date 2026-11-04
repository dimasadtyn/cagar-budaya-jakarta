import Link from "next/link";
import { RUTE, type Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./Footer.module.css";

export default function Footer({ b }: { b: Bahasa }) {
  const t = TEKS[b];
  return (
    <footer className={css.footer}>
      <div className={`wadah ${css.isi}`}>
        <div className={css.identitas}>
          <p className={css.judul}>Cagar Budaya Jakarta</p>
          <p className={`dulu ${css.moto}`}>{t.moto}</p>
          <p>{t.dinas}</p>
        </div>
        <ul className={css.tautan}>
          <li>
            <Link href={RUTE.jelajah[b]}>{t.menu.jelajah}</Link>
          </li>
          <li>
            <Link href={`${RUTE.jelajah[b]}?tampilan=peta`}>{t.menu.peta}</Link>
          </li>
          <li>
            <Link href={RUTE.model3d[b]}>{b === "en" ? "3D Models" : "Model 3D"}</Link>
          </li>
          <li>
            <Link href={RUTE.tentang[b]}>{t.menu.tentang}</Link>
          </li>
        </ul>
        <p className={css.kecil}>{t.kakiAtribusi}</p>
      </div>
    </footer>
  );
}
