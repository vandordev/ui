"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { SearchIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommandSearchItem } from "@/lib/command-search";
import { matchesCommandSearch } from "@/lib/command-search";
import { cn } from "@/lib/utils";

type CommandProps<Item> = Omit<
  Autocomplete.Root.Props<Item>,
  "items" | "filteredItems" | "children"
> & {
  items: { label: string; items: Item[] }[];
  children?: ReactNode;
  className?: string;
};

const Command = <Item extends CommandSearchItem>({
  className,
  children,
  ...props
}: CommandProps<Item>) => (
  <Autocomplete.Root
    inline
    open
    autoHighlight="always"
    keepHighlight
    filter={matchesCommandSearch}
    itemToStringValue={(item) => item.value}
    {...props}
  >
    <div
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex w-full flex-col overflow-hidden rounded-md",
        className
      )}
    >
      {children}
    </div>
  </Autocomplete.Root>
);

const CommandDialog = <Item extends CommandSearchItem>({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  commandProps,
  ...props
}: Omit<ComponentProps<typeof Dialog>, "children"> & {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  commandProps: CommandProps<Item>;
}) => (
  <Dialog {...props}>
    <DialogContent
      className={cn("overflow-hidden p-0", className)}
      showCloseButton={showCloseButton}
    >
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <Command {...commandProps}>{children}</Command>
    </DialogContent>
  </Dialog>
);

const CommandInput = ({
  className,
  ...props
}: ComponentProps<typeof Autocomplete.Input>) => (
  <div
    data-slot="command-input-wrapper"
    className="flex h-9 items-center gap-2 border-b px-3"
  >
    <SearchIcon className="size-4 shrink-0 opacity-50" />
    <Autocomplete.Input
      data-slot="command-input"
      className={cn(
        "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
);

const CommandList = ({
  className,
  ...props
}: ComponentProps<typeof Autocomplete.List>) => (
  <Autocomplete.List
    data-slot="command-list"
    className={cn(
      "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto data-empty:hidden",
      className
    )}
    {...props}
  />
);

const CommandEmpty = ({
  className,
  ...props
}: ComponentProps<typeof Autocomplete.Empty>) => (
  <Autocomplete.Empty
    data-slot="command-empty"
    className={cn("py-6 text-center text-sm empty:p-0", className)}
    {...props}
  />
);

const CommandGroup = ({
  className,
  heading,
  children,
  ...props
}: ComponentProps<typeof Autocomplete.Group> & { heading?: ReactNode }) => (
  <Autocomplete.Group
    data-slot="command-group"
    className={cn(
      "text-foreground overflow-hidden p-1 **:data-[slot=command-group-heading]:px-2 **:data-[slot=command-group-heading]:py-1.5 **:data-[slot=command-group-heading]:text-xs **:data-[slot=command-group-heading]:font-medium **:data-[slot=command-group-heading]:text-muted-foreground",
      className
    )}
    {...props}
  >
    {heading && (
      <Autocomplete.GroupLabel data-slot="command-group-heading">
        {heading}
      </Autocomplete.GroupLabel>
    )}
    {children}
  </Autocomplete.Group>
);

const CommandCollection = Autocomplete.Collection;

const CommandSeparator = ({
  className,
  ...props
}: ComponentProps<typeof Autocomplete.Separator>) => (
  <Autocomplete.Separator
    data-slot="command-separator"
    className={cn("bg-border -mx-1 h-px", className)}
    {...props}
  />
);

const CommandItem = ({
  className,
  ...props
}: ComponentProps<typeof Autocomplete.Item>) => (
  <Autocomplete.Item
    data-slot="command-item"
    className={cn(
      "data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
);

const CommandShortcut = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="command-shortcut"
    className={cn(
      "text-muted-foreground ml-auto text-xs tracking-widest",
      className
    )}
    {...props}
  />
);

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandCollection,
  CommandSeparator,
  CommandItem,
  CommandShortcut,
};
