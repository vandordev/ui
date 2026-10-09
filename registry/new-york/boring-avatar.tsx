"use client";

import { Avatar } from "@base-ui/react/avatar";
import GeneratedAvatar from "boring-avatars";
import { cn } from "cn";
import type * as React from "react";

export type BoringAvatarVariant =
  | "beam"
  | "marble"
  | "pixel"
  | "sunset"
  | "ring"
  | "bauhaus";

export type BoringAvatarProps = Omit<
  React.ComponentProps<"span">,
  "children"
> & {
  /** Stable, case-sensitive identity for local generation. */
  name: string;
  /** Optional photo; loading and failed photos show the generated fallback. */
  src?: string;
  /** Shared accessible label. Empty means decorative. */
  alt?: string;
  /** Pixel dimensions. Explicit style overrides these. */
  size?: number;
  variant?: BoringAvatarVariant;
  /** Square clipping for both the generated SVG and the photo. */
  square?: boolean;
  /** Non-empty palette of hexadecimal colors; empty uses upstream defaults. */
  colors?: string[];
};

export const BoringAvatar = ({
  name,
  src,
  alt = "",
  size = 40,
  variant = "beam",
  square = false,
  colors,
  className,
  style,
  ...props
}: BoringAvatarProps) => (
  <Avatar.Root
    data-slot="boring-avatar"
    className={cn("relative inline-flex shrink-0 align-middle", className)}
    style={{ height: size, width: size, ...style }}
    {...props}
  >
    <Avatar.Fallback
      data-slot="boring-avatar-fallback"
      className="flex size-full"
    >
      <GeneratedAvatar
        name={name}
        variant={variant}
        colors={colors?.length ? colors : undefined}
        square={square}
        size="100%"
        title={false}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        focusable="false"
        className="size-full"
      />
    </Avatar.Fallback>
    {src ? (
      <Avatar.Image
        data-slot="boring-avatar-image"
        src={src}
        alt={alt}
        keepMounted
        className={cn(
          "absolute inset-0 size-full object-cover data-[loading]:invisible data-[error]:invisible",
          !square && "rounded-full"
        )}
      />
    ) : null}
  </Avatar.Root>
);
