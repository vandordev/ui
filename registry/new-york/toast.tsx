"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "cn";
import {
  AlertCircleIcon,
  CheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  LayersIcon,
  XIcon,
} from "lucide-react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  ComponentProps,
  CSSProperties,
  ReactNode,
  RefObject,
} from "react";

import { getToastDuration, getToastSurfacePath } from "./toast-utils";

const toastManager = ToastPrimitive.createToastManager<ToastData>();
let notificationRevision = 0;

export type ToastPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

export interface ToastData {
  actionLabel?: string;
  actionOnClick?: () => void;
  description?: ReactNode;
  duration?: number;
  /** Internal presentation metadata; Base UI remains the lifecycle owner. */
  durationOverride?: number;
  presented?: boolean;
  bodyOpened?: boolean;
  timerRevision?: number;
  type?: "action" | "error" | "info" | "loading" | "success" | "warning";
}

export interface ToastOptions extends Omit<
  ToastData,
  "presented" | "durationOverride" | "bodyOpened" | "timerRevision"
> {
  id?: string;
  priority?: "high" | "low";
  title?: ReactNode;
  onClose?: () => void;
  onRemove?: () => void;
}

export interface ToastProviderProps extends Omit<
  ComponentProps<typeof ToastPrimitive.Provider>,
  "limit" | "timeout" | "toastManager"
> {
  children: ReactNode;
}

export const ToastProvider = ({ children, ...props }: ToastProviderProps) => (
  <ToastPrimitive.Provider
    {...props}
    limit={Number.POSITIVE_INFINITY}
    timeout={3000}
    toastManager={toastManager}
  >
    <span data-vandor-overlay-host="" style={{ display: "contents" }}>
      {children}
    </span>
  </ToastPrimitive.Provider>
);

const normalizeOptions = (
  type: ToastData["type"],
  title: ReactNode,
  options: ToastOptions = {},
  queued = false
) => {
  notificationRevision += 1;
  const duration = getToastDuration({
    action: Boolean(options.actionLabel),
    description: options.description,
    duration: options.duration,
    type,
  });
  const data: ToastData = {
    ...options,
    duration,
    durationOverride: options.duration,
    presented: false,
    timerRevision: notificationRevision,
    type,
  };
  return {
    ...options,
    actionProps: options.actionLabel
      ? {
          children: options.actionLabel,
          className:
            "mt-3 inline-flex min-h-8 max-w-full cursor-pointer items-center rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white [overflow-wrap:anywhere] hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-black/5 dark:text-neutral-950 dark:hover:bg-black/10 dark:focus-visible:outline-neutral-950",
          onClick: options.actionOnClick,
        }
      : undefined,
    data,
    description: options.description,
    priority: options.priority ?? (type === "error" ? "high" : "low"),
    // All new records begin queued. The viewport starts the timer only when the
    // toast is readable at the front, so unseen notifications persist.
    timeout: queued ? 0 : duration,
    title: options.title ?? title,
    type,
  };
};

const addToast = (
  type: ToastData["type"],
  title: ReactNode,
  options?: ToastOptions
) => toastManager.add(normalizeOptions(type, title, options, true));

const updateToast = (
  id: string,
  type: ToastData["type"],
  title: ReactNode,
  options: ToastOptions = {}
) =>
  toastManager.update(id, (previous) => {
    const merged = {
      ...previous.data,
      ...options,
      description: Object.hasOwn(options, "description")
        ? options.description
        : previous.description,
      duration: options.duration ?? previous.data?.durationOverride,
      priority:
        options.priority ??
        (previous.data as ToastOptions | undefined)?.priority,
      title: title ?? previous.title,
    };
    const normalized = normalizeOptions(
      type ?? previous.data?.type ?? "info",
      title ?? previous.title,
      merged
    );
    return {
      ...normalized,
      data: {
        ...normalized.data,
        bodyOpened: previous.data?.bodyOpened,
        presented: previous.data?.presented ?? false,
      },
      timeout: previous.data?.presented ? normalized.data.duration : 0,
    };
  });

