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

export async function tulisProgres(tujuan: string, data: Objek[], daftar: DaftarFoto, isiFolder: Map<string, number>) {
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

  await wb.xlsx.writeFile(tujuan);
  return jumlah;
}
