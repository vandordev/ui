"use client";

import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/new-york/drawer";

export const DrawerDemo = () => (
  <Drawer swipeDirection="right">
    <DrawerTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      Open drawer
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Project settings</DrawerTitle>
        <DrawerDescription>
          Manage the details and preferences for this project.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerBody className="pt-5 text-sm text-muted-foreground">
        Drawer content can hold forms, navigation, or supporting actions. On
        touch devices, swipe toward the right edge to dismiss it.
      </DrawerBody>
      <DrawerFooter>
        <DrawerClose className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Done
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);
