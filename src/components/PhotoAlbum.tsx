"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import type { Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./PhotoAlbum.module.css";

type Foto = { src: string; alt: string; kecil?: string; kredit?: string };
type Zoom = { s: number; x: number; y: number };
type Titik = { x: number; y: number };
type Gerak =
  { jenis: "seret"; awal: Titik; zoom: Zoom; pindah: boolean } | { jenis: "cubit"; jarak: number; zoom: Zoom };

const Ikon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BATAS_MINI = 4;
const AWAL: Zoom = { s: 1, x: 0, y: 0 };
const MAKS = 4;
const LANGKAH = 1.5;
const ZOOM_KETUK = 2.5;

const jarakTitik = (a: Titik, b: Titik) => Math.hypot(a.x - b.x, a.y - b.y);

export default function PhotoAlbum({ foto, b, sampul }: { foto: Foto[]; b: Bahasa; sampul?: { sizes: string } }) {
  const t = TEKS[b].album;
  const dialog = useRef<HTMLDialogElement>(null);
  const deret = useRef<HTMLUListElement>(null);
  const panggung = useRef<HTMLDivElement>(null);
  const gambar = useRef<HTMLImageElement>(null);
  const pembuka = useRef<HTMLButtonElement | null>(null);
  const penunjuk = useRef(new Map<number, Titik>());
  const gerak = useRef<Gerak | null>(null);
  const ketukTerakhir = useRef<{ waktu: number; titik: Titik } | null>(null);
  const [indeks, setIndeks] = useState<number | null>(null);
  const [simpanan, setSimpanan] = useState<Zoom & { i: number | null }>({ ...AWAL, i: null });
  const [menyeret, setMenyeret] = useState(false);
  const [layarPenuh, setLayarPenuh] = useState(false);

  const zoom = simpanan.i === indeks ? simpanan : AWAL;
  const diperbesar = zoom.s > 1;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (indeks !== null) {
      if (!d.open) d.showModal();
      deret.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
    } else if (d.open) {
      if (document.fullscreenElement) document.exitFullscreen();
      d.close();
      pembuka.current?.focus();
    }
  }, [indeks]);

  useEffect(() => {
    const ubah = () => setLayarPenuh(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", ubah);
    return () => document.removeEventListener("fullscreenchange", ubah);
  }, []);

  const ukuranTampil = () => {
    const p = panggung.current;
    const g = gambar.current;
    if (!p || !g?.naturalWidth) return null;
    const k = Math.min(p.clientWidth / g.naturalWidth, p.clientHeight / g.naturalHeight);
    return { W: p.clientWidth, H: p.clientHeight, w: g.naturalWidth * k, h: g.naturalHeight * k };
  };

  const batasi = ({ s, x, y }: Zoom): Zoom => {
    const u = ukuranTampil();
    if (!u || s <= 1.001) return AWAL;
    const mx = Math.max(0, (u.w * s - u.W) / 2);
    const my = Math.max(0, (u.h * s - u.H) / 2);
    return { s, x: Math.min(mx, Math.max(-mx, x)), y: Math.min(my, Math.max(-my, y)) };
  };

  const aturZoom = (z: Zoom) => setSimpanan({ ...batasi(z), i: indeks });

  const zoomKe = (sBaru: number, titik?: Titik, dasar: Zoom = zoom) => {
    const s = Math.min(MAKS, Math.max(1, sBaru));
    const p = panggung.current?.getBoundingClientRect();
    const cx = titik && p ? titik.x - (p.left + p.width / 2) : 0;
    const cy = titik && p ? titik.y - (p.top + p.height / 2) : 0;
    const r = s / dasar.s;
    aturZoom({ s, x: cx - (cx - dasar.x) * r, y: cy - (cy - dasar.y) * r });
  };

  useEffect(() => {
    const p = panggung.current;
    if (!p) return;
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      zoomKe(zoom.s * Math.exp(-e.deltaY * 0.002), { x: e.clientX, y: e.clientY });
    };
    p.addEventListener("wheel", roda, { passive: false });
    return () => p.removeEventListener("wheel", roda);
  });

  const geser = (arah: number) => setIndeks((i) => (i === null ? i : (i + arah + foto.length) % foto.length));

  const diLuarGambar = (titik: Titik) => {
    const u = ukuranTampil();
    const p = panggung.current?.getBoundingClientRect();
    if (!u || !p) return false;
    const dx = titik.x - (p.left + p.width / 2) - zoom.x;
    const dy = titik.y - (p.top + p.height / 2) - zoom.y;
    return Math.abs(dx) > (u.w * zoom.s) / 2 || Math.abs(dy) > (u.h * zoom.s) / 2;
  };

  const tekan = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    penunjuk.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [a, c] = [...penunjuk.current.values()];
    gerak.current = c
      ? { jenis: "cubit", jarak: jarakTitik(a, c), zoom }
      : { jenis: "seret", awal: a, zoom, pindah: false };
    setMenyeret(true);
  };

  const gerakkan = (e: PointerEvent<HTMLDivElement>) => {
    if (!penunjuk.current.has(e.pointerId)) return;
    penunjuk.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gerak.current;
    if (!g) return;
    if (g.jenis === "cubit") {
      const [a, c] = [...penunjuk.current.values()];
      if (c) zoomKe((g.zoom.s * jarakTitik(a, c)) / g.jarak, { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }, g.zoom);
      return;
    }
    const dx = e.clientX - g.awal.x;
    const dy = e.clientY - g.awal.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.pindah = true;
    if (g.zoom.s > 1) aturZoom({ s: g.zoom.s, x: g.zoom.x + dx, y: g.zoom.y + dy });
  };

  const lepas = (e: PointerEvent<HTMLDivElement>) => {
    penunjuk.current.delete(e.pointerId);
    const g = gerak.current;
    gerak.current = null;
    if (penunjuk.current.size === 0) setMenyeret(false);
    if (g?.jenis !== "seret" || e.type === "pointercancel") return;
    const titik = { x: e.clientX, y: e.clientY };
    const dx = titik.x - g.awal.x;
    if (g.pindah) {
      if (g.zoom.s === 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(titik.y - g.awal.y)) geser(dx < 0 ? 1 : -1);
      return;
    }
    const sebelumnya = ketukTerakhir.current;
    if (sebelumnya && e.timeStamp - sebelumnya.waktu < 300 && jarakTitik(sebelumnya.titik, titik) < 30) {
      ketukTerakhir.current = null;
      if (diperbesar) aturZoom(AWAL);
      else zoomKe(ZOOM_KETUK, titik);
      return;
    }
    ketukTerakhir.current = { waktu: e.timeStamp, titik };
    if (!diperbesar && diLuarGambar(titik)) setIndeks(null);
  };

  const ubahLayarPenuh = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else dialog.current?.requestFullscreen();
  };

  const aktif = indeks === null ? null : foto[indeks];
  const buka = (e: MouseEvent<HTMLButtonElement>, i: number) => {
    pembuka.current = e.currentTarget;
    setIndeks(i);
  };
  const sisa = foto.length - 1 - BATAS_MINI;

  return (
    <>
      {sampul ? (
        <div className={css.sampul}>
          <button type="button" className={css.utama} onClick={(e) => buka(e, 0)} aria-label={t.buka(foto[0].alt)}>
            <img
              src={foto[0].src}
              srcSet={foto[0].kecil && `${foto[0].kecil} 640w, ${foto[0].src} 1600w`}
              sizes={sampul.sizes}
              alt={foto[0].alt}
              fetchPriority="high"
            />
            {foto.length > 1 && <span className={css.semua}>{t.lihatSemua(foto.length)}</span>}
          </button>
          {foto.length > 1 && (
            <ul className={css.mini}>
              {foto.slice(1, 1 + BATAS_MINI).map((f, j) => (
                <li key={f.src}>
                  <button type="button" onClick={(e) => buka(e, j + 1)} aria-label={t.buka(f.alt)}>
                    <img src={f.kecil ?? f.src} alt="" loading="lazy" />
                    {j === BATAS_MINI - 1 && sisa > 0 && (
                      <span className={css.lebih} aria-hidden="true">
                        +{sisa}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ul className={css.galeri}>
          {foto.map((f, i) => (
            <li key={f.src}>
              <button type="button" onClick={(e) => buka(e, i)} aria-label={t.buka(f.alt)}>
                <img src={f.kecil ?? f.src} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

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
          const geserGambar = { ArrowRight: [-80, 0], ArrowLeft: [80, 0], ArrowDown: [0, -80], ArrowUp: [0, 80] }[
            e.key
          ];
          if (diperbesar && geserGambar) {
            e.preventDefault();
            aturZoom({ s: zoom.s, x: zoom.x + geserGambar[0], y: zoom.y + geserGambar[1] });
          } else if (e.key === "ArrowRight") geser(1);
          else if (e.key === "ArrowLeft") geser(-1);
          else if (e.key === "+" || e.key === "=") zoomKe(zoom.s * LANGKAH);
          else if (e.key === "-") zoomKe(zoom.s / LANGKAH);
          else if (e.key === "0") aturZoom(AWAL);
        }}
      >
        {aktif && (
          <figure>
            <div
              ref={panggung}
              className={css.panggung}
              data-zoom={diperbesar || undefined}
              data-seret={menyeret || undefined}
              onPointerDown={tekan}
              onPointerMove={gerakkan}
              onPointerUp={lepas}
              onPointerCancel={lepas}
            >
              <img
                ref={gambar}
                src={aktif.src}
                alt={aktif.alt}
                draggable={false}
                style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})` }}
              />
            </div>
            <figcaption>
              {t.urutan(indeks! + 1, foto.length)}
              {aktif.kredit && ` · ${aktif.kredit}`}
            </figcaption>
          </figure>
        )}
        {foto.length > 1 && (
          <ul ref={deret} className={css.deret} aria-label={t.daftar}>
            {foto.map((f, i) => (
              <li key={f.src}>
                <button type="button" onClick={() => setIndeks(i)} aria-label={f.alt} aria-current={i === indeks}>
                  <img src={f.kecil ?? f.src} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {aktif && (
          <div className={css.alat} role="toolbar" aria-label={t.alat}>
            <button
              type="button"
              onClick={() => zoomKe(zoom.s / LANGKAH)}
              disabled={!diperbesar}
              aria-label={t.perkecil}
            >
              <Ikon d="M5 12h14" />
            </button>
            <button
              type="button"
              className={css.persen}
              onClick={() => aturZoom(AWAL)}
              disabled={!diperbesar}
              aria-label={t.ukuranAwal}
            >
              {Math.round(zoom.s * 100)}%
            </button>
            <button
              type="button"
              onClick={() => zoomKe(zoom.s * LANGKAH)}
              disabled={zoom.s >= MAKS}
              aria-label={t.perbesar}
            >
              <Ikon d="M12 5v14M5 12h14" />
            </button>
            {document.fullscreenEnabled && (
              <button
                type="button"
                onClick={ubahLayarPenuh}
                aria-label={layarPenuh ? t.keluarLayarPenuh : t.layarPenuh}
                aria-pressed={layarPenuh}
              >
                <Ikon
                  d={layarPenuh ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"}
                />
              </button>
            )}
          </div>
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
