"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as PetaMaplibre, StyleSpecification } from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { Bahasa } from "@/lib/labels";
import batasDki from "../../data/dki-boundary.json";
import { TEKS } from "@/lib/messages";
import css from "./MapView.module.css";

export type Titik = {
  id: string;
  lat: number;
  lng: number;
  nama: string;
  href: string;
  keterangan: string;
  utama?: boolean;
};

type Props = {
  titik: Titik[];
  label: string;
  pusat?: Pick<Titik, "lat" | "lng">;
  zoom?: number;
  kelompok?: boolean;
  className?: string;
  b?: Bahasa;
};

const GAYA = "https://tiles.openfreemap.org/styles/positron";
const JAKARTA: [number, number] = [106.83, -6.2];
// Cukup lebar supaya seluruh provinsi, termasuk Kepulauan Seribu, masih muat di layar desktop.
const BATAS_GESER: [[number, number], [number, number]] = [
  [105.5, -6.8],
  [107.8, -4.7],
];

const LUAR_DKI: GeoJSON.Feature = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-180, -85],
        [180, -85],
        [180, 85],
        [-180, 85],
        [-180, -85],
      ],
      ...batasDki.geometry.coordinates.map((p) => p[0]),
    ],
  },
};

const TOKEN_LAPISAN: Record<string, string> = {
  background: "--peta-darat",
  water: "--peta-air",
  park: "--peta-taman",
  landcover_wood: "--peta-hutan",
  landuse_residential: "--peta-pemukiman",
  building: "--peta-bangunan",
};

const token = (nama: string) => getComputedStyle(document.documentElement).getPropertyValue(nama).trim();

function sesuaikan(gaya: StyleSpecification): StyleSpecification {
  return {
    ...gaya,
    layers: gaya.layers.map((l) => {
      const warna = TOKEN_LAPISAN[l.id] && token(TOKEN_LAPISAN[l.id]);
      if (warna && l.type === "background") return { ...l, paint: { ...l.paint, "background-color": warna } };
      if (warna && l.type === "fill") return { ...l, paint: { ...l.paint, "fill-color": warna } };
      if (l.type === "symbol" && l.paint && "text-color" in l.paint) {
        return {
          ...l,
          paint: { ...l.paint, "text-color": token("--teks-sekunder"), "text-halo-color": token("--peta-darat") },
        };
      }
      return l;
    }),
  };
}

const keGeoJSON = (titik: Titik[]): GeoJSON.FeatureCollection => ({
  type: "FeatureCollection",
  features: titik.map((t) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [t.lng, t.lat] },
    properties: { nama: t.nama, href: t.href, keterangan: t.keterangan, utama: !!t.utama },
  })),
});

function isiPopup(p: Record<string, string>) {
  const a = document.createElement("a");
  a.href = p.href;
  a.className = css.popup;
  const nama = document.createElement("strong");
  nama.textContent = p.nama;
  const ket = document.createElement("span");
  ket.textContent = p.keterangan;
  a.append(nama, ket);
  return a;
}

function bingkai(peta: PetaMaplibre, titik: Titik[], pusat: Props["pusat"], zoom: number) {
  if (pusat) return peta.jumpTo({ center: [pusat.lng, pusat.lat], zoom });
  if (titik.length === 0) return peta.jumpTo({ center: JAKARTA, zoom: 10 });
  if (titik.length === 1) return peta.jumpTo({ center: [titik[0].lng, titik[0].lat], zoom });
  const lng = titik.map((t) => t.lng);
  const lat = titik.map((t) => t.lat);
  peta.fitBounds(
    [
      [Math.min(...lng), Math.min(...lat)],
      [Math.max(...lng), Math.max(...lat)],
    ],
    { padding: 48, maxZoom: zoom, duration: 0 },
  );
}

