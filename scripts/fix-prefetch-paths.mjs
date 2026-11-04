// Next menulis data prefetch ke out/<rute>/__next.a/b/__PAGE__.txt, sedangkan browser memintanya
// sebagai out/<rute>/__next.a.b.__PAGE__.txt. Salin ke nama yang diminta supaya tidak 404.
import { copyFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

let jumlah = 0;

function telusuri(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (e.name.startsWith("__next.")) salin(dir, p);
    else telusuri(p);
  }
}

function salin(rute, dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) salin(rute, p);
    else {
      copyFileSync(p, join(rute, relative(rute, p).split(sep).join(".")));
      jumlah++;
    }
  }
}

telusuri("out");
console.log(`fix-prefetch-paths: ${jumlah} berkas prefetch disalin`);
