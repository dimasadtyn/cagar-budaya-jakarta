import type { ModelViewerElement } from "@google/model-viewer";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
        src: string;
        alt: string;
        "camera-controls"?: "";
        "touch-action"?: string;
        "camera-orbit"?: string;
        "shadow-intensity"?: string;
        "tone-mapping"?: string;
      };
    }
  }
}