export default function MapView({ titik, label, pusat, zoom = 16, kelompok = false, className, b = "id" }: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  const peta = useRef<PetaMaplibre | null>(null);
  const data = useRef({ titik, pusat, zoom });

  useEffect(() => {
    let batal = false;
    const t = TEKS[b].peta;
    import("maplibre-gl").then(({ Map, NavigationControl, Popup, setWorkerUrl }) => {
      if (batal || !wadah.current) return;
      setWorkerUrl("/maplibre-gl-worker.js");
      const p = new Map({
        container: wadah.current,
        center: JAKARTA,
        zoom: 10,
        maxBounds: BATAS_GESER,
        cooperativeGestures: true,
        attributionControl: { compact: true },
        locale: {
          "CooperativeGesturesHandler.WindowsHelpText": t.ctrl,
          "CooperativeGesturesHandler.MacHelpText": t.mac,
          "CooperativeGesturesHandler.MobileHelpText": t.ponsel,
          "NavigationControl.ZoomIn": t.perbesar,
          "NavigationControl.ZoomOut": t.perkecil,
        },
      });
      p.setStyle(GAYA, { transformStyle: (_, baru) => sesuaikan(baru) });
      p.addControl(new NavigationControl({ showCompass: false }), "top-right");
      peta.current = p;

      p.on("load", () => {
        const [tinta, aksen, putih] = [token("--tinta"), token("--genteng"), token("--putih")];
        wadah.current?.setAttribute("data-siap", "");
        p.addSource("luar-dki", { type: "geojson", data: LUAR_DKI });
        p.addLayer({
          id: "luar-dki",
          type: "fill",
          source: "luar-dki",
          paint: { "fill-color": tinta, "fill-opacity": 0.28 },
        });
        p.addLayer({
          id: "garis-dki",
          type: "line",
          source: "luar-dki",
          paint: { "line-color": tinta, "line-width": 1.25, "line-opacity": 0.6 },
        });
        p.addSource("titik", {
          type: "geojson",
          data: keGeoJSON(data.current.titik),
          cluster: kelompok,
          clusterRadius: 36,
          clusterMaxZoom: 15,
        });
        p.addLayer({
          id: "kelompok",
          type: "circle",
          source: "titik",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": tinta,
            "circle-radius": ["step", ["get", "point_count"], 14, 10, 18, 50, 24],
            "circle-stroke-color": putih,
            "circle-stroke-width": 2,
          },
        });
        p.addLayer({
          id: "jumlah",
          type: "symbol",
          source: "titik",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 12,
          },
          paint: { "text-color": putih },
        });
        p.addLayer({
          id: "titik",
          type: "circle",
          source: "titik",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["case", ["get", "utama"], aksen, kelompok ? aksen : tinta],
            "circle-radius": ["case", ["get", "utama"], 9, 6],
            "circle-stroke-color": putih,
            "circle-stroke-width": 2,
          },
        });
        p.addLayer({
          id: "nama",
          type: "symbol",
          source: "titik",
          filter: ["all", ["!", ["has", "point_count"]], ["get", "utama"]],
          layout: {
            "text-field": ["get", "nama"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-offset": [0, 1.3],
            "text-anchor": "top",
            "text-max-width": 12,
          },
          paint: { "text-color": tinta, "text-halo-color": putih, "text-halo-width": 1.5 },
        });
        bingkai(p, data.current.titik, data.current.pusat, data.current.zoom);

        p.on("click", "titik", (e) => {
          const f = e.features?.[0];
          if (!f || f.geometry.type !== "Point") return;
          new Popup({ offset: 12, maxWidth: "16rem" })
            .setLngLat(f.geometry.coordinates as [number, number])
            .setDOMContent(isiPopup(f.properties))
            .addTo(p);
        });
        p.on("click", "kelompok", async (e) => {
          const f = e.features?.[0];
          if (!f || f.geometry.type !== "Point") return;
          const z = await p.getSource<GeoJSONSource>("titik")!.getClusterExpansionZoom(f.properties.cluster_id);
          p.easeTo({ center: f.geometry.coordinates as [number, number], zoom: z });
        });
        for (const lapis of ["titik", "kelompok"]) {
          p.on("mouseenter", lapis, () => (p.getCanvas().style.cursor = "pointer"));
          p.on("mouseleave", lapis, () => (p.getCanvas().style.cursor = ""));
        }
      });
    });
    return () => {
      batal = true;
      peta.current?.remove();
      peta.current = null;
    };
  }, [kelompok, b]);

  useEffect(() => {
    data.current = { titik, pusat, zoom };
    const p = peta.current;
    const sumber = p?.getSource<GeoJSONSource>("titik");
    if (!p || !sumber) return;
    sumber.setData(keGeoJSON(titik));
    bingkai(p, titik, pusat, zoom);
  }, [titik, pusat, zoom]);

  return <div ref={wadah} className={`${css.peta} ${className ?? ""}`} role="region" aria-label={label} />;
}