const resolveMessage = <Value,>(
  message: ReactNode | ((value: Value) => ReactNode),
  value: Value,
  fallback: ReactNode
) => {
  if (typeof message !== "function") {
    return message;
  }
  try {
    return message(value);
  } catch {
    return fallback;
  }
};

export const toast = {
  action: (title: ReactNode, options?: ToastOptions) =>
    addToast("action", title, options),
  close: (id?: string) => toastManager.close(id),
  dismiss: (id?: string) => toastManager.close(id),
  error: (title: ReactNode, options?: ToastOptions) =>
    addToast("error", title, options),
  info: (title: ReactNode, options?: ToastOptions) =>
    addToast("info", title, options),
  loading: (title: ReactNode, options?: ToastOptions) =>
    addToast("loading", title, options),
  promise: async <Value,>(
    promiseValue: Promise<Value>,
    messages: {
      error: ReactNode | ((error: unknown) => ReactNode);
      loading: ReactNode;
      success: ReactNode | ((value: Value) => ReactNode);
      errorOptions?: ToastOptions;
      loadingOptions?: ToastOptions;
      successOptions?: ToastOptions;
    }
  ): Promise<Value> => {
    const id = toast.loading(messages.loading, messages.loadingOptions);
    try {
      const value = await promiseValue;
      const title = resolveMessage(messages.success, value, "Done");
      updateToast(id, "success", title, messages.successOptions);
      return value;
    } catch (error) {
      const title = resolveMessage(
        messages.error,
        error,
        "Something went wrong. Please try again."
      );
      updateToast(
        id,
        "error",
        title ?? "Something went wrong. Please try again.",
        messages.errorOptions
      );
      throw error;
    }
  },
  success: (title: ReactNode, options?: ToastOptions) =>
    addToast("success", title, options),
  update: (id: string, options: ToastOptions) => {
    updateToast(id, options.type, options.title, options);
    return id;
  },
  warning: (title: ReactNode, options?: ToastOptions) =>
    addToast("warning", title, options),
};

