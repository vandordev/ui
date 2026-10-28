"use client";

// Adapted from Universe's AppShell, originally inspired by 7ovr's
// app-shell-3 icon-rail layout (free blocks: MIT-0).
// https://7ovr.com/r/app-shell-3.json
// Application data, routing and resource controls remain consumer-owned.
import { cn } from "cn";
import {
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { AppShellUserFooter } from "./app-shell-user";
import type { AppShellUser } from "./app-shell-user";
import { Button } from "./button";
import { Drawer, DrawerBody } from "./drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export type { AppShellUser } from "./app-shell-user";
export interface AppShellNavigationState {
  collapsed: boolean;
  closeNavigation: () => void;
}

export interface AppShellNavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  /** Separates this item from the following navigation. */
  dividerAfter?: boolean;
  /** Replaces the standard item. The caller owns semantics and disabled state. */
  renderControl?: (state: AppShellNavigationState) => ReactElement;
}

export interface AppShellProps {
  brand: { name: string; icon?: ReactNode; href?: string };
  navigation: readonly AppShellNavigationItem[];
  children: ReactNode;
  header?: ReactNode;
  showHeader?: boolean;
  actions?: ReactNode;
  sidebarHeader?: ReactNode | ((state: AppShellNavigationState) => ReactNode);
  sidebarFooter?: ReactNode | ((state: AppShellNavigationState) => ReactNode);
  user?: AppShellUser;
  /** Enables the search button and Cmd/Ctrl+K listener only when supplied. */
  onSearch?: () => void;
  searchLabel?: string;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  navigationLabel?: string;
  labels?: {
    sidebar?: string;
    skipToContent?: string;
    openNavigation?: string;
    closeNavigation?: string;
    expandSidebar?: string;
    collapseSidebar?: string;
  };
  /** Change key only for a new panel, not active items or same-level resources. */
  navigationContext?: { key: string; depth: number };
  className?: string;
  contentClassName?: string;
}

