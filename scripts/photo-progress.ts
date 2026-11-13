import { existsSync } from "node:fs";
import ExcelJS from "exceljs";
import { LABEL } from "../src/lib/labels";
import type { DaftarFoto } from "../src/lib/photos";
import type { Jenis, Wilayah } from "../src/lib/schema";

type Objek = { id: string; slug: string; nama: string; jenis: Jenis; wilayah: Wilayah[] };

const STATUS = {
  tampil: { teks: "Tampil di website", warna: "FFD9F2D9" },
  belumDidaftarkan: { teks: "Ada foto, belum didaftarkan", warna: "FFFFF2CC" },
  kosong: { teks: "Folder kosong", warna: "FFFCE4D6" },
  tanpaFolder: { teks: "Belum ada folder", warna: "FFEDEDED" },
};

type Riwayat = (string | number)[];

async function bacaSebelumnya(tujuan: string) {
  const foto = new Map<string, number>();
  const riwayat: Riwayat[] = [];
  if (!existsSync(tujuan)) return { foto: null, riwayat };
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(tujuan);
  const progres = wb.getWorksheet("Progres foto");
  progres?.eachRow((r, i) => {
    if (i > 1) foto.set(String(r.getCell(1).value), Number(r.getCell(7).value) || 0);
  });
  wb.getWorksheet("Riwayat")?.eachRow((r, i) => {
    if (i > 1) riwayat.push((r.values as Riwayat).slice(1));
  });
  return { foto: progres ? foto : null, riwayat };
}

function perubahan(data: Objek[], daftar: DaftarFoto, lama: Map<string, number> | null) {
  if (!lama) return "Pencatatan awal";
  const baru: string[] = [];
  const tambah: string[] = [];
  const kurang: string[] = [];
  for (const cb of data) {
    const n = daftar.objek[cb.slug]?.foto.length ?? 0;
    const m = lama.get(cb.id) ?? 0;
    if (!m && n) baru.push(`${cb.nama} (${n})`);
    else if (n > m) tambah.push(`${cb.nama} (+${n - m})`);
    else if (n < m) kurang.push(`${cb.nama} (−${m - n})`);
  }
  return [
    baru.length && `Baru tampil: ${baru.join(", ")}`,
    tambah.length && `Foto bertambah: ${tambah.join(", ")}`,
    kurang.length && `Foto berkurang: ${kurang.join(", ")}`,
  ]
    .filter(Boolean)
    .join(". ");
}

export async function tulisProgres(tujuan: string, data: Objek[], daftar: DaftarFoto, isiFolder: Map<string, number>) {
  const sebelumnya = await bacaSebelumnya(tujuan);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Progres foto", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Nama", key: "nama", width: 60 },
    { header: "Jenis", key: "jenis", width: 11 },
    { header: "Wilayah", key: "wilayah", width: 18 },
    { header: "Folder foto", key: "folder", width: 50 },
    { header: "Foto di folder", key: "diFolder", width: 13 },
    { header: "Foto di website", key: "diWeb", width: 15 },
    { header: "Status", key: "status", width: 28 },
  ];

  const jumlah = Object.fromEntries(Object.keys(STATUS).map((k) => [k, 0])) as Record<keyof typeof STATUS, number>;
  for (const cb of data) {
    const o = daftar.objek[cb.slug];
    const diFolder = isiFolder.get(cb.slug) ?? 0;
    const diWeb = o?.foto.length ?? 0;
    const status: keyof typeof STATUS = !o
      ? "tanpaFolder"
      : diWeb > 0
        ? "tampil"
        : diFolder > 0
          ? "belumDidaftarkan"
          : "kosong";
    jumlah[status]++;
    const baris = ws.addRow({
      id: cb.id,
      nama: cb.nama,
      jenis: LABEL.id.jenis[cb.jenis],
      wilayah: cb.wilayah.map((w) => LABEL.id.wilayah[w]).join(", "),
      folder: o?.folder ?? "",
      diFolder: o ? diFolder : "",
      diWeb,
      status: STATUS[status].teks,
    });
    baris.getCell("status").fill = { type: "pattern", pattern: "solid", fgColor: { argb: STATUS[status].warna } };
  }
  ws.getRow(1).font = { bold: true };
  ws.autoFilter = { from: "A1", to: "H1" };

  const ringkasan = wb.addWorksheet("Ringkasan");
  ringkasan.columns = [
    { header: "Status", key: "status", width: 30 },
    { header: "Jumlah objek", key: "n", width: 14 },
  ];
  for (const [k, v] of Object.entries(STATUS))
    ringkasan.addRow({ status: v.teks, n: jumlah[k as keyof typeof STATUS] });
  ringkasan.addRow({ status: "Total", n: data.length }).font = { bold: true };
  ringkasan.getRow(1).font = { bold: true };

  const riwayat = wb.addWorksheet("Riwayat", { views: [{ state: "frozen", ySplit: 1 }] });
  riwayat.columns = [
    { header: "Tanggal", key: "tanggal", width: 12 },
    { header: "Objek tampil", key: "tampil", width: 13 },
    { header: "Foto di website", key: "foto", width: 15 },
    { header: "Perubahan", key: "rincian", width: 120 },
  ];
  const fotoWeb = Object.values(daftar.objek).reduce((n, o) => n + o.foto.length, 0);
  const rincian = perubahan(data, daftar, sebelumnya.foto);
  const baris = rincian
    ? [...sebelumnya.riwayat, [new Date().toISOString().slice(0, 10), jumlah.tampil, fotoWeb, rincian]]
    : sebelumnya.riwayat;
  for (const r of baris) riwayat.addRow(r).alignment = { vertical: "top", wrapText: true };
  riwayat.getRow(1).font = { bold: true };

  await wb.xlsx.writeFile(tujuan);
  return jumlah;
}
