"use client";

import { Button } from "@/registry/new-york/button";
import { toast } from "@/registry/new-york/toast";

export const ToastActionDemo = () => (
  <Button
    variant="outline"
    onClick={() =>
      toast.action("Draft deleted", {
        actionLabel: "Undo",
        actionOnClick: () => toast.success("Draft restored"),
        description: "The draft can still be restored.",
      })
    }
  >
    Delete draft
  </Button>
);
