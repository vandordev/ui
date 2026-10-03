"use client";

import { Drawer, DrawerBody, DrawerFooter } from "@/registry/new-york/drawer";

export const DrawerDemo = () => (
  <Drawer
    title="Project settings"
    description="Manage the details and preferences for this project."
    trigger={
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Open drawer
      </button>
    }
  >
    {({ close }) => (
      <>
        <DrawerBody className="pt-5 text-sm text-muted-foreground">
          Drawer content can hold forms, navigation, or supporting actions. On
          touch devices, swipe toward the right edge to dismiss it.
        </DrawerBody>
        <DrawerFooter>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Done
          </button>
        </DrawerFooter>
      </>
    )}
  </Drawer>
);
