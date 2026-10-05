"use client";

import "blobatar/motion.css";
import "blobatar/gaze.css";
import { ComponentPlayground } from "@/components/component-playground";
import {
  blobatarProps,
  getBlobatarCode,
  getBlobatarDefaults,
  getBlobatarPreviewProps,
} from "@/lib/blobatar-playground";
import { Blobatar } from "@/registry/new-york/blobatar";

export const BlobatarPlayground = () => (
  <ComponentPlayground
    title="Blobatar"
    definitions={blobatarProps}
    initialValues={getBlobatarDefaults()}
    getCode={getBlobatarCode}
    hint="Photos take priority. Follow pointer enables inline SVG and overrides Animation; eyes stay still on touch or under reduced motion. Choose Background: none for a transparent silhouette."
    renderPreview={(values) => (
      <Blobatar {...getBlobatarPreviewProps(values)} />
    )}
  />
);
