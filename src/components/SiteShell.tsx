import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import type { Bahasa } from "@/lib/labels";
import { NAMA_SITUS, URL_SITUS } from "@/lib/site";
import { TEKS } from "@/lib/messages";
import "../styles/global.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const GAMBAR_BAGIKAN = { url: "/og-image.jpg", width: 1200, height: 630, alt: "Museum Sejarah Jakarta" };

// Halaman yang menulis openGraph sendiri harus menyebar ini: Next menimpa openGraph layout, tidak menggabungkannya.
export const ogDasar = (b: Bahasa) => ({
  type: "website" as const,
  siteName: NAMA_SITUS,
  locale: b === "en" ? "en_GB" : "id_ID",
  images: [GAMBAR_BAGIKAN],
});

export const metadataDasar = (b: Bahasa): Metadata => ({
  metadataBase: new URL(URL_SITUS),
  title: { default: NAMA_SITUS, template: `%s · ${NAMA_SITUS}` },
  description:
    b === "en"
      ? "Designated cultural heritage of DKI Jakarta Province, from the Department of Culture."
      : "Daftar cagar budaya yang ditetapkan di Provinsi DKI Jakarta, dari Dinas Kebudayaan.",
  openGraph: ogDasar(b),
  twitter: { card: "summary_large_image" },
});

const SIAPKAN_GERAK = `var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("gerak");setTimeout(function(){if(!d.dataset.muncul)d.classList.remove("gerak")},3000)}`;

export const kelasHuruf = inter.variable;

export default function SiteShell({ b, children }: { b: Bahasa; children: ReactNode }) {
  return (
    <html lang={b} className={kelasHuruf} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: SIAPKAN_GERAK }} />
        <a href="#konten" className="lewati">
          {TEKS[b].lewati}
        </a>
        <Header b={b} />
        <main id="konten">{children}</main>
        <Footer b={b} />
        <Reveal />
      </body>
    </html>
  );
}
