import type { Metadata } from "next";
import HomePage from "@/views/HomePage";
import { alternatif, RUTE } from "@/lib/labels";

export const metadata: Metadata = {
  alternates: { canonical: RUTE.beranda.en, languages: alternatif(RUTE.beranda.id, RUTE.beranda.en) },
};

export default function Page() {
  return <HomePage b="en" />;
}
