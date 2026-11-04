// Kolom narahubung berisi data pribadi: jangan pernah ditambahkan ke KOLOM_*.
import ExcelJS from "exceljs";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  DataSchema,
  WILAYAH,
  type CagarBudaya,
  type CagarBudayaMasukan,
  type Jenis,
  type Wilayah,
} from "../src/lib/schema";
import { dalamBatasDki, dalamWilayah, parseKoordinat } from "./coordinates";
import {
  barisNama,
  hurufBesarSemua,
  judulKata,
  kalimat,
  kunci,
  kunciAlamat,
  kunciNama,
  kunciNamaLengkap,
  kunciTempat,
  parseSK,
  pecahNama,
  rapikan,
  rapikanBaris,
  slugify,
  variasiNama,
} from "./normalize";

const AKAR = path.resolve(import.meta.dirname, "..");
const DATA = path.join(AKAR, "data");

const SHEET_UTAMA = "Update Data CB ~ 2026";
const SHEET_WILAYAH = "Data CB Perwilayah";
const SHEET_KAWASAN: { sheet: string; kawasan?: RegExp; area?: string }[] = [
  { sheet: "CB Kawasan Kota Tua", kawasan: /^kawasan kota tua$/ },
  { sheet: "CB Kawasan Onrust", kawasan: /onrust/ },
  { sheet: "CB Kawasan Menteng", area: "menteng" },
  { sheet: "CB Kawasan Kebayoran Baru", area: "kebayoran-baru" },
];

const KOLOM_UTAMA = {
  no: "No",
  wilayah: "Wilayah / Kota atau Kabupaten Administrasi",
  kecamatan: "Kecamatan",
  kelurahan: "Kelurahan",
  nama: "Nama cagar budaya",
  alamat: "Alamat",
  sk: "Nomor SK",
  benda: "Benda",
  struktur: "Struktur",
  bangunan: "Bangunan",
  situs: "Situs",
  kawasan: "Kawasan",
  nilai: "Catatan Nilai Penting",
} as const;
const KOLOM_WILAYAH = {
  kelurahan: "Kelurahan",
  nama: "Nama cagar budaya",
  alamat: "Alamat",
  koordinat: "Koordinat Lokasi",
  statusKepemilikan: "Jenis Status Kepemilikan Aset",
  pemilik: "Pemilik",
  pengelola: "Pengelola",
} as const;
// Nama pemilik/pengelola hanya ditampilkan bila jelas nama lembaga; nama orang tidak boleh terbit.
const LEMBAGA =
  /\b(PT|PD|Persero|Yayasan|Masjid|DKM|Gereja|GPIB|GKI|Paroki|Majelis|Dewan|Bank|Maybank|Kemen\w*|Dinas|Direktorat|Pemerintah|Pemprov|Pemda|Negara|Museum|UPT?|Unit|Biro|Badan|Lembaga|Pusat|Perpustakaan|Polsek|Kepolisian|TNI|Universitas|Fakultas|RSUPN|Sekretariat|Kelurahan|Kedutaan|Pos|Arsip|Perguruan|Club|Hotel|Grup)\b/i;
const TANPA_INFORMASI = /^(-|swasta|tidak diketahui|tidak memperoleh informasi)$/i;
const KOLOM_KAWASAN = { kelurahan: "Kelurahan", nama: "Nama cagar budaya", alamat: "Alamat" } as const;

type Masalah = { id: string; nama: string; sheet: string; masalah: string; nilai_asli: string };
const laporan: Masalah[] = [];
const lapor = (id: string, nama: string, sheet: string, masalah: string, nilai = "") =>
  laporan.push({ id, nama, sheet, masalah, nilai_asli: rapikan(nilai) });

function teksSel(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if ("richText" in v) return v.richText.map((r) => r.text).join("");
  if ("text" in v && typeof v.text === "string") return v.text;
  if ("result" in v) return teksSel(v.result as ExcelJS.CellValue);
  return "";
}

type Baris = Record<string, string>;

