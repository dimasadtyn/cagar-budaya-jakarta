import DetailPage, { metadataDetail, paramsDetail } from "@/views/DetailPage";

export const dynamicParams = false;

export const generateStaticParams = () => paramsDetail("en");

export async function generateMetadata(props: PageProps<"/en/[jenis]/[slug]">) {
  const { jenis, slug } = await props.params;
  return metadataDetail("en", jenis, slug);
}

export default async function Page(props: PageProps<"/en/[jenis]/[slug]">) {
  const { jenis, slug } = await props.params;
  return <DetailPage b="en" jenis={jenis} slug={slug} />;
}
