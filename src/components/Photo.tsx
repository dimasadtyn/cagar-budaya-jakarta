import type { Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import type { Jenis } from "@/lib/schema";
import css from "./Photo.module.css";

const IKON: Record<Jenis, string> = {
  bangunan: "M3 21h18M5 21V10l7-5 7 5v11M9.5 21v-5.5h5V21",
  struktur: "M2 8h20M4 8v13M20 8v13M4 16a8 6 0 0 1 16 0",
  benda: "M9 3h6M10 3v3.5C7.5 7.5 6 10 6 13a6 6 0 0 0 12 0c0-3-1.5-5.5-4-6.5V3M8 21h8",
  situs: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  kawasan: "M3 21h18M4.5 21v-9l4-3 4 3v9M12.5 21V7l3.5-3 3.5 3v14",
};

type Props = {
  src: string | null;
  alt: string;
  nama: string;
  jenis: Jenis;
  ukuran?: "kecil" | "sedang";
  b?: Bahasa;
};

export default function Photo({ src, alt, nama, jenis, ukuran = "sedang", b = "id" }: Props) {
  if (src) return <img src={src} alt={alt} className={css.foto} loading="lazy" />;
  return (
    <div className={`${css.kosong} ${css[ukuran]}`} role="img" aria-label={TEKS[b].fotoBelum(nama)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d={IKON[jenis]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
