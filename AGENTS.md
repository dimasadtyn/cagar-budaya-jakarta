# Aturan kerja proyek

Website katalog cagar budaya DKI Jakarta. Baca `docs/01-prd.md` sampai `docs/04-temuan-data.md` sebelum mengerjakan apa pun.

- **Next.js versi baru.** API dan konvensinya bisa berbeda dari yang kamu ingat. Baca panduan terkait di `node_modules/next/dist/docs/` sebelum menulis kode, dan perhatikan catatan deprecation.
- **Static export.** `output: "export"`: jangan pakai `redirects`/`headers`/`rewrites` di config, `proxy.ts`, Server Actions, cookies, atau `next/image` dengan loader bawaan. Pengalihan URL dan header ada di `server/`.
- **Data pribadi.** Jangan pernah membaca, menyalin, atau mencetak kolom "Narahubung Pemilik / Pengelola" dari Excel di `data/sumber/`. Nama pemilik perorangan tidak diimpor. Jangan commit apa pun dari `data/sumber/` selain README-nya.
- **Satu sumber tipe.** Tipe data berasal dari skema zod di `src/lib/skema.ts`; jangan menulis ulang tipe secara manual.
- **Isian kosong = bagian tidak tampil.** Jangan menampilkan label dengan nilai kosong atau "-".
- **Bahasa.** Antarmuka dan dokumen dalam bahasa Indonesia. Pakai "website", bukan "situs"; "Situs" hanya untuk jenis cagar budaya.
- **Foto.** Hanya foto yang boleh dipakai komersial; catat kredit, lisensi, dan sumbernya di `foto/foto.json`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
