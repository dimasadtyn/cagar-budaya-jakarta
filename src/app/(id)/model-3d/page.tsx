import Model3DPage, { metadataModel3D } from "@/views/Model3DPage";

export const metadata = metadataModel3D("id");

export default function Page() {
  return <Model3DPage b="id" />;
}