const useOverlayContainer = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const update = () => {
      const modalHosts = [
        ...document.querySelectorAll<HTMLElement>(
          '[data-vandor-modal-toast-host][data-toast-host-active="true"]'
        ),
      ];
      let newestHost: HTMLElement | undefined;
      for (const host of modalHosts) {
        if (
          !newestHost ||
          Number(host.dataset.toastHostOrder) >=
            Number(newestHost.dataset.toastHostOrder)
        ) {
          newestHost = host;
        }
      }
      const overlayHost = document.querySelector<HTMLElement>(
        "[data-vandor-overlay-host]"
      );
      setContainer(newestHost ?? overlayHost ?? document.body);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributeFilter: ["data-toast-host-active", "data-toast-host-order"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return container;
};

const statusIcons = {
  action: InfoIcon,
  error: AlertCircleIcon,
  info: InfoIcon,
  loading: LoaderCircleIcon,
  success: CheckIcon,
  warning: TriangleAlertIcon,
} as const;

const ToastSwipeState = ({
  direction,
  onChange,
  shell,
  rootStyle,
  ending,
  queued,
}: {
  direction?: string;
  onChange: (direction?: string) => void;
  shell: RefObject<HTMLDivElement | null>;
  rootStyle?: CSSProperties;
  ending: boolean;
  queued: boolean;
}) => {
  useLayoutEffect(() => onChange(direction), [direction, onChange]);
  useLayoutEffect(() => {
    const element = shell.current;
    if (!element) {
      return;
    }
    const offsets = rootStyle as Record<string, string | undefined> | undefined;
    element.style.setProperty(
      "--toast-swipe-movement-x",
      offsets?.["--toast-swipe-movement-x"] ?? "0px"
    );
    element.style.setProperty(
      "--toast-swipe-movement-y",
      offsets?.["--toast-swipe-movement-y"] ?? "0px"
    );
    element.style.transform = queued ? "none" : (rootStyle?.transform ?? "");
    element.style.transition = queued ? "none" : (rootStyle?.transition ?? "");
    element.toggleAttribute("data-ending-style", ending && !queued);
    if (direction) {
      element.dataset.swipeDirection = direction;
    } else {
      delete element.dataset.swipeDirection;
    }
  }, [shell, rootStyle, ending, queued, direction]);
  return null;
};

/** Visual clock only. Base UI owns dismissal and pause/resume of its timer. */
const ToastProgress = ({
  duration,
  paused,
  revision,
  position,
  opened,
  size,
}: {
  duration: number;
  paused: boolean;
  revision: string;
  position: ToastPosition;
  opened: boolean;
  size: { width: number; pill: number; start: number; head: number };
}) => {
  const line = useRef<HTMLDivElement>(null);
  const clock = useRef({ elapsed: 0, last: 0 });
  const [windowPaused, setWindowPaused] = useState(false);
  useEffect(() => {
    const blur = () => setWindowPaused(true);
    const focus = () => setWindowPaused(false);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    };
  }, []);
  useLayoutEffect(() => {
    clock.current.elapsed = 0;
    if (line.current) {
      line.current.style.transform = "scaleX(1)";
    }
  }, [revision, duration]);
  useEffect(() => {
    if (!duration || paused || windowPaused) {
      return;
    }
    let frame = 0;
    clock.current.last = performance.now();
    const tick = (now: number) => {
      clock.current.elapsed += now - clock.current.last;
      clock.current.last = now;
      if (line.current) {
        line.current.style.transform = `scaleX(${Math.max(0, 1 - clock.current.elapsed / duration)})`;
      }
      if (clock.current.elapsed < duration) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, paused, windowPaused, revision]);
  if (!duration) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      data-toast-progress=""
      data-paused={paused || windowPaused}
      data-duration={duration}
      className="pointer-events-none absolute bottom-1 h-0.5 overflow-hidden rounded-full bg-white/10 dark:bg-black/10"
      style={{
        bottom: opened && position.startsWith("bottom") ? size.head : 4,
        left: opened ? 20 : size.start + 20,
        width: Math.max(0, (opened ? size.width : size.pill) - 40),
      }}
    >
      <div
        ref={line}
        className="size-full rounded-full bg-neutral-400 dark:bg-neutral-500"
        style={{ transformOrigin: position.split("-")[1] }}
      />
    </div>
  );
};

