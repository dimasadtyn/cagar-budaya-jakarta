import { URL_SITUS } from "@/lib/site";

export const remahLd = (jejak: { nama: string; href: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: jejak.map((j, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: j.nama,
    item: `${URL_SITUS}${j.href}`,
  })),
});

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
