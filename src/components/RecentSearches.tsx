"use client";

import Link from "next/link";
import { RUTE, type Bahasa } from "@/lib/labels";
import { hapusRiwayat, useRiwayat } from "@/lib/search-history";
import { TEKS } from "@/lib/messages";
import css from "./RecentSearches.module.css";

export default function RecentSearches({
  b,
  gelap = false,
  onPilih,
}: {
  b: Bahasa;
  gelap?: boolean;
  onPilih?: (q: string) => void;
}) {
  const riwayat = useRiwayat();
  const t = TEKS[b].riwayat;
  if (riwayat.length === 0) return null;

  return (
    <div className={css.riwayat} data-gelap={gelap || undefined}>
      <span className={css.judul}>{t.judul}</span>
      <ul>
        {riwayat.map((q) => (
          <li key={q}>
            {onPilih ? (
              <button type="button" onClick={() => onPilih(q)}>
                {q}
              </button>
            ) : (
              <Link href={`${RUTE.jelajah[b]}?q=${encodeURIComponent(q)}`}>{q}</Link>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className={css.hapus} onClick={hapusRiwayat}>
        {t.hapus}
      </button>
    </div>
  );
}
