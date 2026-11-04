"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./PhotoAlbum.module.css";

type Foto = { src: string; alt: string };

const Ikon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PhotoAlbum({ foto, b }: { foto: Foto[]; b: Bahasa }) {
  const t = TEKS[b].album;
  const dialog = useRef<HTMLDialogElement>(null);
  const deret = useRef<HTMLUListElement>(null);
  const awalSentuh = useRef<number | null>(null);
  const pembuka = useRef<HTMLButtonElement | null>(null);
  const [indeks, setIndeks] = useState<number | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (indeks !== null) {
      if (!d.open) d.showModal();
      deret.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
    } else if (d.open) {
      d.close();
      pembuka.current?.focus();
    }
  }, [indeks]);

  const geser = (arah: number) => setIndeks((i) => (i === null ? i : (i + arah + foto.length) % foto.length));

  const akhirSentuh = (e: TouchEvent) => {
    if (awalSentuh.current === null) return;
    const jarak = e.changedTouches[0].clientX - awalSentuh.current;
    awalSentuh.current = null;
    if (Math.abs(jarak) > 50) geser(jarak < 0 ? 1 : -1);
  };

  const aktif = indeks === null ? null : foto[indeks];

  return (
    <>
      <ul className={css.galeri}>
        {foto.map((f, i) => (
          <li key={f.src}>
            <button
              type="button"
              onClick={(e) => {
                pembuka.current = e.currentTarget;
                setIndeks(i);
              }}
              aria-label={t.buka(f.alt)}
            >
              <img src={f.src} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className={css.dialog}
        aria-label={aktif?.alt}
        onClose={() => {
          setIndeks(null);
          pembuka.current?.focus();
        }}
        onClick={(e) => e.target === e.currentTarget && setIndeks(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") geser(1);
          if (e.key === "ArrowLeft") geser(-1);
        }}
        onTouchStart={(e) => (awalSentuh.current = e.touches[0].clientX)}
        onTouchEnd={akhirSentuh}
      >
        {aktif && (
          <figure>
            <img src={aktif.src} alt={aktif.alt} />
            <figcaption>{t.urutan(indeks! + 1, foto.length)}</figcaption>
          </figure>
        )}
        {foto.length > 1 && (
          <ul ref={deret} className={css.deret} aria-label={t.daftar}>
            {foto.map((f, i) => (
              <li key={f.src}>
                <button type="button" onClick={() => setIndeks(i)} aria-label={f.alt} aria-current={i === indeks}>
                  <img src={f.src} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className={css.tutup} onClick={() => setIndeks(null)} aria-label={t.tutup}>
          <Ikon d="M6 6l12 12M18 6L6 18" />
        </button>
        {foto.length > 1 && (
          <>
            <button type="button" className={css.sebelumnya} onClick={() => geser(-1)} aria-label={t.sebelumnya}>
              <Ikon d="M15 5l-7 7 7 7" />
            </button>
            <button type="button" className={css.berikutnya} onClick={() => geser(1)} aria-label={t.berikutnya}>
              <Ikon d="M9 5l7 7-7 7" />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
