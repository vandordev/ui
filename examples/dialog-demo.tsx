"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/registry/new-york/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  useDialogControl,
} from "@/registry/new-york/dialog";

export const DialogDemo = () => (
  <Dialog
    title="Project details"
    description="A focused space for the task at hand."
    trigger={<Button variant="outline">Open dialog</Button>}
  >
    <DialogBody>
      <p className="text-muted-foreground">
        The header stays visible while the body scrolls. Use the close button or
        Escape when you are done.
      </p>
    </DialogBody>
  </Dialog>
);

export const DialogFormDemo = () => {
  const nameId = useId();
  const [savedName, setSavedName] = useState("Vandor UI");
  return (
    <div className="flex flex-col items-center gap-3">
      <Dialog
        title="Edit project"
        description="Submit to update the name in this local demo."
        trigger={<Button variant="outline">Edit project</Button>}
      >
        {({ close }) => (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              setSavedName(
                String(new FormData(event.currentTarget).get("name"))
              );
              close();
            }}
          >
            <DialogBody className="flex flex-col gap-2">
              <label htmlFor={nameId} className="font-medium">
                Project name
              </label>
              <input
                id={nameId}
                name="name"
                defaultValue={savedName}
                required
                className="h-9 w-full rounded-md border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Save name</Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>
      <output className="text-sm text-muted-foreground">
        Current name: {savedName}
      </output>
    </div>
  );
};

export const DialogExternalDemo = () => {
  const control = useDialogControl();
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={opener} variant="outline" onClick={control.open}>
        Open from outside
      </Button>
      <Dialog
        control={control}
        title="External control"
        description="This opener lives outside the dialog composition."
        contentProps={{ finalFocus: opener }}
      >
        <DialogBody>
          <p className="text-muted-foreground">
            The controller and child hooks share the accepted state. Focus
            returns to the external opener after closing.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button onClick={control.close}>Done</Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export const DialogControlledDemo = () => {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [blocked, setBlocked] = useState(false);
  return (
    <Dialog
      title="Unsaved changes"
      description="Mark the draft as edited to try a dismissal guard."
      trigger={<Button variant="outline">Try dismissal guard</Button>}
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && dirty) {
          details.cancel();
          setBlocked(true);
          return;
        }
        setBlocked(false);
        setOpen(nextOpen);
      }}
    >
      <DialogBody className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={dirty}
            onChange={(event) => setDirty(event.target.checked)}
          />
          Draft has unsaved changes
        </label>
        {blocked && (
          <p role="status" className="text-muted-foreground">
            Dismissal was blocked. Uncheck the draft option or discard changes.
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setDirty(false);
            setBlocked(false);
            setOpen(false);
          }}
        >
          Discard and close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export const DialogNestedDemo = () => (
  <Dialog
    title="Project settings"
    trigger={<Button variant="outline">Open settings</Button>}
  >
    <DialogBody>
      <Dialog
        title="Advanced settings"
        description="Escape dismisses only the topmost dialog."
        trigger={<Button variant="outline">Open advanced settings</Button>}
        contentProps={{ size: "sm" }}
      >
        {({ close }) => (
          <>
            <DialogBody>Each dialog owns a separate controller.</DialogBody>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </DialogBody>
  </Dialog>
);
