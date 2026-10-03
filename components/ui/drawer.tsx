"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";

import { drawerClose, drawerOpen } from "@/audio/core";
import { adaptBase } from "@/components/ui/base-ui-adapter";
import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";

const DrawerPrimitive = {
  ...BaseDrawer,
  Close: adaptBase(BaseDrawer.Close, "button"),
  Content: adaptBase(BaseDrawer.Popup),
  Description: adaptBase(BaseDrawer.Description, "p"),
  Overlay: adaptBase(BaseDrawer.Backdrop),
  Title: adaptBase(BaseDrawer.Title, "h2"),
  Trigger: adaptBase(BaseDrawer.Trigger, "button"),
};

const Drawer = ({
  onOpenChange,
  sounds = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  sounds?: boolean;
}) => {
  const playOpen = useFeedback({ soundDef: drawerOpen });
  const playClose = useFeedback({ soundDef: drawerClose });
  const isControlled = props.open !== undefined;
  const lastOpen = useRef(props.open ?? props.defaultOpen ?? false);

  const playStateSound = useCallback(
    (open: boolean) => {
      if (!sounds || open === lastOpen.current) {
        return;
      }

      if (open) {
        playOpen();
      } else {
        playClose();
      }

      lastOpen.current = open;
    },
    [playClose, playOpen, sounds]
  );

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    playStateSound(props.open ?? false);
  }, [isControlled, playStateSound, props.open]);

  const handleOpenChange = useCallback(
    (open: boolean, details: BaseDrawer.Root.ChangeEventDetails) => {
      playStateSound(open);
      onOpenChange?.(open, details);
    },
    [onOpenChange, playStateSound]
  );

  if (!sounds) {
    return (
      <DrawerPrimitive.Root
        data-slot="drawer"
        onOpenChange={onOpenChange}
        {...props}
      />
    );
  }

  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
};

const DrawerTrigger = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) => (
  <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
);

const DrawerPortal = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) => (
  <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
);

const DrawerClose = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) => (
  <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
);

const DrawerOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) => (
  <DrawerPrimitive.Overlay
    data-slot="drawer-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
);

const DrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) => (
  <DrawerPortal data-slot="drawer-portal">
    <DrawerOverlay />
    <BaseDrawer.Viewport className="fixed inset-0 z-50 pointer-events-none">
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content pointer-events-auto fixed z-50 flex h-auto flex-col bg-background transition-transform duration-300 data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
          "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:rounded-b-lg data-[swipe-direction=up]:border-b",
          "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:rounded-t-lg data-[swipe-direction=down]:border-t",
          "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:border-l data-[swipe-direction=right]:sm:max-w-sm",
          "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:border-r data-[swipe-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[swipe-direction=down]/drawer-content:block" />
        <BaseDrawer.Content>{children}</BaseDrawer.Content>
      </DrawerPrimitive.Content>
    </BaseDrawer.Viewport>
  </DrawerPortal>
);

const DrawerHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="drawer-header"
    className={cn(
      "flex flex-col gap-0.5 p-4 group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center md:gap-1.5 md:text-left",
      className
    )}
    {...props}
  />
);

const DrawerFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="drawer-footer"
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);

const DrawerTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) => (
  <DrawerPrimitive.Title
    data-slot="drawer-title"
    className={cn("font-semibold text-foreground", className)}
    {...props}
  />
);

const DrawerDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) => (
  <DrawerPrimitive.Description
    data-slot="drawer-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
