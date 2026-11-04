import AboutPage, { metadataTentang } from "@/views/AboutPage";

export const metadata = metadataTentang("id");

export default function Page() {
  return <AboutPage b="id" />;
}
