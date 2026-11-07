"use client";

import { useState } from "react";
import type { Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./ShareButtons.module.css";

export default function ShareButtons({ judul, b = "id" }: { judul: string; b?: Bahasa }) {
  const t = TEKS[b];
  const [pesan, setPesan] = useState("");

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setPesan(t.disalin);
    } catch {
      setPesan(t.gagalSalin);
    }
  };

  const bagikan = async () => {
    if (!navigator.share) return salin();
    try {
      await navigator.share({ title: judul, url: location.href });
    } catch {}
  };

  return (
    <div className={css.aksi}>
      <button type="button" onClick={bagikan} aria-label={t.bagikan} title={t.bagikan}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          <path d="M8 10V2M5 5l3-3 3 3M3 8v5.5h10V8" />
        </svg>
      </button>
      <button type="button" onClick={salin} aria-label={t.salin} title={t.salin}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          <path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.5 2.5 0 0 1 3.5 3.5L10.5 8M9 11.5l-1.2 1.2a2.5 2.5 0 0 1-3.5-3.5L5.5 8" />
        </svg>
      </button>
      <span role="status" className={css.pesan}>
        {pesan}
      </span>
    </div>
  );
}
