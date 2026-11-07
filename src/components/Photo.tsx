import type { Bahasa } from "@/lib/labels";
import { TEKS } from "@/lib/messages";
import css from "./Photo.module.css";

type Props = {
  src: string | null;
  srcSet?: string;
  sizes?: string;
  prioritas?: boolean;
  alt: string;
  nama: string;
  rasio?: "3/2" | "4/3";
  ukuran?: "kecil" | "sedang" | "besar";
  b?: Bahasa;
};

export default function Photo({
  src,
  srcSet,
  sizes,
  prioritas,
  alt,
  nama,
  rasio = "4/3",
  ukuran = "sedang",
  b = "id",
}: Props) {
  if (src)
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={css.foto}
        style={{ aspectRatio: rasio }}
        loading={prioritas ? "eager" : "lazy"}
        fetchPriority={prioritas ? "high" : undefined}
      />
    );
  return (
    <div
      className={`${css.kosong} ${css[ukuran]}`}
      style={{ aspectRatio: rasio }}
      role="img"
      aria-label={TEKS[b].fotoBelum(nama)}
    >
      <img src="/logo-disbud.webp" alt="" className={css.logo} />
      {ukuran !== "kecil" && <span className={css.teks}>{TEKS[b].tidakAdaFoto}</span>}
    </div>
  );
}
