import SiteShell, { metadataDasar } from "@/components/SiteShell";

export const metadata = metadataDasar("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell b="en">{children}</SiteShell>;
}
