"use client";

import { Avatar } from "@base-ui/react/avatar";
import { Blobatar as GeneratedBlobatar } from "@blobatar/react";
import { useGaze } from "@blobatar/react/gaze";
import type { BlobatarOptions } from "blobatar";
import { cn } from "cn";
import type * as React from "react";

export type BlobatarAppearance = Omit<
  BlobatarOptions,
  "size" | "title" | "animate"
> & {
  animate?: false | "hover" | "always";
};

export type BlobatarProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Stable identity used to generate the fallback locally. */
  name: string;
  /** Optional profile photo. Loading and failed photos show the fallback. */
  src?: string;
  /** Accessible label for both photo and fallback. Empty means decorative. */
  alt?: string;
  /** Width and height in pixels. Explicit style can override them. */
  size?: number;
  /** Follow a fine pointer. Requires motion.css and gaze.css; forces inline SVG. */
  followPointer?: boolean;
  /** Eye excursion in SVG viewBox units, not screen pixels. */
  pointerTravel?: number;
  /** Generator options. Motion requires blobatar/motion.css. */
  blobatar?: BlobatarAppearance;
};

export const Blobatar = ({
  name,
  src,
  alt = "",
  size = 40,
  followPointer = false,
  pointerTravel = 3,
  blobatar,
  className,
  style,
  ...props
}: BlobatarProps) => {
  const { ref: gazeRef } = useGaze({
    lookAt: followPointer ? "pointer" : null,
    travel: pointerTravel,
  });
  return (
    <Avatar.Root
      data-slot="blobatar"
      className={cn("relative inline-flex shrink-0 align-middle", className)}
      style={{ height: size, width: size, ...style }}
      {...props}
    >
      {src ? (
        <Avatar.Image
          data-slot="blobatar-image"
          src={src}
          alt={alt}
          keepMounted
          className="absolute inset-0 size-full rounded-full object-cover data-[loading]:invisible data-[error]:invisible"
        />
      ) : null}
      <Avatar.Fallback data-slot="blobatar-fallback" className="flex size-full">
        <GeneratedBlobatar
          background="circle"
          {...blobatar}
          animate={followPointer ? "always" : blobatar?.animate || undefined}
          ref={followPointer ? gazeRef : undefined}
          name={name}
          title={alt || undefined}
          className="size-full"
        />
      </Avatar.Fallback>
    </Avatar.Root>
  );
};
