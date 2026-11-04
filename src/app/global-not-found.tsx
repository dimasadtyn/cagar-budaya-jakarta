import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { kelasHuruf } from "@/components/SiteShell";
import css from "@/views/shared.module.css";
import "../styles/global.css";

export const metadata: Metadata = { title: "Halaman tidak ditemukan · Page not found" };

export default function NotFound() {
  return (
    <html lang="id" className={kelasHuruf}>
      <body>
        <Header b="id" />
        <main id="konten" className={`wadah ${css.kepala} ${css.kosong}`}>
          <p className="label">404</p>
          <h1>
            Halaman <span className="dulu">tidak ditemukan</span>
          </h1>
          <p className={css.lead}>
            Halaman yang Anda cari tidak ada atau sudah dipindahkan. Coba cari cagar budayanya lewat halaman Jelajah.
          </p>
          <Link href="/jelajah/" className={css.tombol}>
            Buka Jelajah
          </Link>
          <div lang="en" className={css.duaBahasa}>
            <p className={css.lead}>
              <strong>Page not found.</strong> The page you are looking for does not exist or has moved.
            </p>
            <Link href="/en/explore/" className={css.tombolGaris}>
              Explore heritage sites
            </Link>
          </div>
        </main>
        <Footer b="id" />
      </body>
    </html>
  );
}