function bacaSheet(wb: ExcelJS.Workbook, nama: string, kolom: Record<string, string>): Baris[] {
  const ws = wb.getWorksheet(nama);
  if (!ws) throw new Error(`Sheet "${nama}" tidak ditemukan`);

  let barisHeader = 0;
  for (let r = 1; r <= 6 && !barisHeader; r++) {
    ws.getRow(r).eachCell((c) => {
      if (rapikan(teksSel(c.value)) === KOLOM_UTAMA.nama) barisHeader = r;
    });
  }
  if (!barisHeader) throw new Error(`Header "${KOLOM_UTAMA.nama}" tidak ditemukan di sheet "${nama}"`);

  const posisi: Record<string, number> = {};
  for (const r of [barisHeader, barisHeader + 1]) {
    ws.getRow(r).eachCell((c, col) => {
      const label = rapikan(teksSel(c.value)).toLowerCase();
      for (const [k, judul] of Object.entries(kolom)) {
        if (posisi[k] === undefined && label === judul.toLowerCase()) posisi[k] = col;
      }
    });
  }
  const hilang = Object.keys(kolom).filter((k) => posisi[k] === undefined);
  if (hilang.length) throw new Error(`Sheet "${nama}": kolom tidak ditemukan: ${hilang.join(", ")}`);

  const hasil: Baris[] = [];
  for (let r = barisHeader + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const b: Baris = { _baris: String(r) };
    for (const [k, col] of Object.entries(posisi)) b[k] = teksSel(row.getCell(col).value);
    if (rapikan(b.nama) === KOLOM_UTAMA.nama) continue;
    hasil.push(b);
  }
  return hasil;
}

function bacaJson<T>(berkas: string, bawaan: T): T {
  const p = path.join(DATA, berkas);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : bawaan;
}
const tulisJson = (berkas: string, isi: unknown) =>
  writeFileSync(path.join(DATA, berkas), JSON.stringify(isi, null, 2) + "\n", "utf8");

function csv(rows: Masalah[]) {
  const sel = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const kolom = ["id", "nama", "sheet", "masalah", "nilai_asli"] as const;
  return [kolom.join(","), ...rows.map((r) => kolom.map((k) => sel(r[k])).join(","))].join("\n") + "\n";
}

function cariExcel(): string {
  const arg = process.argv[2];
  if (arg) return path.resolve(arg);
  const dir = path.join(DATA, "source");
  const kandidat = readdirSync(dir)
    .filter((f) => f.endsWith(".xlsx") && !f.startsWith("~$"))
    .map((f) => path.join(dir, f))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (!kandidat.length) throw new Error("Tidak ada berkas .xlsx di data/source/");
  return kandidat[0];
}

type Objek = {
  kunciSumber: string;
  barisSumber: string;
  namaMentah: string;
  jenis: Jenis;
  skMentah: string;
  wilayah: string[];
  kecamatan: string[];
  kelurahan: string[];
  alamat: string;
  nilai: string;
};

const JENIS_KOLOM: Jenis[] = ["benda", "struktur", "bangunan", "situs", "kawasan"];