// Presentation branches cover independent content, measurement, and motion states.
// eslint-disable-next-line complexity
const ToastCard = ({
  toast: item,
  position,
  queuedCount,
  entry,
}: {
  toast: ToastPrimitive.Root.ToastObject<ToastData>;
  position: ToastPosition;
  queuedCount: number;
  entry: "first" | "replacement";
}) => {
  const data = item.data ?? {};
  const Icon = statusIcons[data.type ?? "info"];
  const reduceMotion = useReducedMotion();
  const hasBody = Boolean(item.description || data.actionLabel);
  const manager = ToastPrimitive.useToastManager<ToastData>();
  const [opened, setOpened] = useState(Boolean(data.bodyOpened));
  const header = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({
    head: 48,
    height: 48,
    pill: 260,
    start: 0,
    width: 360,
  });
  const isTop = position.startsWith("top");
  const isCenter = position.endsWith("center");
  const centerInset = queuedCount > 0 ? 96 : 0;
  const swipeShell = useRef<HTMLDivElement>(null);
  const [swipeDirection, setSwipeDirection] = useState<string>();
  const previousId = useRef(item.id);
  const previousItem = useRef(item);
  const [outgoing, setOutgoing] =
    useState<ToastPrimitive.Root.ToastObject<ToastData>>();
  const [arrival, setArrival] = useState(false);
  const badgeMotion = useAnimationControls();
  useEffect(() => {
    if (arrival && !reduceMotion) {
      void badgeMotion.start({
        scale: [1, 1.08, 1],
        transition: { duration: 0.24 },
      });
    } else {
      badgeMotion.set({ scale: 1 });
    }
  }, [arrival, item.id, badgeMotion, reduceMotion]);
  useLayoutEffect(() => {
    if (previousId.current !== item.id) {
      setOutgoing(previousItem.current);
      setArrival(
        (item.data?.timerRevision ?? 0) >
          (previousItem.current.data?.timerRevision ?? 0)
      );
      setOpened(Boolean(data.bodyOpened || hasBody));
      previousId.current = item.id;
    }
    previousItem.current = item;
  }, [item, queuedCount, hasBody, data.bodyOpened]);
  useEffect(() => {
    if (!outgoing) {
      return;
    }
    const timer = window.setTimeout(
      () => setOutgoing(undefined),
      reduceMotion ? 80 : 180
    );
    return () => window.clearTimeout(timer);
  }, [outgoing, reduceMotion]);
  useLayoutEffect(() => {
    const measure = () => {
      const width = header.current?.parentElement?.clientWidth || 360;
      const pill = Math.min(width, header.current?.offsetWidth || 260);
      const head = header.current?.offsetHeight || 48;
      const start = header.current?.offsetLeft || 0;
      const height =
        head +
        (opened && hasBody ? -4 + (body.current?.offsetHeight || 24) : 0);
      setSize((previous) =>
        previous.width === width &&
        previous.pill === pill &&
        previous.height === height &&
        previous.head === head &&
        previous.start === start
          ? previous
          : { head, height, pill, start, width }
      );
    };
    measure();
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    if (header.current) {
      observer.observe(header.current);
    }
    if (header.current?.parentElement) {
      observer.observe(header.current.parentElement);
    }
    if (body.current) {
      observer.observe(body.current);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    opened,
    hasBody,
    position,
    queuedCount,
    item.id,
    item.title,
    item.description,
    data.actionLabel,
  ]);
  useEffect(() => {
    if (!hasBody || opened || item.transitionStatus === "ending") {
      return;
    }
    if (reduceMotion || entry !== "first") {
      setOpened(true);
      return;
    }
    // Let the pill/title entrance establish the message before opening details.
    const timer = window.setTimeout(() => setOpened(true), 220);
    return () => window.clearTimeout(timer);
  }, [hasBody, opened, reduceMotion, entry, item.id, item.transitionStatus]);
  useEffect(() => {
    if (opened && !data.bodyOpened && item.transitionStatus !== "ending") {
      manager.update(item.id, (previous) => ({
        data: { ...previous.data, bodyOpened: true },
      }));
    }
  }, [opened, data.bodyOpened, item.id, item.transitionStatus, manager]);
  const bodyVisible = hasBody && opened;
  const path = getToastSurfacePath({ ...size, opened: bodyVisible });
  const morphDuration = entry === "first" ? 0.32 : 0.2;
  const finalExitY = isTop ? -14 : 14;
  return (
    <div
      ref={swipeShell}
      data-toast-swipe-shell=""
      className="relative transform-[translate3d(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px),0)] transition-[opacity,transform] duration-260 ease-out data-ending-style:opacity-0 data-[swipe-direction=left]:data-ending-style:transform-[translate3d(calc(var(--toast-swipe-movement-x,0px)-100vw),var(--toast-swipe-movement-y,0px),0)] data-[swipe-direction=right]:data-ending-style:transform-[translate3d(calc(var(--toast-swipe-movement-x,0px)+100vw),var(--toast-swipe-movement-y,0px),0)] data-[swipe-direction=up]:data-ending-style:transform-[translate3d(var(--toast-swipe-movement-x,0px),calc(var(--toast-swipe-movement-y,0px)-100dvh),0)] data-[swipe-direction=down]:data-ending-style:transform-[translate3d(var(--toast-swipe-movement-x,0px),calc(var(--toast-swipe-movement-y,0px)+100dvh),0)] motion-reduce:transition-none"
    >
      <motion.div
        data-toast-shell=""
        className="relative"
        initial={
          reduceMotion
            ? false
            : { opacity: 0, scale: 0.96, y: isTop ? -16 : 16 }
        }
        animate={
          item.transitionStatus === "ending" &&
          queuedCount === 0 &&
          !swipeDirection
            ? {
                opacity: 0,
                scale: reduceMotion ? 1 : 0.94,
                x: 0,
                y: reduceMotion ? 0 : finalExitY,
              }
            : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.26,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <svg
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 h-[1024px] w-full overflow-visible text-neutral-950 drop-shadow-md dark:text-neutral-50",
            isTop ? "top-0" : "bottom-0"
          )}
          viewBox={`0 0 ${size.width} 1024`}
          preserveAspectRatio="none"
        >
          <motion.path
            initial={false}
            d={path}
            animate={{ d: path }}
            transition={{
              duration: reduceMotion ? 0 : morphDuration,
              ease: [0.22, 1, 0.36, 1],
            }}
            fill="currentColor"
            transform={isTop ? undefined : "translate(0 1024) scale(1 -1)"}
          />
        </svg>
        {outgoing && (
          <motion.div
            key={`outgoing-${outgoing.id}`}
            aria-hidden="true"
            inert
            className="pointer-events-none absolute inset-0 z-10 text-neutral-50 dark:text-neutral-950"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
          >
            <div
              className="absolute text-sm leading-snug font-medium"
              style={{
                bottom: isTop ? undefined : 14,
                left: size.start + (position.endsWith("left") ? 86 : 50),
                right: position.endsWith("left") ? 100 : 48,
                top: isTop ? 14 : undefined,
              }}
            >
              {outgoing.title}
            </div>
            {outgoing.description && (
              <div
                className="absolute inset-x-4 text-sm leading-relaxed text-neutral-300 dark:text-neutral-600"
                style={{ top: isTop ? size.head + 12 : 16 }}
              >
                {outgoing.description}
              </div>
            )}
          </motion.div>
        )}
        <div
          data-toast-queue-controls=""
          style={
            isCenter
              ? {
                  left: `calc(50% + ${centerInset / 2 - size.pill / 2 - 8}px)`,
                  transform: "translateX(-100%)",
                }
              : {
                  left: position.endsWith("left")
                    ? size.start + size.pill + 8
                    : size.start - 8,
                  transform: position.endsWith("left")
                    ? "none"
                    : "translateX(-100%)",
                }
          }
          className={cn(
            "absolute z-10 flex h-12 items-center gap-1.5",
            isTop ? "top-0" : "bottom-0"
          )}
        >
          <motion.div
            initial={{ opacity: queuedCount > 0 ? 1 : 0 }}
            animate={{ opacity: queuedCount > 0 ? 1 : 0 }}
            className="flex items-center gap-1.5"
            inert={queuedCount === 0}
          >
            <button
              type="button"
              aria-label="Dismiss all notifications"
              onClick={() => toast.dismiss()}
              className="pointer-events-auto flex size-8 items-center justify-center rounded-full bg-neutral-950 text-neutral-300 dark:bg-neutral-50 dark:text-neutral-600 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
            <motion.span
              data-toast-queue=""
              data-count={queuedCount}
              role="img"
              aria-label={`${queuedCount} queued notifications`}
              animate={badgeMotion}
              transition={{ duration: 0.24 }}
              className="flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-neutral-950 px-2 text-xs text-neutral-300 tabular-nums dark:bg-neutral-50 dark:text-neutral-600"
            >
              <LayersIcon aria-hidden="true" className="size-4" />
              <span>{queuedCount}</span>
            </motion.span>
          </motion.div>
        </div>
        <button
          style={
            isCenter
              ? {
                  left: `calc(50% + ${centerInset / 2 + size.pill / 2 - 40}px)`,
                }
              : undefined
          }
          type="button"
          aria-label="Dismiss notification"
          onClick={() => toast.dismiss(item.id)}
          className={cn(
            "pointer-events-auto absolute z-20 flex size-7 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white dark:text-neutral-500 dark:hover:bg-black/5 dark:hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-ring",
            isTop ? "top-2.5" : "bottom-2.5",
            !isCenter && (position.endsWith("left") ? "left-3" : "right-3")
          )}
        >
          <XIcon aria-hidden="true" className="size-4" />
        </button>
        <ToastPrimitive.Root
          key={item.id}
          toast={item}
          swipeDirection={["up", "down", "left", "right"]}
          data-toast-id={item.id}
          data-toast-placement={position}
          data-toast-entry={entry}
          data-toast-exit={queuedCount > 0 ? "advance" : "last"}
          render={(props, state) => (
            <div {...props} style={{ ...props.style, transform: "none" }}>
              {props.children}
              <ToastSwipeState
                direction={state.swipeDirection}
                onChange={setSwipeDirection}
                shell={swipeShell}
                rootStyle={props.style}
                ending={state.transitionStatus === "ending"}
                queued={queuedCount > 0}
              />
              <ToastProgress
                duration={data.duration ?? 0}
                paused={
                  state.expanded ||
                  state.swiping ||
                  state.transitionStatus === "ending"
                }
                revision={`${item.id}:${data.timerRevision ?? 0}`}
                position={position}
                opened={bodyVisible}
                size={size}
              />
            </div>
          )}
          className={cn(
            "group/toast pointer-events-auto relative w-full touch-pan-y outline-none transition-opacity duration-260 ease-out focus-visible:rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-ending-style:opacity-0 motion-reduce:transition-none",
            isTop ? "origin-top" : "origin-bottom",
            queuedCount > 0
              ? "transition-none data-ending-style:opacity-100"
              : "duration-260"
          )}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            initial={
              reduceMotion || entry === "first"
                ? false
                : { opacity: 0, y: arrival ? 4 : 0 }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: entry === "first" ? 0.32 : 0.18,
                    ease: [0.22, 1, 0.36, 1],
                  }
            }
            className={cn(
              "relative flex flex-col text-neutral-50 dark:text-neutral-950",
              isTop ? "origin-top" : "origin-bottom",
              !isTop && "flex-col-reverse"
            )}
            data-type={data.type}
          >
            <div
              data-toast-header-row=""
              style={isCenter ? { paddingLeft: centerInset } : undefined}
              className={cn(
                "relative flex items-center gap-2",
                position.endsWith("right") && "justify-end",
                isCenter && "justify-center",
                position.endsWith("left") && "flex-row-reverse justify-end"
              )}
            >
              <div
                ref={header}
                className={cn(
                  "relative flex min-h-12 w-fit min-w-0 items-center gap-2.5 py-2.5",
                  isCenter ? "max-w-full" : "max-w-[calc(100%-6rem)]",
                  position.endsWith("left") ? "pr-3 pl-12" : "pr-12 pl-3"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-neutral-100 dark:bg-black/5 dark:text-neutral-900",
                    data.type === "success" &&
                      "text-emerald-400 dark:text-emerald-700",
                    data.type === "error" && "text-red-300 dark:text-red-700",
                    data.type === "warning" &&
                      "text-amber-300 dark:text-amber-700",
                    data.type === "info" && "text-sky-300 dark:text-sky-700"
                  )}
                >
                  <motion.span
                    key={data.type}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduceMotion ? 0 : 0.15 }}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        data.type === "loading" &&
                          "animate-spin motion-reduce:animate-none"
                      )}
                    />
                  </motion.span>
                </span>
                <div className="min-w-0 flex-1">
                  <ToastPrimitive.Title className="relative text-sm leading-snug font-medium [overflow-wrap:anywhere]">
                    <motion.span
                      key={`${item.id}:${data.timerRevision ?? 0}`}
                      className="block"
                      initial={{
                        opacity: 0,
                        y: reduceMotion || !arrival ? 0 : 4,
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
                    >
                      {item.title}
                    </motion.span>
                  </ToastPrimitive.Title>
                </div>
              </div>
            </div>
            {bodyVisible && (
              <motion.div
                ref={body}
                animate={{ opacity: 1, y: 0 }}
                initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: entry === "first" ? 0.3 : 0.18,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
                className={cn(
                  "relative max-h-[min(60dvh,30rem)] overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  isTop ? "-mt-1" : "-mb-1"
                )}
              >
                <div className="px-4 py-4 [overflow-wrap:anywhere]">
                  {item.description && (
                    <ToastPrimitive.Description className="text-sm leading-relaxed text-neutral-300 dark:text-neutral-600" />
                  )}
                  {data.actionLabel && <ToastPrimitive.Action />}
                </div>
              </motion.div>
            )}
          </motion.div>
        </ToastPrimitive.Root>
      </motion.div>
    </div>
  );
};

