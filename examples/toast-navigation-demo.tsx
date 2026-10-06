"use client";

// A deterministic delay illustrates navigation during an in-flight operation.
/* eslint-disable avoid-new */

import Link from "next/link";

import { toast } from "@/registry/new-york/toast";

export const ToastNavigationDemo = () => (
  <Link
    href="/docs/components/button"
    className="text-sm underline underline-offset-4"
    onClick={() => {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(resolve, 3000);
        }),
        {
          error: "Could not save",
          loading: "Saving before navigation…",
          success: "Saved after navigation",
        }
      );
    }}
  >
    Save and navigate to Button
  </Link>
);
