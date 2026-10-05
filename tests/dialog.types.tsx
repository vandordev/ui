import { createRef } from "react";

import {
  Dialog,
  DialogBody,
  useDialog,
  useDialogControl,
} from "../registry/new-york/dialog";

export const DialogTypeContracts = () => {
  const control = useDialogControl();
  const selected = useDialog(control);
  const popup = createRef<HTMLDivElement>();
  const valid = (
    <Dialog
      title="Settings"
      control={control}
      contentProps={{ finalFocus: false, ref: popup, size: "xl" }}
      onOpenChange={(_, details) => details.cancel()}
      renderHeader={({ title, description }) => (
        <>
          {description}
          {title}
        </>
      )}
    >
      {({ close, isOpen }) => (
        <DialogBody aria-busy={isOpen}>
          <button type="button" onClick={close}>
            Done
          </button>
        </DialogBody>
      )}
    </Dialog>
  );
  const plain = (
    <Dialog
      title="Settings"
      defaultOpen
      trigger={<button type="button">Open</button>}
    >
      <DialogBody>Plain children</DialogBody>
    </Dialog>
  );
  // @ts-expect-error A controller cannot compete with controlled state.
  const invalidOpen = <Dialog title="Settings" control={control} open />;
  const invalidDefault = (
    // @ts-expect-error Initial state belongs to the controller-bound root.
    <Dialog title="Settings" control={control} defaultOpen />
  );
  // @ts-expect-error Title is required for accessibility.
  const missingTitle = <Dialog />;
  // @ts-expect-error Trigger must be an element.
  const invalidTrigger = <Dialog title="Settings" trigger="Open" />;
  const invalidChildren = (
    // @ts-expect-error Children belong to Dialog, not contentProps.
    <Dialog title="Settings" contentProps={{ children: "Wrong" }} />
  );
  const invalidSize = (
    // @ts-expect-error Only supported sizes are accepted.
    <Dialog title="Settings" contentProps={{ size: "full" }} />
  );
  // @ts-expect-error Controller state is read-only.
  selected.isOpen = false;
  return (
    <>
      {valid}
      {plain}
      {invalidOpen}
      {invalidDefault}
      {missingTitle}
      {invalidTrigger}
      {invalidChildren}
      {invalidSize}
    </>
  );
};
