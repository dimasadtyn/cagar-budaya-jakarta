import type { CSSProperties } from "react";
import type { Bahasa } from "@/lib/labels";
import { TINGKAT, type CagarBudaya, type Tingkat } from "@/lib/schema";
import { TEKS } from "@/lib/messages";
import css from "./ConditionReport.module.css";

export const warnaTingkat = (tingkat: Tingkat) => ({ "--warna-tingkat": `var(--kondisi-${tingkat})` }) as CSSProperties;

function ConditionMeter({ tingkat, b }: { tingkat: Tingkat; b: Bahasa }) {
  const t = TEKS[b].detail;
  const isi = TINGKAT.indexOf(tingkat) + 1;
  return (
    <span className={css.tanda} style={warnaTingkat(tingkat)}>
      <span className={css.segmen} aria-hidden="true">
        {TINGKAT.map((x, i) => (
          <span key={x} data-isi={i < isi ? "" : undefined} />
        ))}
      </span>
      <span className={css.ya}>{t.ya}</span>
      <span className={css.namaTingkat}>{t.tingkat[tingkat]}</span>
    </span>
  );
}

export default function ConditionReport({ cb, anggota, b }: { cb: CagarBudaya; anggota: CagarBudaya[]; b: Bahasa }) {
  const t = TEKS[b].detail;
  const asli = b === "en" ? "id" : undefined;
  const k = cb.kondisi;
  const ringkasan = TINGKAT.map((x) => [x, anggota.filter((a) => a.kondisi?.umum === x).length] as const).filter(
    ([, n]) => n > 0,
  );
  const catatan = [
    [t.lingkungan, k?.lingkungan, false],
    [t.keterancaman, k?.keterancaman, true],
  ] as const;
  return (
    <div className={css.kondisi}>
      {k && k.elemen.length > 0 && (
        <table className={css.tabelKondisi}>
          <thead>
            <tr>
              <th scope="col">{t.elemen}</th>
              {TINGKAT.map((x) => (
                <th key={x} scope="col">
                  {t.tingkatPendek[x]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {k.elemen.map((e) => (
              <tr key={e.nama}>
                <th scope="row" lang={asli}>
                  {e.nama}
                </th>
                {TINGKAT.map((x) => (
                  <td key={x}>{x === e.tingkat && <ConditionMeter tingkat={x} b={b} />}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {catatan.some(([, isi]) => isi) && (
        <div className={css.catatanKondisi}>
          {catatan.map(
            ([label, isi, ancaman]) =>
              isi && (
                <div key={label} data-ancaman={ancaman ? "" : undefined}>
                  <h3 className="label">{label}</h3>
                  <p lang={asli}>{isi}</p>
                </div>
              ),
          )}
        </div>
      )}
      {ringkasan.length > 0 && (
        <div className={css.ringkasanKondisi}>
          <h3 className="label">{t.ringkasanKawasan}</h3>
          <ul>
            {ringkasan.map(([x, n]) => (
              <li key={x}>
                <b>{n}</b> {t.tingkat[x].toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
