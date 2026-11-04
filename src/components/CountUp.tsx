"use client";

import { useEffect, useRef, useState } from "react";
import css from "./CountUp.module.css";

export default function CountUp({ nilai, durasi = 1400 }: { nilai: number; durasi?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tampil, setTampil] = useState(nilai);

  useEffect(() => {
    const el = ref.current;
    if (!el || !document.documentElement.classList.contains("gerak")) return;
    let id = 0;
    let mulai = 0;
    const langkah = (t: number) => {
      mulai ||= t;
      const p = Math.min((t - mulai) / durasi, 1);
      setTampil(Math.round(nilai * (1 - (1 - p) ** 3)));
      el.dataset.mulai = "";
      if (p < 1) id = requestAnimationFrame(langkah);
    };
    id = requestAnimationFrame(langkah);
    return () => {
      cancelAnimationFrame(id);
      setTampil(nilai);
    };
  }, [nilai, durasi]);

  return (
    <span ref={ref} className={css.hitung} data-akhir={nilai}>
      <span>{tampil}</span>
    </span>
  );
}