async function main() {
  const berkas = cariExcel();
  console.log(`Membaca ${path.relative(AKAR, berkas)}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(berkas);

  const utama: Objek[] = [];
  for (const b of bacaSheet(wb, SHEET_UTAMA, KOLOM_UTAMA)) {
    if (!rapikan(b.nama)) continue;
    const no = rapikan(b.no);
    const sebelum = utama.at(-1);
    const lanjutan =
      sebelum &&
      ((no && no === sebelum.kunciSumber.split("#")[0]) ||
        (!no && kunciNamaLengkap(b.nama) === kunciNamaLengkap(sebelum.namaMentah)));
    if (lanjutan) {
      if (b.wilayah) sebelum.wilayah.push(b.wilayah);
      if (b.kecamatan) sebelum.kecamatan.push(b.kecamatan);
      if (b.kelurahan) sebelum.kelurahan.push(b.kelurahan);
      continue;
    }
    const jenisTerisi = JENIS_KOLOM.filter((j) => rapikan(b[j]));
    if (jenisTerisi.length !== 1) {
      lapor(
        "",
        rapikan(b.nama),
        SHEET_UTAMA,
        `jenis terisi ${jenisTerisi.length} kolom (baris ${b._baris}); objek dilewati`,
      );
      continue;
    }
    utama.push({
      kunciSumber: `${no}#${kunciNamaLengkap(b.nama)}|${kunciAlamat(b.alamat)}`,
      barisSumber: b._baris,
      namaMentah: b.nama,
      jenis: jenisTerisi[0],
      skMentah: b.sk,
      wilayah: [b.wilayah],
      kecamatan: [b.kecamatan],
      kelurahan: [b.kelurahan],
      alamat: b.alamat,
      nilai: b.nilai,
    });
  }

  const hitungBarisPertama = new Map<string, number>();
  for (const o of utama) {
    const baris = barisNama(o.namaMentah);
    if (baris.length < 2) continue;
    const k = kunci(baris[0].replace(/\([^)]*\)/g, " "));
    hitungBarisPertama.set(k, (hitungBarisPertama.get(k) ?? 0) + 1);
  }
  const kelompok = new Set([...hitungBarisPertama].filter(([, n]) => n >= 2).map(([k]) => k));
  const nama = (o: Objek) => pecahNama(o.namaMentah, kelompok);

  const idMap = bacaJson<Record<string, { id: string; slug: string }>>("id-map.json", {});
  const kunciStabil = (o: Objek) => o.kunciSumber.split("#")[1];
  let nomorBerikut = Math.max(0, ...Object.values(idMap).map((v) => Number(v.id.slice(3)))) + 1;
  const slugTerpakai = new Set(Object.values(idMap).map((v) => v.slug));
  const idDipakai = new Set<string>();
  const kunciDipakai = new Set<string>();
  const idObjek = new Map<Objek, { id: string; slug: string }>();

  for (const o of utama) {
    let k = kunciStabil(o);
    if (kunciDipakai.has(k)) {
      lapor("", nama(o).nama, SHEET_UTAMA, `nama + alamat sama dengan objek lain (baris ${o.barisSumber})`);
      k = `${k}#${o.barisSumber}`;
    }
    kunciDipakai.add(k);
    let entri = idMap[k];
    if (!entri) {
      const dasar = slugify(SLUG_PENDEK.reduce((s, [re, ke]) => s.replace(re, ke), slugify(nama(o).nama, 200)));
      const nomorJalan = o.alamat.match(/\bno\.?\s*(\d+[a-z]?(?:\s*[-/]\s*\d+)?)/i)?.[1];
      const pilihan = [
        dasar,
        nomorJalan && `${dasar}-no-${slugify(nomorJalan)}`,
        `${dasar}-${slugify(o.kelurahan[0] ?? "")}`,
      ].filter(Boolean) as string[];
      let slug = pilihan.find((s) => !slugTerpakai.has(s));
      for (let i = 2; !slug; i++) if (!slugTerpakai.has(`${dasar}-${i}`)) slug = `${dasar}-${i}`;
      entri = { id: `cb-${String(nomorBerikut++).padStart(4, "0")}`, slug };
      idMap[k] = entri;
      slugTerpakai.add(slug);
    }
    idDipakai.add(entri.id);
    idObjek.set(o, entri);
  }
  const hilang = Object.entries(idMap).filter(([, v]) => !idDipakai.has(v.id));
  for (const [, v] of hilang) lapor(v.id, v.slug, SHEET_UTAMA, "objek di id-map.json tidak ada lagi di Excel");

  const wilayahRows = bacaSheet(wb, SHEET_WILAYAH, KOLOM_WILAYAH).filter((b) => rapikan(b.nama));
  const pasanganManual = bacaJson<Record<string, { nama: string; alamat: string }>>("manual-matches.json", {});
  const pasangan = cocokkan(utama, wilayahRows, idObjek, pasanganManual);

  const kawasanInduk = new Map<Objek, string>();
  const areaObjek = new Map<Objek, string>();
  for (const def of SHEET_KAWASAN) {
    const rows = bacaSheet(wb, def.sheet, KOLOM_KAWASAN).filter((b) => rapikan(b.nama));
    const induk = def.kawasan && utama.find((o) => o.jenis === "kawasan" && def.kawasan!.test(kunciNama(o.namaMentah)));
    if (def.kawasan && !induk) lapor("", def.sheet, def.sheet, "objek kawasan induk tidak ditemukan di sheet utama");
    const cocok = cocokkan(utama, rows, idObjek, {});
    const bukanAnggota = (r: Baris) => induk && kunciNama(r.nama) === kunciNama(induk.namaMentah);
    for (const [o] of cocok) {
      if (o === induk) continue;
      if (induk) kawasanInduk.set(o, idObjek.get(induk)!.slug);
      else if (def.area) areaObjek.set(o, def.area);
    }
    const kunciCocok = new Set([...cocok.values()].map((r) => kunciNama(r.nama) + "|" + kunciAlamat(r.alamat)));
    const tidakCocok = rows.filter(
      (r) => !bukanAnggota(r) && !kunciCocok.has(kunciNama(r.nama) + "|" + kunciAlamat(r.alamat)),
    );
    for (const r of tidakCocok) {
      lapor("", rapikan(r.nama), def.sheet, `tidak ditemukan di sheet utama (baris ${r._baris})`, r.alamat);
    }
  }

  const ejaan = new Map<string, Map<string, number>>();
  for (const o of utama) {
    for (const t of [...o.kecamatan, ...o.kelurahan]) {
      const tampil = judulKata(t);
      if (!tampil) continue;
      const m = ejaan.get(kunciTempat(t)) ?? new Map<string, number>();
      m.set(tampil, (m.get(tampil) ?? 0) + 1);
      ejaan.set(kunciTempat(t), m);
    }
  }
  const baku = (t: string) => {
    const m = ejaan.get(kunciTempat(t));
    return m ? [...m.entries()].sort((a, b) => b[1] - a[1])[0][0] : judulKata(t);
  };
  const unik = (xs: string[]) => [...new Set(xs.filter(Boolean))];

  const model3d = bacaJson<Record<string, CagarBudaya["model_3d"]>>("3d-models.json", {});
  const koreksi = bacaJson<Record<string, Partial<CagarBudaya>>>("corrections.json", {});
  const hasil: CagarBudayaMasukan[] = [];

  for (const o of utama) {
    const { id, slug } = idObjek.get(o)!;
    const { nama: namaKini, kelompok: namaKelompok, namaDahulu, namaLain } = nama(o);
    const lap = (masalah: string, nilai = "") => lapor(id, namaKini, SHEET_UTAMA, masalah, nilai);

    const wilayah = unik(o.wilayah.map((w) => slugify(w))) as Wilayah[];
    const salahWilayah = wilayah.filter((w) => !(WILAYAH as readonly string[]).includes(w));
    if (salahWilayah.length) lap("wilayah tidak dikenal", salahWilayah.join(", "));

    const { teks: nomorSk, sk } = parseSK(o.skMentah);
    if (!sk) lap("nomor SK tidak lengkap (nomor/tahun tidak terbaca)", o.skMentah);

    let nilai: string | null = rapikanBaris(o.nilai) || null;
    if (!nilai) lap("catatan nilai penting kosong");
    else if (hurufBesarSemua(nilai)) {
      nilai = kalimat(nilai);
      lap("catatan nilai penting ditulis huruf besar; diubah otomatis, cek nama diri", o.nilai);
    }

    const w = pasangan.get(o);
    let koordinat: CagarBudaya["koordinat"] = null;
    let kepemilikan: CagarBudaya["kepemilikan"] = "belum-ada-informasi";
    let kepemilikanDetail: CagarBudaya["kepemilikan_detail"] = null;
    let pemilik: string | null = null;
    let pengelola: string | null = null;
    const namaLainW: string[] = [];

    if (!w) lap("tidak ditemukan di sheet Data CB Perwilayah; tanpa koordinat dan kepemilikan");
    else {
      namaLainW.push(...pecahNama(w.nama).namaLain);
      const k = parseKoordinat(w.koordinat);
      for (const c of k.catatan) if (k.format !== "gagal") lap(`koordinat: ${c}`, w.koordinat);
      if (k.format === "kosong") lap("koordinat kosong");
      else if (k.format === "gagal") lap("koordinat tidak terbaca", w.koordinat);
      else if (k.koordinat && !dalamWilayah(k.koordinat, wilayah)) {
        lap(`koordinat jatuh di luar ${wilayah.join("/")}; tidak dipakai`, w.koordinat);
      } else if (k.koordinat && !dalamBatasDki(k.koordinat)) {
        lap("koordinat jatuh di luar batas Provinsi DKI Jakarta; tidak dipakai", w.koordinat);
      } else koordinat = k.koordinat;

      const status = kunci(w.statusKepemilikan).replace(/ /g, "");
      if (status === "negara") kepemilikan = "pemerintah";
      else if (status === "swastayayasan") [kepemilikan, kepemilikanDetail] = ["non-pemerintah", "swasta-yayasan"];
      else if (/^per(s|se)?or(o)?angan$/.test(status) || status === "perseroangan")
        [kepemilikan, kepemilikanDetail] = ["non-pemerintah", "perorangan"];
      else if (/pemerintah|pemprov|kementerian|\bdinas\b/i.test(w.pemilik)) {
        kepemilikan = "pemerintah";
        lap("status kepemilikan kosong; disimpulkan Pemerintah dari kolom Pemilik", w.pemilik);
      } else lap("status kepemilikan belum ada informasi", w.statusKepemilikan);

      if (kepemilikan === "pemerintah" || kepemilikanDetail === "swasta-yayasan") {
        const isi = (s: string, kolom: string) => {
          const t = rapikan(s);
          if (!t || TANPA_INFORMASI.test(t)) return null;
          if (LEMBAGA.test(t)) return t;
          lap(`${kolom} tidak tampak seperti nama lembaga; tidak ditampilkan`);
          return null;
        };
        pemilik = isi(w.pemilik, "pemilik");
        pengelola = isi(w.pengelola, "pengelola");
        if (pengelola === pemilik) pengelola = null;
      }
    }

    const cb: CagarBudayaMasukan = {
      id,
      slug,
      nama: namaKini,
      kelompok: namaKelompok,
      nama_dahulu: namaDahulu,
      nama_lain: unik([...namaLain, ...namaLainW]).filter(
        (n) => kunci(n) !== kunci(namaKini) && !namaDahulu.some((d) => kunci(d) === kunci(n)),
      ),
      jenis: o.jenis,
      nomor_sk: nomorSk,
      sk,
      wilayah,
      kecamatan: unik(o.kecamatan.map(baku)),
      kelurahan: unik(o.kelurahan.map(baku)),
      alamat: rapikan(o.alamat),
      koordinat,
      kawasan_induk: kawasanInduk.get(o) ?? null,
      area: areaObjek.get(o) ?? null,
      kepemilikan,
      kepemilikan_detail: kepemilikanDetail,
      pemilik,
      pengelola,
      nilai_penting: nilai,
      bacaan_terkait: [],
      foto: [],
      model_3d: model3d[kunciNama(o.namaMentah)] ?? null,
      ...koreksi[id],
    };
    hasil.push(cb);
  }

  hasil.sort((a, b) => a.id.localeCompare(b.id));
  const valid = DataSchema.safeParse(hasil);
  if (!valid.success) {
    for (const i of valid.error.issues.slice(0, 20)) {
      const cb = hasil[i.path[0] as number];
      console.error(`✗ ${cb?.id ?? "?"} ${cb?.nama ?? ""}: ${i.path.slice(1).join(".")} ${i.message}`);
    }
    process.exit(1);
  }

  const modelDipakai = hasil.filter((c) => c.model_3d).length;
  if (modelDipakai !== Object.keys(model3d).length) {
    lapor("", "3d-models.json", "3d-models.json", `hanya ${modelDipakai} model 3D yang cocok dengan nama di Excel`);
  }

  tulisJson("heritage-sites.json", hasil);
  tulisJson("id-map.json", Object.fromEntries(Object.entries(idMap).sort((a, b) => a[1].id.localeCompare(b[1].id))));
  writeFileSync(path.join(DATA, "import-report.csv"), csv(laporan), "utf8");

  const hitung = <K extends string>(f: (c: CagarBudayaMasukan) => K) =>
    hasil.reduce<Record<string, number>>((m, c) => ((m[f(c)] = (m[f(c)] ?? 0) + 1), m), {});
  console.log(`\n${hasil.length} cagar budaya → data/heritage-sites.json`);
  console.log(
    "Jenis:",
    hitung((c) => c.jenis),
  );
  console.log(
    "Kepemilikan:",
    hitung((c) => c.kepemilikan),
  );
  console.log(`Koordinat: ${hasil.filter((c) => c.koordinat).length} / ${hasil.length}`);
  console.log(
    `Dalam kawasan: ${hasil.filter((c) => c.kawasan_induk).length}, dalam area: ${hasil.filter((c) => c.area).length}`,
  );
  console.log(`Model 3D: ${modelDipakai}`);
  console.log(`\n${laporan.length} catatan → data/import-report.csv`);
  const perMasalah = laporan.reduce<Record<string, number>>((m, l) => {
    const k = l.masalah
      .replace(/\(baris \d+\)/, "")
      .replace(/\d+ m/, "N m")
      .trim();
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {});
  for (const [k, n] of Object.entries(perMasalah).sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(n).padStart(4)}  ${k}`);
}

const SLUG_PENDEK: [RegExp, string][] = [
  [/^bangunan-lama-toko-kantor-gudang-sepanjang-jalan-/, "bangunan-jalan-"],
  [/-rumah-toko-no-/, "-no-"],
  [/-s-d-/, "-sd-"],
];

function cocokkan(
  utama: Objek[],
  rows: Baris[],
  idObjek: Map<Objek, { id: string }>,
  manual: Record<string, { nama: string; alamat: string }>,
): Map<Objek, Baris> {
  const hasil = new Map<Objek, Baris>();
  const terpakai = new Set<Baris>();

  for (const o of utama) {
    const m = manual[idObjek.get(o)!.id];
    const r =
      m &&
      rows.find(
        (r) =>
          !terpakai.has(r) &&
          kunciNamaLengkap(r.nama) === kunciNamaLengkap(m.nama) &&
          kunciAlamat(r.alamat) === kunciAlamat(m.alamat),
      );
    if (r) {
      hasil.set(o, r);
      terpakai.add(r);
    }
  }

  const variasiRow = new Map(rows.map((r) => [r, variasiNama(r.nama)]));
  const kandidat: { o: Objek; r: Baris; skor: number }[] = [];
  for (const o of utama) {
    if (hasil.has(o)) continue;
    const v = variasiNama(o.namaMentah);
    const alamat = kunciAlamat(o.alamat);
    const kel = new Set(o.kelurahan.map(kunciTempat));
    for (const r of rows) {
      if (terpakai.has(r)) continue;
      const sama = [...variasiRow.get(r)!].filter((x) => v.has(x)).length;
      if (!sama) continue;
      const skor =
        sama * 2 + (alamat && kunciAlamat(r.alamat) === alamat ? 3 : 0) + (kel.has(kunciTempat(r.kelurahan)) ? 1 : 0);
      kandidat.push({ o, r, skor });
    }
  }
  kandidat.sort((a, b) => b.skor - a.skor);
  for (const { o, r, skor } of kandidat) {
    if (hasil.has(o) || terpakai.has(r)) continue;
    const seri = kandidat.some((k) => k.o === o && k.r !== r && k.skor === skor && !terpakai.has(k.r));
    if (seri) continue;
    hasil.set(o, r);
    terpakai.add(r);
  }
  return hasil;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
