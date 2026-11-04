"use client";

import { useId, useState, type KeyboardEvent } from "react";
import type { Bahasa } from "@/lib/labels";
import type { CagarBudaya } from "@/lib/schema";
import { TEKS } from "@/lib/messages";
import PhotoAlbum from "./PhotoAlbum";
import css from "./Model3D.module.css";

type Data = NonNullable<CagarBudaya["model_3d"]>;

export default function Model3D({ nama, data, b = "id" }: { nama: string; data: Data; b?: Bahasa }) {
  const teks = TEKS[b].m3d;
  const id = useId();
  const tab = [
    { kunci: "model", label: teks.model },
    ...(data.point_cloud.length ? [{ kunci: "point-cloud", label: teks.pointCloud }] : []),
  ];
  const [aktif, setAktif] = useState(tab[0].kunci);
  const [siap, setSiap] = useState(false);
  const [memuat, setMemuat] = useState(false);

  const muat = async () => {
    setMemuat(true);
    const { ModelViewerElement } = await import("@google/model-viewer");
    ModelViewerElement.meshoptDecoderLocation = "/meshopt-decoder.js";
    setSiap(true);
  };

  const pindah = (e: KeyboardEvent, i: number) => {
    const arah = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!arah) return;
    const berikut = tab[(i + arah + tab.length) % tab.length].kunci;
    setAktif(berikut);
    document.getElementById(`${id}-tab-${berikut}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={teks.tablist} className={css.tab}>
        {tab.map((t, i) => (
          <button
            key={t.kunci}
            id={`${id}-tab-${t.kunci}`}
            type="button"
            role="tab"
            aria-selected={aktif === t.kunci}
            aria-controls={`${id}-panel-${t.kunci}`}
            tabIndex={aktif === t.kunci ? 0 : -1}
            onClick={() => setAktif(t.kunci)}
            onKeyDown={(e) => pindah(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab.map((t) => (
        <div
          key={t.kunci}
          id={`${id}-panel-${t.kunci}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${t.kunci}`}
          hidden={aktif !== t.kunci}
          className={css.panel}
        >
          {t.kunci === "model" &&
            (!data.model ? (
              <div className={css.sampul}>
                <p>{teks.diperbarui}</p>
              </div>
            ) : siap ? (
              <model-viewer
                src={data.model}
                alt={teks.judulModel(nama)}
                className={css.penampil}
                camera-controls=""
                touch-action="pan-y"
                camera-orbit="35deg 65deg 75%"
                shadow-intensity="0.6"
                tone-mapping="neutral"
              />
            ) : (
              <div className={css.sampul}>
                <p>{teks.catatan}</p>
                <button type="button" onClick={muat} disabled={memuat}>
                  {teks.muat}
                </button>
              </div>
            ))}

          {t.kunci === "point-cloud" && (
            <PhotoAlbum b={b} foto={data.point_cloud.map((src, i) => ({ src, alt: teks.tampak(nama, i + 1) }))} />
          )}
        </div>
      ))}
    </div>
  );
}
