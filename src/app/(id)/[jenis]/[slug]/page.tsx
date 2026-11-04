import DetailPage, { metadataDetail, paramsDetail } from "@/views/DetailPage";

export const dynamicParams = false;

export const generateStaticParams = () => paramsDetail("id");

export async function generateMetadata(props: PageProps<"/[jenis]/[slug]">) {
  const { jenis, slug } = await props.params;
  return metadataDetail("id", jenis, slug);
}

export default async function Page(props: PageProps<"/[jenis]/[slug]">) {
  const { jenis, slug } = await props.params;
  return <DetailPage b="id" jenis={jenis} slug={slug} />;
}
