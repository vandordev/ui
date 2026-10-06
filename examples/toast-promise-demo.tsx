"use client";

import { Button } from "@/registry/new-york/button";
import { toast } from "@/registry/new-york/toast";

const publish = async () => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { title: "Release notes" };
};

export const ToastPromiseDemo = () => (
  <Button
    onClick={() =>
      toast.promise(publish(), {
        loading: "Publishing…",
        success: ({ title }) => `${title} published`,
        error: "Could not publish",
      })
    }
  >
    Publish
  </Button>
);