const NavigationPanel = ({
  children,
  direction,
  reduceMotion,
}: {
  children: ReactNode;
  direction: number;
  reduceMotion: boolean;
}) => {
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Never leave keyboard focus in an outgoing, inert navigation panel.
    if (!present && ref.current?.contains(document.activeElement)) {
      ref.current.parentElement
        ?.querySelector<HTMLElement>("[data-navigation-panel]:not([inert])")
        ?.focus();
    }
  }, [present]);
  return (
    <motion.div
      ref={ref}
      data-navigation-panel=""
      data-navigation-direction={direction}
      tabIndex={-1}
      inert={!present}
      aria-hidden={!present || undefined}
      custom={direction}
      variants={{
        enter: (travel: number) => ({
          opacity: reduceMotion ? 1 : 0,
          x: reduceMotion ? 0 : travel * 28,
        }),
        exit: (travel: number) => ({
          opacity: reduceMotion ? 1 : 0,
          x: reduceMotion ? 0 : travel * -28,
        }),
        visible: { opacity: 1, x: 0 },
      }}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={{
        duration: reduceMotion ? 0 : 0.22,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="col-start-1 row-start-1 min-w-0 self-start outline-none"
    >
      {children}
    </motion.div>
  );
};

const useNavigationDirection = (
  navigationContext: AppShellProps["navigationContext"]
) => {
  const [previousContext, setPreviousContext] = useState(navigationContext);
  const [direction, setDirection] = useState(1);
  if (navigationContext?.key !== previousContext?.key) {
    setPreviousContext(navigationContext);
    setDirection(
      (navigationContext?.depth ?? 0) >= (previousContext?.depth ?? 0) ? 1 : -1
    );
  }
  return direction;
};

const useShellTransitions = () => {
  const reduceMotion = useReducedMotion();
  return {
    labelTransition: {
      duration: reduceMotion ? 0 : 0.14,
      ease: "easeOut" as const,
    },
    reduceMotion,
    sidebarTransition: {
      duration: reduceMotion ? 0 : 0.22,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };
};

export const AppShell = ({
  brand,
  navigation,
  children,
  header,
  showHeader = true,
  actions,
  sidebarHeader,
  sidebarFooter,
  user,
  onSearch,
  searchLabel = "Search workspace",
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  navigationLabel = "Main navigation",
  labels,
  navigationContext,
  className,
  contentClassName,
}: AppShellProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const { reduceMotion, sidebarTransition, labelTransition } =
    useShellTransitions();
  const navigationDirection = useNavigationDirection(navigationContext);
  // Animate real width as in Universe: FLIP scaling distorts nested scroll areas.
  const contentId = useId();
  const sidebarId = useId();
  const closeNavigation = () => setMobileOpen(false);

  useEffect(() => {
    if (!onSearch) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSearch]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (media.matches) {
        setMobileOpen(false);
      }
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  const renderNavigation = (compact: boolean, mobile = false) => (
    <nav aria-label={navigationLabel} className="flex flex-col gap-1 p-2">
      {navigation.map((item) => {
        const label = (
          <>
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center"
            >
              {item.icon ?? item.label.slice(0, 1)}
            </span>
            <motion.span
              initial={false}
              animate={{ opacity: compact ? 0 : 1 }}
              transition={labelTransition}
              aria-hidden={compact || undefined}
              className="min-w-0 truncate"
            >
              {item.label}
            </motion.span>
          </>
        );
        const props = {
          "aria-current": item.active ? ("page" as const) : undefined,
          "aria-label": item.label,
          className: cn(
            "h-10 w-full justify-start gap-3 overflow-hidden px-3",
            item.active && "bg-background text-foreground"
          ),
          onClick: () => {
            item.onClick?.();
            if (mobile) {
              closeNavigation();
            }
          },
        };
        const control =
          item.href && !item.disabled ? (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<a href={item.href} aria-label={item.label} />}
              {...props}
            >
              {label}
            </Button>
          ) : (
            <Button variant="ghost" disabled={item.disabled} {...props}>
              {label}
            </Button>
          );
        return (
          <div key={item.id}>
            {item.renderControl ? (
              <Tooltip>
                <TooltipTrigger
                  disabled={!compact || mobile}
                  render={item.renderControl({
                    closeNavigation,
                    collapsed: compact,
                  })}
                />
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  disabled={!compact || mobile}
                  render={control}
                />
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )}
            {item.dividerAfter && (
              <div
                data-navigation-separator={item.id}
                role="separator"
                className="my-2 border-b border-border"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
  const renderContextNavigation = (compact: boolean, mobile = false) =>
    navigationContext ? (
      <div className="grid min-w-0 overflow-x-clip">
        <AnimatePresence initial={false} custom={navigationDirection}>
          <NavigationPanel
            key={navigationContext.key}
            direction={navigationDirection}
            reduceMotion={!!reduceMotion}
          >
            {renderNavigation(compact, mobile)}
          </NavigationPanel>
        </AnimatePresence>
      </div>
    ) : (
      renderNavigation(compact, mobile)
    );

  const renderBrand = (compact: boolean) => {
    const content = (
      <>
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center font-semibold"
        >
          {brand.icon ?? brand.name.slice(0, 1)}
        </span>
        <motion.span
          initial={false}
          animate={{ opacity: compact ? 0 : 1 }}
          transition={labelTransition}
          aria-hidden={compact || undefined}
          className={cn("min-w-0 truncate font-semibold", compact && "sr-only")}
        >
          {brand.name}
        </motion.span>
        {compact && <span className="sr-only">{brand.name}</span>}
      </>
    );
    const styles = cn(
      "flex h-full min-w-0 flex-1 items-center gap-3 overflow-hidden px-3",
      compact && "h-10 w-full flex-none justify-center gap-0 px-0"
    );
    return brand.href ? (
      <a
        href={brand.href}
        aria-label={brand.name}
        className={cn(
          styles,
          "focus-visible:outline-2 focus-visible:outline-ring"
        )}
      >
        {content}
      </a>
    ) : (
      <div className={styles}>{content}</div>
    );
  };
  const renderSidebarHeader = (compact: boolean) =>
    sidebarHeader ? (
      <div className="flex min-w-0 flex-1 items-center">
        {typeof sidebarHeader === "function"
          ? sidebarHeader({ closeNavigation, collapsed: compact })
          : sidebarHeader}
      </div>
    ) : (
      renderBrand(compact)
    );
  const renderFooter = (compact: boolean) => {
    if (sidebarFooter === undefined) {
      return user ? (
        <AppShellUserFooter
          user={user}
          collapsed={compact}
          closeNavigation={closeNavigation}
        />
      ) : null;
    }
    return (
      <div className="mt-auto shrink-0 border-t border-border p-2">
        {typeof sidebarFooter === "function"
          ? sidebarFooter({ closeNavigation, collapsed: compact })
          : sidebarFooter}
      </div>
    );
  };

  const renderCollapseControl = (rail = false) => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden shrink-0 md:inline-flex",
              rail && "group relative"
            )}
            aria-label={
              collapsed
                ? (labels?.expandSidebar ?? "Expand sidebar")
                : (labels?.collapseSidebar ?? "Collapse sidebar")
            }
            aria-expanded={!collapsed}
            aria-controls={sidebarId}
            onClick={() => {
              if (controlledCollapsed === undefined) {
                setInternalCollapsed(!collapsed);
              }
              onCollapsedChange?.(!collapsed);
            }}
          >
            {rail && collapsed && (
              <span
                aria-hidden="true"
                className="absolute flex size-6 items-center justify-center font-semibold group-hover:opacity-0 group-focus-visible:opacity-0"
              >
                {brand.icon ?? brand.name.slice(0, 1)}
              </span>
            )}
            <span
              className={cn(
                "flex",
                rail &&
                  collapsed &&
                  "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              )}
            >
              {collapsed ? (
                <PanelLeftOpenIcon aria-hidden="true" />
              ) : (
                <PanelLeftCloseIcon aria-hidden="true" />
              )}
            </span>
          </Button>
        }
      />
      <TooltipContent side="right">
        {collapsed
          ? (labels?.expandSidebar ?? "Expand sidebar")
          : (labels?.collapseSidebar ?? "Collapse sidebar")}
      </TooltipContent>
    </Tooltip>
  );
  const renderMobileNavigation = () => (
    <Drawer
      title={sidebarHeader ? navigationLabel : brand.name}
      open={mobileOpen}
      onOpenChange={setMobileOpen}
      swipeDirection={showHeader ? "left" : "right"}
      contentProps={{
        closeButtonLabel: labels?.closeNavigation ?? "Close navigation",
      }}
      showSwipeHandle={false}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "md:hidden",
            !showHeader &&
              "fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 bg-background ring-1 ring-border"
          )}
          aria-label={labels?.openNavigation ?? "Open navigation"}
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      }
    >
      <DrawerBody className="flex min-h-0 flex-1 flex-col p-0">
        {sidebarHeader && (
          <div className="flex h-16 shrink-0 items-center border-b border-border p-2">
            {renderSidebarHeader(false)}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {renderContextNavigation(false, true)}
        </div>
        {renderFooter(false)}
      </DrawerBody>
    </Drawer>
  );

  const renderDesktopIdentity = () => (
    <div
      data-slot="app-shell-sidebar-header"
      className={cn(
        "flex h-16 shrink-0 items-center gap-1 border-b border-border px-2",
        collapsed && "flex-col justify-center gap-0",
        collapsed && (sidebarHeader || brand.href) && "h-auto gap-1 py-2"
      )}
    >
      {(!collapsed || sidebarHeader || brand.href) &&
        renderSidebarHeader(collapsed)}
      {renderCollapseControl(!sidebarHeader && !brand.href)}
    </div>
  );

  return (
    <TooltipProvider>
      <div
        data-slot="app-shell"
        data-collapsed={collapsed}
        className={cn(
          "flex min-h-svh overflow-x-clip bg-background text-foreground",
          className
        )}
      >
        <a
          href={`#${contentId}`}
          className="sr-only z-50 rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {labels?.skipToContent ?? "Skip to content"}
        </a>
        <motion.aside
          id={sidebarId}
          data-slot="app-shell-sidebar"
          aria-label={labels?.sidebar ?? "Sidebar"}
          initial={false}
          animate={{ width: collapsed ? "4rem" : "15rem" }}
          transition={sidebarTransition}
          className="sticky top-0 hidden h-svh shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground md:flex"
        >
          {renderDesktopIdentity()}
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            {renderContextNavigation(collapsed)}
          </div>
          {renderFooter(collapsed)}
        </motion.aside>
        <div className="flex min-w-0 flex-1 flex-col">
          {!showHeader && (
            <>
              <div
                data-slot="app-shell-brand-tab"
                className="fixed left-1/2 top-0 z-20 max-w-[calc(100%-8rem)] -translate-x-1/2 rounded-b-xl bg-sidebar px-5 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] text-sidebar-foreground before:absolute before:-left-3 before:top-0 before:size-3 before:rounded-tr-xl before:shadow-[4px_-4px_0_4px_var(--sidebar)] after:absolute after:-right-3 after:top-0 after:size-3 after:rounded-tl-xl after:shadow-[-4px_-4px_0_4px_var(--sidebar)] md:hidden"
              >
                <span className="block truncate text-sm font-semibold">
                  {brand.name}
                </span>
              </div>
              {renderMobileNavigation()}
            </>
          )}
          {showHeader && (
            <header
              data-slot="app-shell-header"
              className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6"
            >
              {renderMobileNavigation()}
              {onSearch && (
                <Button
                  variant="outline"
                  onClick={onSearch}
                  className="min-w-0 flex-1 justify-start text-muted-foreground sm:max-w-sm"
                >
                  <SearchIcon aria-hidden="true" />
                  <span className="truncate">{searchLabel}</span>
                  <kbd className="ml-auto hidden text-xs sm:inline">
                    ⌘ / Ctrl K
                  </kbd>
                </Button>
              )}
              {header}
              {actions && (
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {actions}
                </div>
              )}
            </header>
          )}
          <main
            id={contentId}
            data-slot="app-shell-main"
            tabIndex={-1}
            className={cn(
              "min-w-0 flex-1 outline-none",
              !showHeader &&
                "pt-[calc(4.5rem+env(safe-area-inset-top))] md:pt-0",
              contentClassName
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};
