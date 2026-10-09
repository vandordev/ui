"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  boringAvatarProps,
  getBoringAvatarCode,
  getBoringAvatarDefaults,
  getBoringAvatarPreviewProps,
} from "@/lib/boring-avatar-playground";
import { BoringAvatar } from "@/registry/new-york/boring-avatar";

export const BoringAvatarPlayground = () => (
  <ComponentPlayground
    title="BoringAvatar"
    definitions={boringAvatarProps}
    initialValues={getBoringAvatarDefaults()}
    getCode={getBoringAvatarCode}
    hint="No extra wrapper background. Original SVG color fields remain. Photos take priority; missing or failed photos show the generated avatar. Reset restores all controls."
    renderPreview={(values) => (
      <BoringAvatar {...getBoringAvatarPreviewProps(values)} />
    )}
  />
);
