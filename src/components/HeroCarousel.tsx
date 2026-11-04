"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./HeroCarousel.module.css";

export type Slide = {
  foto: string;
  alt: string;
  nama: string;
  namaDahulu: string | null;
  keterangan: string;
  href: string;
  kredit: string | null;
};

const JEDA_MS = 7000;
const GERAK_DIKURANGI = "(prefers-reduced-motion: reduce)";

const pantauGerak = (ubah: () => void) => {
  const mq = window.matchMedia(GERAK_DIKURANGI);
  mq.addEventListener("change", ubah);
  return () => mq.removeEventListener("change", ubah);
};

export default function HeroCarousel({
  slide,
  children,
  b = "id",
}: {
  slide: Slide[];
  children: ReactNode;
  b?: Bahasa;
}) {
  const t = TEKS[b].carousel;
  const [aktif, setAktif] = useState(0);
  const [pilihanJeda, setDijeda] = useState<boolean | null>(null);
  const [ditahan, setDitahan] = useState(false);
  const gerakDikurangi = useSyncExternalStore(
    pantauGerak,
    () => window.matchMedia(GERAK_DIKURANGI).matches,
    () => false,
  );
  const dijeda = pilihanJeda ?? gerakDikurangi;

  useEffect(() => {
    if (dijeda || ditahan || slide.length < 2) return;
    const t = setTimeout(() => setAktif((i) => (i + 1) % slide.length), JEDA_MS);
    return () => clearTimeout(t);
  }, [aktif, dijeda, ditahan, slide.length]);

  const geser = (arah: number) => setAktif((i) => (i + arah + slide.length) % slide.length);
  const s = slide[aktif];

  return (
    <section
      className={css.hero}
      data-jalan={!dijeda && !ditahan && slide.length > 1}
      style={{ "--jeda": `${JEDA_MS}ms` } as CSSProperties}
      aria-roledescription="carousel"
      aria-label={t.label}
      onMouseEnter={() => setDitahan(true)}
      onMouseLeave={() => setDitahan(false)}
      onFocus={() => setDitahan(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setDitahan(false)}
    >
      <div className={css.foto}>
        {slide.map((x, i) => (
          <img
            key={x.foto}
            src={x.foto}
            alt={i === aktif ? x.alt : ""}
            aria-hidden={i !== aktif}
            className={i === aktif ? css.aktif : undefined}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className={css.kabut} aria-hidden="true" />

      <div className={css.panel}>
        <div className={css.isiPanel}>
          {children}
          <div className={css.keterangan} aria-live={dijeda ? "polite" : "off"}>
            <div key={aktif} className={css.ganti}>
              <Link href={s.href} className={css.nama}>
                {s.nama}
                <span aria-hidden="true"> →</span>
              </Link>
              {s.namaDahulu && (
                <p className="dulu">
                  {TEKS[b].dahulu} <span lang="id">{s.namaDahulu}</span>
                </p>
              )}
              <p className={css.kecil}>
                {s.keterangan}
                {s.kredit && ` · ${TEKS[b].foto}: ${s.kredit}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {slide.length > 1 && (
        <div className={css.kontrol}>
          <button type="button" onClick={() => setDijeda(!dijeda)} aria-label={dijeda ? t.putar : t.jeda}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              {dijeda ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2h3v12H4zM9 2h3v12H9z" />}
            </svg>
          </button>
          <button type="button" onClick={() => geser(-1)} aria-label={t.sebelum}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M10 3 5 8l5 5" />
            </svg>
          </button>
          <ol className={css.titik}>
            {slide.map((x, i) => (
              <li key={x.foto}>
                <button
                  type="button"
                  onClick={() => setAktif(i)}
                  aria-label={t.ke(i + 1, slide.length, x.nama)}
                  aria-current={i === aktif}
                />
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => geser(1)} aria-label={t.berikut}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 3 5 5-5 5" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
