"use client";

// A deterministic delay keeps the pending mutation visible in the demo.
/* eslint-disable avoid-new */

import { useMutation } from "@tanstack/react-query";

import { Button } from "@/registry/new-york/button";

// ToastQueryAdapter and QueryClientProvider are mounted at the application root.
export const ToastQueryDemo = () => {
  const operation = useMutation({
    meta: {
      vandorToast: {
        error: "Could not save. Please try again.",
        loading: "Saving through Query…",
        success: "Mutation saved",
      },
    },
    mutationFn: async (fail: boolean) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 900);
      });
      if (fail) {
        throw new Error("Do not display this raw server error");
      }
      return "saved";
    },
  });
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button onClick={() => operation.mutate(false)}>
        Successful mutation
      </Button>
      <Button variant="outline" onClick={() => operation.mutate(true)}>
        Failed mutation
      </Button>
    </div>
  );
};
