import { useSyncExternalStore } from "react";

const KUNCI = "cagar-budaya:riwayat-cari";
const MAKS = 5;
const KOSONG: string[] = [];

const pendengar = new Set<() => void>();
let mentahTerakhir: string | null = null;
let daftarTerakhir = KOSONG;

function baca(): string[] {
  let mentah: string | null = null;
  try {
    mentah = localStorage.getItem(KUNCI);
  } catch {
    return KOSONG;
  }
  if (mentah === mentahTerakhir) return daftarTerakhir;
  mentahTerakhir = mentah;
  try {
    const isi: unknown = JSON.parse(mentah ?? "[]");
    daftarTerakhir = Array.isArray(isi) ? isi.filter((x): x is string => typeof x === "string").slice(0, MAKS) : KOSONG;
  } catch {
    daftarTerakhir = KOSONG;
  }
  return daftarTerakhir;
}

function tulis(daftar: string[] | null) {
  try {
    if (daftar) localStorage.setItem(KUNCI, JSON.stringify(daftar));
    else localStorage.removeItem(KUNCI);
  } catch {}
  pendengar.forEach((f) => f());
}

function langganan(f: () => void) {
  pendengar.add(f);
  window.addEventListener("storage", f);
  return () => {
    pendengar.delete(f);
    window.removeEventListener("storage", f);
  };
}

export function catatRiwayat(q: string) {
  const bersih = q.trim().replace(/\s+/g, " ");
  if (!bersih) return;
  const lama = baca().filter((x) => x.toLowerCase() !== bersih.toLowerCase());
  tulis([bersih, ...lama].slice(0, MAKS));
}

export const hapusRiwayat = () => tulis(null);

export const useRiwayat = () => useSyncExternalStore(langganan, baca, () => KOSONG);
