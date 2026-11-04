"""IFC hasil ekspor Revit → public/models/<museum>/model.glb, diwarnai per jenis elemen.

    python scripts/ifc-to-glb.py            semua museum
    python scripts/ifc-to-glb.py wayang     satu museum
"""

import collections
import multiprocessing
import subprocess
import sys
import time
from pathlib import Path

import ifcopenshell
import ifcopenshell.geom
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

AKAR = Path(__file__).resolve().parent.parent
SUMBER = AKAR / "data" / "source" / "models"
SEMENTARA = SUMBER / ".glb"
TUJUAN = AKAR / "public" / "models"

KATEGORI = {
    "IfcWall": "dinding",
    "IfcWallStandardCase": "dinding",
    "IfcCurtainWall": "dinding",
    "IfcColumn": "kolom",
    "IfcDoor": "pintu",
    "IfcWindow": "jendela",
    "IfcSlab": "lantai",
    "IfcCovering": "plafon",
    "IfcRoof": "atap",
    "IfcBeam": "kayu",
    "IfcMember": "kayu",
    "IfcPlate": "kayu",
    "IfcStair": "kayu",
    "IfcStairFlight": "kayu",
    "IfcRamp": "kayu",
    "IfcRampFlight": "kayu",
    "IfcRailing": "railing",
}

WARNA = {
    "dinding": "#f2f0ea",
    "kolom": "#f2f0ea",
    "plafon": "#f7f5ef",
    "lantai": "#b9a68e",
    "atap": "#b4532f",
    "kayu": "#6b4a32",
    "railing": "#3a3a3a",
    "kaca": "#a9cbd6",
    "rumput": "#7d9a5c",
    "lainnya": "#cfcac0",
}
HIJAU_KUSEN = "#2e5638"
COKELAT_KUSEN = "#4b3020"

# Warna dicocokkan dengan foto bangunan; kusen Tekstil belum terlihat jelas di foto.
MUSEUM = {
    "sejarah-jakarta": ("Museum Sejarah Jakarta.ifc", {"pintu": HIJAU_KUSEN, "jendela": HIJAU_KUSEN}),
    "tekstil": ("Museum Textil.ifc", {"pintu": HIJAU_KUSEN, "jendela": HIJAU_KUSEN}),
    "seni-rupa-dan-keramik": ("Museum Seni Rupa & Keramik.ifc", {"pintu": HIJAU_KUSEN, "jendela": HIJAU_KUSEN}),
    "wayang": ("Museum Wayang.ifc", {"pintu": HIJAU_KUSEN, "jendela": HIJAU_KUSEN}),
    "bahari": ("Museum Bahari.ifc", {"pintu": COKELAT_KUSEN, "jendela": COKELAT_KUSEN}),
}

DIBUANG = ("IfcOpeningElement", "IfcSpace", "IfcSite", "IfcAnnotation")
RUMPUT = ("rumput", "grass", "rth")


def linear(hex_: str) -> list[float]:
    srgb = [int(hex_[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    return [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]


def kategori_dari(el) -> str:
    if el.is_a("IfcSlab"):
        if el.PredefinedType == "ROOF" or any(r.RelatingObject.is_a("IfcRoof") for r in el.Decomposes):
            return "atap"
        if any(k in (el.ObjectType or "").lower() for k in RUMPUT):
            return "rumput"
    return KATEGORI.get(el.is_a(), "lainnya")


def baca(ifc: Path) -> tuple[dict[str, list], collections.Counter]:
    f = ifcopenshell.open(str(ifc))
    pengaturan = ifcopenshell.geom.settings()
    pengaturan.set("use-world-coords", True)
    buang = [e for t in DIBUANG for e in f.by_type(t)]
    it = ifcopenshell.geom.iterator(pengaturan, f, multiprocessing.cpu_count(), exclude=buang)

    grup: dict[str, list] = collections.defaultdict(list)
    jumlah = collections.Counter()
    if not it.initialize():
        return grup, jumlah
    while True:
        bentuk = it.get()
        kategori = kategori_dari(f.by_id(bentuk.id))
        jumlah[kategori] += 1
        g = bentuk.geometry
        titik = np.array(g.verts, dtype=np.float64).reshape(-1, 3)
        sisi = np.array(g.faces, dtype=np.int64).reshape(-1, 3)
        id_material = np.array(g.material_ids, dtype=np.int64)
        for i, m in enumerate(g.materials):
            bagian = sisi[id_material == i]
            if len(bagian):
                tembus = m.transparency == m.transparency and m.transparency > 0.05
                grup["kaca" if tembus else kategori].append((titik, bagian))
        if not it.next():
            break
    return grup, jumlah


def gabung(potongan: list) -> trimesh.Trimesh:
    semua_titik, semua_sisi, geser = [], [], 0
    for titik, sisi in potongan:
        dipakai = np.unique(sisi)
        peta = np.full(len(titik), -1)
        peta[dipakai] = np.arange(len(dipakai)) + geser
        semua_titik.append(titik[dipakai])
        semua_sisi.append(peta[sisi])
        geser += len(dipakai)
    mesh = trimesh.Trimesh(np.vstack(semua_titik), np.vstack(semua_sisi), process=False)
    mesh.merge_vertices()
    return mesh


def konversi(slug: str) -> None:
    berkas, warna_khusus = MUSEUM[slug]
    warna = {**WARNA, **warna_khusus}
    mulai = time.time()
    grup, jumlah = baca(SUMBER / berkas)

    adegan = trimesh.Scene()
    for kategori, potongan in sorted(grup.items()):
        mesh = gabung(potongan)
        kaca = kategori == "kaca"
        mesh.visual = trimesh.visual.TextureVisuals(
            material=PBRMaterial(
                name=kategori,
                baseColorFactor=[*linear(warna.get(kategori, warna["lainnya"])), 0.35 if kaca else 1.0],
                metallicFactor=0.0,
                roughnessFactor=0.1 if kaca else 0.85,
                alphaMode="BLEND" if kaca else "OPAQUE",
                doubleSided=True,
            )
        )
        adegan.add_geometry(mesh, node_name=kategori, geom_name=kategori)

    batas = adegan.bounds
    ke_tengah = np.eye(4)
    ke_tengah[:3, 3] = [-(batas[0][0] + batas[1][0]) / 2, -(batas[0][1] + batas[1][1]) / 2, -batas[0][2]]
    z_ke_y = trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0])
    adegan.apply_transform(z_ke_y @ ke_tengah)

    SEMENTARA.mkdir(exist_ok=True)
    mentah = SEMENTARA / f"{slug}.glb"
    adegan.export(mentah)
    hasil = TUJUAN / slug / "model.glb"
    hasil.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        f'npx gltf-transform optimize "{mentah}" "{hasil}" --compress meshopt --texture-compress false',
        shell=True,
        check=True,
        cwd=AKAR,
        stdout=subprocess.DEVNULL,
    )
    rincian = ", ".join(f"{k} {n}" for k, n in jumlah.most_common())
    print(f"{slug}: {hasil.stat().st_size / 1e6:.1f} MB, {time.time() - mulai:.0f} dtk ({rincian})")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf8")
    pilihan = sys.argv[1:] or list(MUSEUM)
    for slug in pilihan:
        if slug not in MUSEUM:
            sys.exit(f"museum tidak dikenal: {slug} (pilihan: {', '.join(MUSEUM)})")
    for slug in pilihan:
        konversi(slug)
