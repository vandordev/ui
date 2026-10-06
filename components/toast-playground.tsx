"use client";

import { useEffect, useRef } from "react";

import { ComponentPlayground } from "@/components/component-playground";
import { useToastPreviewPosition } from "@/components/toast-site-provider";
import { Button } from "@/components/ui/button";
import {
  getToastCode,
  getToastDefaults,
  toastProps,
  getToastPreviewOptions,
} from "@/lib/toast-playground";
import { toast } from "@/registry/new-york/toast";
import type { ToastPosition } from "@/registry/new-york/toast";

const ToastPreview = ({
  values,
  track,
}: {
  values: ReturnType<typeof getToastDefaults>;
  track: (id: string) => void;
}) => {
  const environment = useToastPreviewPosition();
  const setPosition = environment?.setPosition;
  useEffect(() => {
    setPosition?.(
      values.position === "responsive"
        ? undefined
        : (values.position as ToastPosition)
    );
    return () => setPosition?.(undefined);
  }, [setPosition, values.position]);
  const show = () =>
    track(
      toast[
        values.type as
          | "success"
          | "error"
          | "warning"
          | "info"
          | "loading"
          | "action"
      ](
        values.title,
        getToastPreviewOptions(values, () =>
          track(toast.success("Action completed"))
        )
      )
    );
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button onClick={show}>Show notification</Button>
      <Button
        variant="outline"
        onClick={() => {
          for (let index = 0; index < 6; index += 1) {
            show();
          }
        }}
      >
        Burst ×6
      </Button>
    </div>
  );
};

export const ToastPlayground = () => {
  const ids = useRef(new Set<string>());
  const clear = () => {
    for (const id of ids.current) {
      toast.dismiss(id);
    }
    ids.current.clear();
  };
  useEffect(
    () => () => {
      for (const id of ids.current) {
        toast.dismiss(id);
      }
    },
    []
  );
  return (
    <ComponentPlayground
      title="Toast"
      definitions={toastProps}
      initialValues={getToastDefaults()}
      getCode={getToastCode}
      onReset={clear}
      hint="One notification is shown at a time. Close it to reveal the next; the stack icon counts waiting messages, and its adjacent × clears all. Hover only pauses expiry. Reset clears playground notifications; Burst repeats the configured trigger six times."
      renderPreview={(values) => (
        <ToastPreview values={values} track={(id) => ids.current.add(id)} />
      )}
    />
  );
};
