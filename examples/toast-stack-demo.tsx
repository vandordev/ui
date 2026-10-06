"use client";

import { Button } from "@/registry/new-york/button";
import { toast } from "@/registry/new-york/toast";

export const ToastStackDemo = () => (
  <Button
    onClick={() => {
      for (let index = 1; index <= 8; index += 1) {
        toast.info(`Upload ${index} complete`, {
          description: `File ${index} is ready for your team.`,
        });
      }
    }}
  >
    Upload eight files
  </Button>
);
