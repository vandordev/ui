"use client";

import { CheckIcon } from "lucide-react";

import { Button } from "@/registry/new-york/button";
import { toast } from "@/registry/new-york/toast";

export const ToastDemo = () => (
  <div className="flex flex-wrap justify-center gap-2">
    <Button onClick={() => toast.success("Changes saved")}>
      <CheckIcon aria-hidden="true" />
      Compact
    </Button>
    <Button
      variant="outline"
      onClick={() =>
        toast.info("Settings updated", {
          description: "Your project settings are up to date.",
        })
      }
    >
      With details
    </Button>
  </div>
);
