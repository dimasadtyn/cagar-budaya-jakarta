import AboutPage, { metadataTentang } from "@/views/AboutPage";

export const metadata = metadataTentang("en");

export default function Page() {
  return <AboutPage b="en" />;
}