export interface ToasterProps {
  position?: ToastPosition;
}

export const Toaster = ({ position }: ToasterProps) => {
  const resolvedPosition = position ?? "top-right";
  const manager = ToastPrimitive.useToastManager<ToastData>();
  const overlayContainer = useOverlayContainer();
  const [mobile, setMobile] = useState(false);
  const [displayedId, setDisplayedId] = useState<string>();
  const [entry, setEntry] = useState<"first" | "replacement">("first");
  const hasPresented = useRef(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const visualPosition = position ?? (mobile ? "top-center" : "top-right");
  const activeToasts = manager.toasts.filter(
    (item) => item.transitionStatus !== "ending"
  );
  const displayed = manager.toasts.find((item) => item.id === displayedId);
  useEffect(() => {
    if (manager.toasts.length === 0) {
      hasPresented.current = false;
    }
    if (displayed?.transitionStatus !== "ending" || activeToasts.length > 0) {
      const nextId = activeToasts[0]?.id;
      if (nextId !== displayedId) {
        setEntry(hasPresented.current ? "replacement" : "first");
        setDisplayedId(nextId);
        if (nextId) {
          hasPresented.current = true;
        }
      }
    }
  }, [displayed, activeToasts, displayedId, manager.toasts.length]);
  // Unrendered queued records still need a Root to complete Base UI removal.
  // Drain closed records in bounded batches, rather than mounting the whole queue.
  const endingToasts = manager.toasts
    .filter((item) => item.transitionStatus === "ending")
    .slice(0, 20);
  useEffect(() => {
    for (const item of activeToasts) {
      const presented = item.id === displayedId;
      const timeout = presented ? (item.data?.duration ?? 3000) : 0;
      if (item.timeout === timeout && item.data?.presented === presented) {
        continue;
      }
      manager.update(item.id, { data: { ...item.data, presented }, timeout });
    }
  }, [manager, activeToasts, displayedId]);
  const isTop = resolvedPosition.startsWith("top");
  const horizontalPlacement = {
    "bottom-center": "left-1/2 -translate-x-1/2",
    "bottom-left": "left-[max(0.75rem,env(safe-area-inset-left))]",
    "bottom-right": "right-[max(0.75rem,env(safe-area-inset-right))]",
    "top-center": "left-1/2 -translate-x-1/2",
    "top-left": "left-[max(0.75rem,env(safe-area-inset-left))]",
    "top-right": "right-[max(0.75rem,env(safe-area-inset-right))]",
  };
  return (
    <ToastPrimitive.Portal
      container={overlayContainer}
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      <ToastPrimitive.Viewport
        aria-label="Notifications"
        data-position={resolvedPosition}
        className={cn(
          "pointer-events-none fixed z-[70] w-[min(23rem,calc(100vw-2rem))] overflow-visible outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring",
          isTop
            ? "top-[max(0.75rem,env(safe-area-inset-top))]"
            : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
          horizontalPlacement[resolvedPosition],
          position === undefined &&
            "max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2"
        )}
      >
        {displayed && (
          <ToastCard
            toast={displayed}
            position={visualPosition}
            entry={entry}
            queuedCount={
              activeToasts.filter((item) => item.id !== displayed.id).length
            }
          />
        )}
        <div className="hidden" aria-hidden="true">
          {endingToasts
            .filter((item) => item.id !== displayedId)
            .map((item) => (
              <ToastPrimitive.Root key={item.id} toast={item} />
            ))}
        </div>
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
};
