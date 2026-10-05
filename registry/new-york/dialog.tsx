"use client";

// Adapted from shadcn/ui's Base Nova Dialog (MIT).
// https://ui.shadcn.com/docs/components/base/dialog
/*
MIT License
Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { useAnimateMini, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

const controlKey = Symbol("dialog-control");
type DialogHandle = ReturnType<typeof Primitive.createHandle>;

interface DialogControl {
  readonly isOpen: boolean;
  open: () => void;
  close: () => void;
  readonly [controlKey]: {
    handle: DialogHandle;
    subscribe: (listener: () => void) => () => void;
    notify: () => void;
  };
}

const createControl = (handle: DialogHandle): DialogControl => {
  const listeners = new Set<() => void>();
  return {
    [controlKey]: {
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
const useSubscription = (control: DialogControl) => {
  useSyncExternalStore(
    control[controlKey].subscribe,
    () => control.isOpen,
    getServerOpen
  );
  return control;
};
const useDialogControl = (): DialogControl => {
  const [control] = useState(() => createControl(Primitive.createHandle()));
  return useSubscription(control);
};
const DialogContext = createContext<DialogControl | null>(null);
const useDialog = (control?: DialogControl): DialogControl => {
  const context = useContext(DialogContext);
  const selected = control ?? context;
  if (!selected) {
    throw new Error(
      "useDialog must be used inside Dialog or receive a control"
    );
  }
  return useSubscription(selected);
};

type DialogContentProps = Omit<Primitive.Popup.Props, "children"> & {
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  keepMounted?: boolean;
};
interface DialogHeaderElements {
  title: ReactElement;
  description: ReactElement | null;
}
type DialogStateProps = Omit<
  Primitive.Root.Props,
  "children" | "handle" | "open" | "defaultOpen"
> &
  (
    | {
        control: DialogControl;
        handle?: never;
        open?: never;
        defaultOpen?: never;
      }
    | {
        control?: never;
        handle?: Primitive.Root.Props["handle"];
        open?: boolean;
        defaultOpen?: boolean;
      }
  );
type DialogProps = DialogStateProps & {
  title: ReactNode;
  description?: ReactNode;
  trigger?: ReactElement;
  children?: ReactNode | ((control: DialogControl) => ReactNode);
  contentProps?: DialogContentProps;
  renderHeader?: (elements: DialogHeaderElements) => ReactNode;
};

// Native WAAPI animations remain visible to Base UI's public animation lifecycle.
// This covers controlled prop changes as well as trigger/imperative requests,
// without retaining invisible, focus-trapped panels or overriding completion events.
const AnimatedElement = ({
  nativeProps,
  state,
  render,
  backdrop = false,
}: {
  nativeProps: ComponentProps<"div">;
  state: Primitive.Popup.State | Primitive.Backdrop.State;
  render?: Primitive.Popup.Props["render"];
  backdrop?: boolean;
}) => {
  const [scope, animate] = useAnimateMini<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  const nestedOpen = "nestedDialogOpen" in state && state.nestedDialogOpen;
  const openScale = nestedOpen ? 0.96 : 1;
  const targetScale = state.open ? openScale : 0.94;
  useLayoutEffect(() => {
    const element = scope.current;
    if (!element) {
      return;
    }
    const opacity = state.open ? 1 : 0;
    const scale = backdrop || reduceMotion ? 1 : targetScale;
    const translate = state.open || reduceMotion ? "0 0px" : "0 12px";
    if (reduceMotion || typeof element.animate !== "function") {
      element.style.opacity = String(opacity);
      if (!backdrop) {
        element.style.scale = String(scale);
        element.style.translate = translate;
      }
      return;
    }
    const panelDuration = state.open ? 0.32 : 0.22;
    const animation = animate(
      [element],
      backdrop ? { opacity } : { opacity, scale, translate },
      {
        duration: backdrop ? 0.2 : panelDuration,
        ease: state.open ? [0.22, 1, 0.36, 1] : [0.4, 0, 1, 1],
      }
    );
    // WAAPI rejects finished when interrupted; rapid reopen/unmount is expected.
    for (const nativeAnimation of element.getAnimations()) {
      // Intentional interruption is not an application error.
      // eslint-disable-next-line promise/prefer-await-to-then
      nativeAnimation.finished.catch(() => {
        // Interrupted animations are intentionally canceled during cleanup.
      });
    }
    return () => animation.stop();
  }, [animate, backdrop, reduceMotion, scope, state.open, targetScale]);
  return useRender({
    props: { ...nativeProps },
    ref: [nativeProps.ref ?? null, scope],
    render,
    state: { nested: false, nestedDialogOpen: false, ...state },
  });
};

const DialogChildren = ({
  children,
}: {
  children: DialogProps["children"];
}) => {
  const control = useDialog();
  return <>{typeof children === "function" ? children(control) : children}</>;
};
const owners = new WeakMap<DialogControl, object>();
const Dialog = ({
  control,
  handle,
  title,
  description,
  trigger,
  children,
  renderHeader,
  contentProps = {},
  onOpenChange,
  modal = true,
  ...props
}: DialogProps) => {
  const [localHandle] = useState(() => Primitive.createHandle());
  const localControl = useMemo(
    () => createControl(handle ?? localHandle),
    [handle, localHandle]
  );
  const selected = control ?? localControl;
  const [owner] = useState(() => ({}));
  useEffect(() => {
    if (owners.has(selected)) {
      throw new Error(
        "A DialogControl can only be bound to one Dialog at a time"
      );
    }
    owners.set(selected, owner);
    selected[controlKey].notify();
    return () => {
      if (owners.get(selected) === owner) {
        owners.delete(selected);
      }
      queueMicrotask(selected[controlKey].notify);
    };
  }, [owner, selected]);
  useEffect(() => {
    selected[controlKey].notify();
  }, [selected, props.open]);
  if (
    control &&
    (props.open !== undefined ||
      props.defaultOpen !== undefined ||
      handle !== undefined)
  ) {
    throw new Error(
      "Dialog control cannot be combined with open, defaultOpen, or handle"
    );
  }
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const {
    size = "md",
    showCloseButton = true,
    closeButtonLabel = "Close dialog",
    keepMounted = false,
    className,
    render,
    ...popupProps
  } = contentProps;
  const elements: DialogHeaderElements = {
    description:
      description === undefined || description === null ? null : (
        <Primitive.Description
          data-slot="dialog-description"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </Primitive.Description>
      ),
    title: (
      <Primitive.Title
        data-slot="dialog-title"
        className="text-base font-medium leading-snug text-foreground"
      >
        {title}
      </Primitive.Title>
    ),
  };
  return (
    <DialogContext.Provider value={selected}>
      <span ref={setContainer} style={{ display: "contents" }}>
        <Primitive.Root
          {...props}
          handle={selected[controlKey].handle}
          modal={modal}
          onOpenChange={(nextOpen, details) => {
            try {
              onOpenChange?.(nextOpen, details);
            } finally {
              queueMicrotask(selected[controlKey].notify);
            }
          }}
        >
          {trigger && (
            <Primitive.Trigger
              data-slot="dialog-trigger"
              className="cursor-pointer disabled:cursor-not-allowed data-disabled:cursor-not-allowed"
              render={trigger}
            />
          )}
          <Primitive.Portal container={container} keepMounted={keepMounted}>
            {modal === true && (
              <Primitive.Backdrop
                data-slot="dialog-overlay"
                className="fixed inset-0 z-50 min-h-dvh bg-black/55 opacity-0 data-ending-style:pointer-events-none supports-[-webkit-touch-callout:none]:absolute"
                render={(nativeProps, state) => (
                  <AnimatedElement
                    nativeProps={nativeProps}
                    state={state}
                    backdrop
                  />
                )}
              />
            )}
            <Primitive.Viewport
              data-slot="dialog-viewport"
              className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <Primitive.Popup
                data-slot="dialog-popup"
                data-size={size}
                data-close-button={showCloseButton ? "" : undefined}
                className={cn(
                  "group/dialog-popup pointer-events-auto relative flex max-h-[calc(100dvh-2rem)] w-full min-h-0 translate-y-3 scale-[0.94] flex-col overflow-hidden rounded-xl border border-border bg-background text-sm text-foreground opacity-0 shadow-xl outline-none sm:max-h-[calc(100dvh-3rem)] data-nested-dialog-open:brightness-95",
                  {
                    "max-w-2xl": size === "lg",
                    "max-w-4xl": size === "xl",
                    "max-w-lg": size === "md",
                    "max-w-sm": size === "sm",
                  },
                  className
                )}
                {...popupProps}
                render={(nativeProps, state) => (
                  <AnimatedElement
                    nativeProps={nativeProps}
                    state={state}
                    render={render}
                  />
                )}
              >
                <div
                  data-slot="dialog-header"
                  className="flex shrink-0 flex-col gap-2 p-4 pb-0 group-data-close-button/dialog-popup:pr-14"
                >
                  {renderHeader ? (
                    renderHeader(elements)
                  ) : (
                    <>
                      {elements.title}
                      {elements.description}
                    </>
                  )}
                </div>
                <DialogChildren>{children}</DialogChildren>
                {showCloseButton && (
                  <Primitive.Close
                    data-slot="dialog-close-button"
                    aria-label={closeButtonLabel}
                    className="absolute top-3 right-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
                  >
                    <XIcon aria-hidden="true" className="size-4" />
                  </Primitive.Close>
                )}
              </Primitive.Popup>
            </Primitive.Viewport>
          </Primitive.Portal>
        </Primitive.Root>
      </span>
    </DialogContext.Provider>
  );
};
const DialogBody = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="dialog-body"
    className={cn(
      "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4",
      className
    )}
    {...props}
  />
);
const DialogFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "mt-auto flex shrink-0 flex-col-reverse gap-2 p-4 pt-0 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);

export { Dialog, DialogBody, DialogFooter, useDialog, useDialogControl };
export type {
  DialogControl,
  DialogHeaderElements,
  DialogProps,
  DialogContentProps,
};
