"use client";

import { useRef } from "react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  drawerProps,
  getDrawerCode,
  getDrawerDefaults,
} from "@/lib/drawer-playground";
import type { DrawerPlaygroundValues } from "@/lib/drawer-playground";
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
  useDrawerControl,
} from "@/registry/new-york/drawer";

const actionClassName =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const triggerClassName =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const DrawerPreview = ({ values }: { values: DrawerPlaygroundValues }) => {
  const control = useDrawerControl();
  const opener = useRef<HTMLButtonElement>(null);
  const external = values.example === "control";
  const renderFunction = values.example === "render-function";
  let snapPoints: number[] | undefined;
  if (values.snapPoints === "half") {
    snapPoints = [0.5];
  } else if (values.snapPoints === "half-full") {
    snapPoints = [0.5, 0.9];
  }
  const content = (close?: () => void) => (
    <>
      <DrawerHeader>
        <DrawerTitle>Project settings</DrawerTitle>
        <DrawerDescription>
          Manage the details and preferences for this project.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerBody className="pt-5 text-sm text-muted-foreground">
        {values.longContent
          ? Array.from({ length: 30 }, (_, index) => (
              <p key={index} className="mb-4">
                Setting {index + 1}: Configure your project preferences.
              </p>
            ))
          : "Drawer content can hold forms, navigation, or supporting actions. Try changing its direction and snap points below."}
      </DrawerBody>
      <DrawerFooter>
        {close ? (
          <button type="button" className={actionClassName} onClick={close}>
            Done
          </button>
        ) : (
          <DrawerClose className={actionClassName}>Done</DrawerClose>
        )}
      </DrawerFooter>
    </>
  );
  return (
    <>
      {external && (
        <button
          ref={opener}
          type="button"
          className={triggerClassName}
          onClick={control.open}
        >
          Open drawer
        </button>
      )}
      <Drawer
        control={external ? control : undefined}
        modal={values.modal}
        showSwipeHandle={values.showSwipeHandle}
        snapPoints={snapPoints}
        swipeDirection={values.swipeDirection}
      >
        {!external && (
          <DrawerTrigger className={triggerClassName}>
            Open drawer
          </DrawerTrigger>
        )}
        <DrawerContent
          finalFocus={external ? opener : undefined}
          showCloseButton={values.showCloseButton}
        >
          {renderFunction ? ({ close }) => content(close) : content()}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const DrawerPlayground = () => (
  <ComponentPlayground
    title="Drawer"
    definitions={drawerProps}
    initialValues={getDrawerDefaults()}
    getCode={getDrawerCode}
    hint="Open the drawer to preview it. Choose up or down to try snap points. Swipe toward the opening edge or press Escape to close."
    renderPreview={(values) => (
      <DrawerPreview
        key={`${values.swipeDirection}-${values.snapPoints}-${values.example}`}
        values={values}
      />
    )}
  />
);
