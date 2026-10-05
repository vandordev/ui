"use client";

import "blobatar/motion.css";
import "blobatar/gaze.css";
import { ComponentPlayground } from "@/components/component-playground";
import { BlobatarDialogDemo } from "@/examples/blobatar-dialog-demo";
import { BlobatarDrawerDemo } from "@/examples/blobatar-drawer-demo";
import { BlobatarDropdownDemo } from "@/examples/blobatar-dropdown-demo";
import { BlobatarPopoverDemo } from "@/examples/blobatar-popover-demo";
import {
  blobatarPlaygroundProps,
  getBlobatarCode,
  getBlobatarDefaults,
  getBlobatarPreviewProps,
} from "@/lib/blobatar-playground";
import { Blobatar } from "@/registry/new-york/blobatar";

const compositions = {
  dialog: BlobatarDialogDemo,
  drawer: BlobatarDrawerDemo,
  dropdown: BlobatarDropdownDemo,
  popover: BlobatarPopoverDemo,
  standalone: Blobatar,
};

export const BlobatarPlayground = () => (
  <ComponentPlayground
    title="Blobatar"
    definitions={blobatarPlaygroundProps}
    initialValues={getBlobatarDefaults()}
    getCode={getBlobatarCode}
    hint="Choose a Composition, then click the avatar to open its overlay. Install the selected overlay separately. Photos take priority; Follow pointer overrides Animation and stays still on touch or under reduced motion."
    renderPreview={(values) => {
      const Preview = compositions[values.composition];
      return (
        <Preview
          key={values.composition}
          {...getBlobatarPreviewProps(values)}
        />
      );
    }}
  />
);
