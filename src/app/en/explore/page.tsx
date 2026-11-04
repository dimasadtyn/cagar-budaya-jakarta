import ExplorePage, { metadataJelajah } from "@/views/ExplorePage";

export const metadata = metadataJelajah("en");

export default function Page() {
  return <ExplorePage b="en" />;
}
