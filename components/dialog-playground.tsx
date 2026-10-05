"use client";

import { useId, useRef } from "react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  dialogProps,
  getDialogCode,
  getDialogDefaults,
  getDialogPreviewProps,
} from "@/lib/dialog-playground";
import type { DialogPlaygroundValues } from "@/lib/dialog-playground";
import { Button } from "@/registry/new-york/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  useDialog,
  useDialogControl,
} from "@/registry/new-york/dialog";

const DoneButton = () => {
  const { close } = useDialog();
  return <Button onClick={close}>Done</Button>;
};
export const DialogPreview = ({
  values,
}: {
  values: DialogPlaygroundValues;
}) => {
  const control = useDialogControl();
  const opener = useRef<HTMLButtonElement>(null);
  const nameId = useId();
  const external = values.example === "control";
  const form = values.example === "form";
  const renderFunction = form || values.example === "render-function";
  const props = getDialogPreviewProps(values);
  const content = (close?: () => void) => (
    <>
      <DialogBody>
        {form ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className="font-medium">
              Project name
            </label>
            <input
              id={nameId}
              name="name"
              defaultValue="Vandor UI"
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-muted-foreground">
              This demo does not save data.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">Your settings form</p>
        )}
        {values.longContent &&
          Array.from({ length: 30 }, (_, index) => (
            <p key={index} className="mt-4 text-muted-foreground">
              Setting {index + 1}: Configure your project preferences.
            </p>
          ))}
      </DialogBody>
      <DialogFooter>
        {form ? (
          <>
            <Button variant="outline" type="button" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">Submit demo</Button>
          </>
        ) : null}
        {!form &&
          (close ? <Button onClick={close}>Done</Button> : <DoneButton />)}
      </DialogFooter>
    </>
  );
  return (
    <>
      {external && (
        <Button ref={opener} variant="outline" onClick={control.open}>
          Open dialog
        </Button>
      )}
      <Dialog
        {...props}
        control={external ? control : undefined}
        trigger={
          external ? undefined : <Button variant="outline">Open dialog</Button>
        }
        contentProps={{
          ...props.contentProps,
          finalFocus: external ? opener : undefined,
        }}
      >
        {renderFunction
          ? ({ close }) =>
              form ? (
                <form
                  className="flex min-h-0 flex-1 flex-col"
                  onSubmit={(event) => {
                    event.preventDefault();
                    close();
                  }}
                >
                  {content(close)}
                </form>
              ) : (
                content(close)
              )
          : content()}
      </Dialog>
    </>
  );
};
export const DialogPlayground = () => (
  <ComponentPlayground
    title="Dialog"
    definitions={dialogProps}
    initialValues={getDialogDefaults()}
    getCode={getDialogCode}
    hint="Open the dialog to preview it. Try long content and a form to see stationary actions. Reset also clears demo state. Generated code reproduces configuration, not transient form edits."
    renderPreview={(values) => (
      <DialogPreview key={values.example} values={values} />
    )}
  />
);
