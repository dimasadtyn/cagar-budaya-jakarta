import type { Bahasa } from "./labels";
import type { Koordinat } from "./schema";

export function jarakMeter(a: Koordinat, b: Koordinat): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export const formatJarak = (m: number, b: Bahasa = "id") =>
  m < 1000
    ? `± ${Math.round(m / 10) * 10} m`
    : `± ${(m / 1000).toLocaleString(b === "en" ? "en-GB" : "id-ID", { maximumFractionDigits: 1 })} km`;

const dms = (derajat: number) => {
  const total = Math.round(Math.abs(derajat) * 3600);
  return `${Math.floor(total / 3600)}°${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}′${String(total % 60).padStart(2, "0")}″`;
};

export const formatKoordinat = ({ lat, lng }: Koordinat, b: Bahasa = "id") =>
  b === "en" ? `${dms(lat)} S, ${dms(lng)} E` : `${dms(lat)} LS, ${dms(lng)} BT`;
