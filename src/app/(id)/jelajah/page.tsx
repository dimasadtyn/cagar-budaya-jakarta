import ExplorePage, { metadataJelajah } from "@/views/ExplorePage";

export const metadata = metadataJelajah("id");

export default function Page() {
  return <ExplorePage b="id" />;
}
