"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

const drawerControlKey = Symbol("drawer-control");
type DrawerHandle = ReturnType<typeof DrawerPrimitive.createHandle>;

interface DrawerControl {
  readonly isOpen: boolean;
  open: () => void;
  close: () => void;
  readonly [drawerControlKey]: {
    handle: DrawerHandle;
    subscribe: (listener: () => void) => () => void;
    notify: () => void;
  };
}

const createDrawerControl = (handle: DrawerHandle): DrawerControl => {
  const listeners = new Set<() => void>();
  return {
    [drawerControlKey]: {
      handle,
      notify: () => {
        for (const listener of listeners) {
          listener();
        }
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    },
    close: () => handle.close(),
    get isOpen() {
      return handle.isOpen;
    },
    open: () => handle.open(null),
  };
};

const getServerOpen = () => false;

const useDrawerSubscription = (control: DrawerControl) => {
  useSyncExternalStore(
    control[drawerControlKey].subscribe,
    () => control.isOpen,
    getServerOpen
  );
  return control;
};

const useDrawerControl = (): DrawerControl => {
  const [control] = useState(() =>
    createDrawerControl(DrawerPrimitive.createHandle())
  );
  return useDrawerSubscription(control);
};

interface DrawerContextValue {
  container: HTMLElement | null;
  control: DrawerControl;
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props["modal"];
  showSwipeHandle: boolean;
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

const useDrawer = (control?: DrawerControl): DrawerControl => {
  const context = useContext(DrawerContext);
  const selected = control ?? context?.control;
  if (!selected) {
    throw new Error(
      "useDrawer must be used inside Drawer or receive a control"
    );
  }
  return useDrawerSubscription(selected);
};

type DrawerRootProps = Omit<
  DrawerPrimitive.Root.Props,
  "handle" | "open" | "defaultOpen"
> & {
  showSwipeHandle?: boolean;
} & (
    | {
        control: DrawerControl;
        handle?: never;
        open?: never;
        defaultOpen?: never;
      }
    | {
        control?: never;
        handle?: DrawerPrimitive.Root.Props["handle"];
        open?: boolean;
        defaultOpen?: boolean;
      }
  );

const controlOwners = new WeakMap<DrawerControl, object>();

const DrawerRoot = ({
  control,
  handle,
  onOpenChange,
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  swipeDirection = "right",
  ...props
}: DrawerRootProps) => {
  const [localHandle] = useState(() => DrawerPrimitive.createHandle());
  const localControl = useMemo(
    () => createDrawerControl(handle ?? localHandle),
    [handle, localHandle]
  );
  const selected = control ?? localControl;
  const [owner] = useState(() => ({}));
  useEffect(() => {
    if (controlOwners.has(selected)) {
      throw new Error(
        "A DrawerControl can only be bound to one Drawer at a time"
      );
    }
    controlOwners.set(selected, owner);
    selected[drawerControlKey].notify();
    return () => {
      if (controlOwners.get(selected) === owner) {
        controlOwners.delete(selected);
      }
      queueMicrotask(selected[drawerControlKey].notify);
    };
  }, [owner, selected]);
  useEffect(() => {
    selected[drawerControlKey].notify();
  }, [selected, props.open]);
  if (
    control &&
    (props.open !== undefined ||
      props.defaultOpen !== undefined ||
      handle !== undefined)
  ) {
    throw new Error(
      "Drawer control cannot be combined with open, defaultOpen, or handle"
    );
  }
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const hasSnapPoints =
    snapPoints !== undefined && snapPoints !== null && snapPoints.length > 0;
  const value = useMemo(
    () => ({
      container,
      control: selected,
      hasSnapPoints,
      modal,
      showSwipeHandle,
      swipeDirection,
    }),
    [container, selected, hasSnapPoints, modal, showSwipeHandle, swipeDirection]
  );

  return (
    <DrawerContext.Provider value={value}>
      {/* Keep portals inside the caller's theme scope, including nested drawers. */}
      <span ref={setContainer} style={{ display: "contents" }}>
        <DrawerPrimitive.Root
          handle={selected[drawerControlKey].handle}
          onOpenChange={(nextOpen, details) => {
            try {
              onOpenChange?.(nextOpen, details);
            } finally {
              // Read the accepted state after Base UI has applied or cancelled the request.
              queueMicrotask(selected[drawerControlKey].notify);
            }
          }}
          modal={modal}
          snapPoints={snapPoints}
          swipeDirection={swipeDirection}
          {...props}
        />
      </span>
    </DrawerContext.Provider>
  );
};

const DrawerTrigger = ({
  className,
  ...props
}: DrawerPrimitive.Trigger.Props) => (
  <DrawerPrimitive.Trigger
    data-slot="drawer-trigger"
    className={cn(
      "cursor-pointer disabled:cursor-not-allowed data-disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
);

const DrawerPortal = (props: DrawerPrimitive.Portal.Props) => (
  <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
);

const DrawerClose = ({ className, ...props }: DrawerPrimitive.Close.Props) => (
  <DrawerPrimitive.Close
    data-slot="drawer-close"
    className={cn(
      "cursor-pointer disabled:cursor-not-allowed data-disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
);

const DrawerOverlay = ({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) => (
  <DrawerPrimitive.Backdrop
    data-slot="drawer-overlay"
    className={cn(
      "fixed inset-0 z-50 min-h-dvh bg-black/55 opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))] transition-opacity duration-250 ease-out select-none data-ending-style:pointer-events-none data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 data-snap-points:[--drawer-overlay-min-opacity:0.5] motion-reduce:transition-none supports-[-webkit-touch-callout:none]:absolute",
      className
    )}
    {...props}
  />
);

const DrawerSwipeHandle = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="drawer-swipe-handle"
    aria-hidden="true"
    className={cn(
      "relative z-10 flex shrink-0 cursor-grab transition-opacity duration-200 group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-[swipe-axis=x]/drawer-popup:w-3 group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=y]/drawer-popup:h-3 group-data-[swipe-axis=y]/drawer-popup:justify-center group-data-[swipe-direction=down]/drawer-popup:items-end group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:justify-start group-data-[swipe-direction=right]/drawer-popup:justify-end group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:items-start after:block after:shrink-0 after:rounded-full after:bg-muted-foreground/40 group-data-[swipe-axis=x]/drawer-popup:after:h-24 group-data-[swipe-axis=x]/drawer-popup:after:w-1 group-data-[swipe-axis=y]/drawer-popup:after:h-1 group-data-[swipe-axis=y]/drawer-popup:after:w-24 active:cursor-grabbing motion-reduce:transition-none",
      className
    )}
    {...props}
  />
);

type DrawerContentProps = Omit<DrawerPrimitive.Popup.Props, "children"> & {
  children?: ReactNode | ((control: DrawerControl) => ReactNode);
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  keepMounted?: boolean;
};

const DrawerContent = ({
  className,
  children,
  showCloseButton = true,
  closeButtonLabel = "Close drawer",
  keepMounted = false,
  ...props
}: DrawerContentProps) => {
  const control = useDrawer();
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("DrawerContent must be used inside Drawer");
  }
  const { hasSnapPoints, modal, showSwipeHandle, swipeDirection, container } =
    context;
  const swipeAxis =
    swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";

  return (
    <DrawerPortal container={container} keepMounted={keepMounted}>
      {modal === true && (
        <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} />
      )}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={modal}
        className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          data-swipe-axis={swipeAxis}
          data-snap-points={hasSnapPoints ? "" : undefined}
          data-close-button={showCloseButton ? "" : undefined}
          className={cn(
            "group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col border-border bg-background text-sm text-foreground shadow-xl transition-[transform,height,opacity,filter] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords] motion-reduce:animate-none motion-reduce:transition-none data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:border-t data-[swipe-direction=up]:rounded-b-xl data-[swipe-direction=up]:border-b",
            "data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95",
            "data-[swipe-axis=y]:data-snap-points:[--drawer-content-max-height:100dvh]",
            "[--drawer-visible-offset:max(var(--drawer-snap-point-offset,0px),calc(-1*var(--drawer-snap-point-offset,0px)))]",
            "after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--background)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full",
            "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=x]:[--drawer-content-width:calc(100%-var(--drawer-inset)*2)] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:28rem]",
            "data-[swipe-axis=x]:[--drawer-inset:0.5rem] data-[swipe-axis=x]:sm:[--drawer-inset:0.75rem] data-[swipe-axis=x]:rounded-2xl data-[swipe-axis=x]:border data-[swipe-axis=x]:after:hidden",
            "[--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05]",
            "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-[0.9999] data-starting-style:transform-(--closed-transform) data-nested-drawer-swiping:duration-0 data-swiping:duration-0",
            "data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-nested-drawer-open:h-(--stack-height) data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row",
            "data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]",
            "data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]",
            "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]",
            "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]",
            className
          )}
          {...props}
        >
          {showSwipeHandle && <DrawerSwipeHandle />}
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-200 select-text group-data-snap-points/drawer-popup:max-h-[calc(100%-var(--drawer-visible-offset))] group-data-[swipe-direction=up]/drawer-popup:group-data-snap-points/drawer-popup:mt-(--drawer-visible-offset) group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100 group-data-swiping/drawer-popup:select-none motion-reduce:transition-none"
          >
            {typeof children === "function" ? children(control) : children}
            {showCloseButton && (
              <DrawerClose
                aria-label={closeButtonLabel}
                data-slot="drawer-close-button"
                className="absolute top-3 right-3 z-20 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group-data-[swipe-direction=up]/drawer-popup:group-data-snap-points/drawer-popup:top-[calc(0.75rem+var(--drawer-visible-offset))] motion-reduce:transition-none"
              >
                <XIcon aria-hidden="true" className="size-4" />
              </DrawerClose>
            )}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
};

const DrawerHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="drawer-header"
    className={cn(
      "flex shrink-0 flex-col gap-2 p-4 pb-0 group-data-close-button/drawer-popup:pr-14 group-data-[swipe-axis=y]/drawer-popup:text-center md:text-left",
      className
    )}
    {...props}
  />
);

const DrawerBody = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="drawer-body"
    className={cn(
      "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4",
      className
    )}
    {...props}
  />
);

const DrawerFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="drawer-footer"
    className={cn("mt-auto flex shrink-0 flex-col gap-2 p-4 pt-0", className)}
    {...props}
  />
);

const DrawerTitle = ({ className, ...props }: DrawerPrimitive.Title.Props) => (
  <DrawerPrimitive.Title
    data-slot="drawer-title"
    className={cn("text-base font-medium text-foreground", className)}
    {...props}
  />
);

const DrawerDescription = ({
  className,
  ...props
}: DrawerPrimitive.Description.Props) => (
  <DrawerPrimitive.Description
    data-slot="drawer-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

type DrawerStateProps<T = DrawerRootProps> = T extends unknown
  ? Omit<T, "children">
  : never;

interface DrawerHeaderElements {
  title: ReactElement;
  description: ReactElement | null;
}

type DrawerProps = DrawerStateProps & {
  title: ReactNode;
  description?: ReactNode;
  trigger?: ReactElement;
  children?: DrawerContentProps["children"];
  contentProps?: Omit<DrawerContentProps, "children">;
  renderHeader?: (elements: DrawerHeaderElements) => ReactNode;
};

const Drawer = ({
  title,
  description,
  trigger,
  children,
  contentProps,
  renderHeader,
  ...props
}: DrawerProps) => {
  const headerElements: DrawerHeaderElements = {
    description:
      description === null || description === undefined ? null : (
        <DrawerDescription>{description}</DrawerDescription>
      ),
    title: <DrawerTitle>{title}</DrawerTitle>,
  };
  return (
    <DrawerRoot {...props}>
      {trigger && <DrawerTrigger render={trigger} />}
      <DrawerContent {...contentProps}>
        {(control) => (
          <>
            <DrawerHeader>
              {renderHeader ? (
                renderHeader(headerElements)
              ) : (
                <>
                  {headerElements.title}
                  {headerElements.description}
                </>
              )}
            </DrawerHeader>
            {typeof children === "function" ? children(control) : children}
          </>
        )}
      </DrawerContent>
    </DrawerRoot>
  );
};

export { Drawer, DrawerBody, DrawerFooter, useDrawer, useDrawerControl };

export type { DrawerControl, DrawerHeaderElements, DrawerProps };
