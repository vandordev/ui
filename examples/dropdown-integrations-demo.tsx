"use client";

import Link from "next/link";

import { Dialog, DialogBody } from "@/registry/new-york/dialog";
import { Drawer, DrawerBody } from "@/registry/new-york/drawer";
import { Dropdown } from "@/registry/new-york/dropdown";
import type { DropdownOverlayProps } from "@/registry/new-york/dropdown";

const DetailsDialog = ({ finalFocus, ...props }: DropdownOverlayProps) => (
  <Dialog
    {...props}
    title="Project details"
    description="This dialog is rendered outside the menu popup."
    contentProps={{ finalFocus }}
  >
    <DialogBody>
      <p className="text-sm text-muted-foreground">
        Closing the dialog returns focus to the original menu trigger.
      </p>
    </DialogBody>
  </Dialog>
);

const DetailsDrawer = ({ finalFocus, ...props }: DropdownOverlayProps) => (
  <Drawer
    {...props}
    title="Project activity"
    description="A component-based drawer opened from an item."
    contentProps={{ finalFocus }}
  >
    <DrawerBody>
      <p className="text-sm text-muted-foreground">
        The drawer stays mounted when the menu popup disappears.
      </p>
    </DrawerBody>
  </Drawer>
);

export const DropdownIntegrationsDemo = () => (
  <Dropdown
    trigger={
      <button
        type="button"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        Project actions
      </button>
    }
    items={[
      {
        id: "docs",
        label: "Read Dialog docs",
        link: <Link href="/docs/components/dialog" prefetch={false} />,
      },
      { id: "divider", type: "separator" },
      {
        id: "details",
        label: "Project details",
        renderOverlay: (props) => <DetailsDialog {...props} />,
      },
      {
        id: "activity",
        label: "Project activity",
        renderOverlay: (props) => <DetailsDrawer {...props} />,
      },
    ]}
  />
);
