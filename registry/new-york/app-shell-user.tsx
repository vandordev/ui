"use client";

import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "./button";
import { Dropdown } from "./dropdown";
import type { DropdownEntry } from "./dropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface AppShellUser {
  name: string;
  description?: string;
  avatar?: ReactNode;
  items: readonly DropdownEntry[];
  pending?: boolean;
  menuLabel?: string;
}

export const AppShellUserFooter = ({
  user,
  collapsed,
  closeNavigation,
}: {
  user: AppShellUser;
  collapsed: boolean;
  closeNavigation: () => void;
}) => {
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const trigger = (
    <Button
      variant="ghost"
      className={cn(
        "h-auto min-h-12 w-full justify-start gap-3 px-2",
        collapsed && "justify-center px-0"
      )}
      aria-label={user.menuLabel ?? `${user.name} account menu`}
      aria-busy={user.pending || undefined}
      disabled={user.pending}
    >
      {user.avatar ?? (
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
        >
          {initials}
        </span>
      )}
      {!collapsed && (
        <span className="grid min-w-0 flex-1 text-left">
          <span className="truncate text-sm font-medium">{user.name}</span>
          {user.description && (
            <span className="truncate text-xs text-muted-foreground">
              {user.description}
            </span>
          )}
        </span>
      )}
      {!collapsed && (
        <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0" />
      )}
    </Button>
  );
  const menu = (
    <Dropdown
      trigger={collapsed ? <TooltipTrigger render={trigger} /> : trigger}
      items={user.items}
      onSelectionComplete={closeNavigation}
      contentProps={{ align: collapsed ? "center" : "start", side: "top" }}
    />
  );
  return (
    <div className="mt-auto shrink-0 border-t border-border p-2">
      {collapsed ? (
        <Tooltip>
          {menu}
          <TooltipContent side="right">{user.name}</TooltipContent>
        </Tooltip>
      ) : (
        menu
      )}
    </div>
  );
};
