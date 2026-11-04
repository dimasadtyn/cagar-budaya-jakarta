import SiteShell, { metadataDasar } from "@/components/SiteShell";

export const metadata = metadataDasar("id");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell b="id">{children}</SiteShell>;
}
