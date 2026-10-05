"use client";

import "blobatar/motion.css";
import "blobatar/gaze.css";
import { Blobatar } from "@/registry/new-york/blobatar";

export const BlobatarPointerDemo = () => (
  <div className="flex flex-col items-center gap-4">
    <Blobatar name="vandor" size={128} followPointer pointerTravel={3} />
    <p className="text-center text-sm text-muted-foreground">
      Move your mouse around the page. Eyes stay still on touch or with reduced
      motion.
    </p>
  </div>
);
