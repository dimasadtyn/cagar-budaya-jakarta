"""Batas Provinsi DKI Jakarta dari OpenStreetMap (ODbL) ke data/dki-boundary.json.

Jalankan: python scripts/dki-boundary.py
"""

import json
import urllib.parse
import urllib.request
from pathlib import Path

RELASI = 6362934
TOLERANSI = 0.0002
TUJUAN = Path(__file__).resolve().parent.parent / "data" / "dki-boundary.json"


def unduh():
    kueri = f"[out:json][timeout:120];rel({RELASI});out geom;"
    permintaan = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=urllib.parse.urlencode({"data": kueri}).encode(),
        headers={"User-Agent": "cagar-budaya-jakarta"},
    )
    with urllib.request.urlopen(permintaan, timeout=180) as r:
        return json.load(r)["elements"][0]


def rakit(relasi):
    sisa = [
        [(p["lon"], p["lat"]) for p in m["geometry"]]
        for m in relasi["members"]
        if m["type"] == "way" and m["role"] == "outer"
    ]
    cincin = []
    while sisa:
        c = sisa.pop(0)
        while c[0] != c[-1]:
            for i, w in enumerate(sisa):
                if w[0] == c[-1]:
                    c += w[1:]
                elif w[-1] == c[-1]:
                    c += w[::-1][1:]
                elif w[-1] == c[0]:
                    c = w[:-1] + c
                elif w[0] == c[0]:
                    c = w[::-1][:-1] + c
                else:
                    continue
                sisa.pop(i)
                break
            else:
                raise SystemExit("Garis batas tidak tertutup; cek relasi di OpenStreetMap.")
        cincin.append(c)
    return cincin


def sederhanakan(titik, eps):
    if len(titik) < 3:
        return titik
    (x1, y1), (x2, y2) = titik[0], titik[-1]
    dx, dy = x2 - x1, y2 - y1
    panjang = (dx * dx + dy * dy) ** 0.5
    jauh, indeks = 0, 0
    for i in range(1, len(titik) - 1):
        x, y = titik[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / panjang if panjang else ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
        if d > jauh:
            jauh, indeks = d, i
    if jauh <= eps:
        return [titik[0], titik[-1]]
    return sederhanakan(titik[: indeks + 1], eps)[:-1] + sederhanakan(titik[indeks:], eps)


def main():
    cincin = [sederhanakan(c, TOLERANSI) for c in rakit(unduh())]
    poligon = [[[[round(x, 5), round(y, 5)] for x, y in c]] for c in cincin if len(c) >= 4]
    TUJUAN.write_text(
        json.dumps(
            {
                "type": "Feature",
                "properties": {"sumber": f"OpenStreetMap relation {RELASI}, ODbL"},
                "geometry": {"type": "MultiPolygon", "coordinates": poligon},
            },
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"{TUJUAN.name}: {sum(len(p[0]) for p in poligon)} titik")


if __name__ == "__main__":
    main()
