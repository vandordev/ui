"use client";

import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import {
  ArrowRightIcon,
  CornerDownLeftIcon,
  CircleDashedIcon,
  SquareDashedIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useFeedback } from "@/hooks/use-feedback";
import { useIsMac } from "@/hooks/use-is-mac";
import { usePackageManager } from "@/hooks/use-package-manager";
import type { CommandSearchItem } from "@/lib/command-search";
import { EXCLUDED_SECTIONS, isComponentsFolder } from "@/lib/docs";
import { trackEvent } from "@/lib/events";
import { getAllPagesFromFolder, getPagesFromFolder } from "@/lib/page-tree";
import { cn } from "@/lib/utils";

type DocUrlKind =
  | { kind: "theme"; slug: string }
  | { kind: "component"; slug: string }
  | { kind: "template"; slug: string }
  | { kind: "page" };

const GROUP_HEADING_CLS =
  "!p-0 **:data-[slot=command-group-heading]:scroll-mt-16 **:data-[slot=command-group-heading]:!p-3 **:data-[slot=command-group-heading]:!pb-1";

type SearchOption = CommandSearchItem & {
  title: string;
  url: string;
  parsed: DocUrlKind;
  blockName?: string;
  onHighlight: () => void;
};
interface SearchGroup {
  label: string;
  items: SearchOption[];
}

const parseDocPageUrl = (url: string): DocUrlKind => {
  const parts = url.split("/").filter(Boolean);
  const themesIdx = parts.indexOf("themes");
  if (themesIdx !== -1 && parts[themesIdx + 1]) {
    return { kind: "theme", slug: parts[themesIdx + 1] };
  }
  const componentsIdx = parts.indexOf("components");
  if (componentsIdx !== -1 && parts[componentsIdx + 1]) {
    return { kind: "component", slug: parts.at(-1) ?? "" };
  }
  const templatesIdx = parts.indexOf("templates");
  if (templatesIdx !== -1 && parts[templatesIdx + 1]) {
    return { kind: "template", slug: parts.at(-1) ?? "" };
  }
  return { kind: "page" };
};

const searchKeywordsFromUrl = (url: string) => {
  const segments = url.split("/").filter(Boolean);
  return segments.flatMap((segment) =>
    segment.includes("-") ? [segment, ...segment.split("-")] : [segment]
  );
};

const buildDocPageKeywords = (
  parsed: DocUrlKind,
  url: string,
  breadcrumb: string[]
): string[] => [
  ...(parsed.kind === "page" ? [] : [parsed.kind]),
  ...breadcrumb.filter(Boolean).flatMap((s) => [s, s.toLowerCase()]),
  ...searchKeywordsFromUrl(url),
];

const DocPageLeadingIcon = ({ parsed }: { parsed: DocUrlKind }) => {
  // if (parsed.kind === "theme") {
  //   const color = themePrimaryBySlug[parsed.slug];
  //   return (
  //     <span
  //       className="border-border/60 size-4 shrink-0 rounded-sm border"
  //       style={color ? { backgroundColor: color } : undefined}
  //       aria-hidden
  //     />
  //   );
  // }
  if (parsed.kind === "component") {
    return <CircleDashedIcon />;
  }
  if (parsed.kind === "template") {
    return <SquareDashedIcon />;
  }
  return <ArrowRightIcon />;
};

const CommandMenuItem = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CommandItem>) => (
  <CommandItem
    className={cn(
      "data-highlighted:border-input data-highlighted:bg-input/50 h-9 rounded-md border border-transparent px-3! font-medium",
      className
    )}
    {...props}
  >
    {children}
  </CommandItem>
);

export const CommandMenu = ({
  blocks,
  navItems,
  tree,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  blocks?: { name: string; description: string; categories: string[] }[];
  navItems: { href: string; label: string }[];
  tree: PageTreeRoot;
}) => {
  const router = useRouter();
  const isMac = useIsMac();
  const [packageManager] = usePackageManager();
  const [open, setOpen] = useState(false);
  const [showGoToPage, setShowGoToPage] = useState(false);
  const [copyPayload, setCopyPayload] = useState("");
  const copyFeedback = useFeedback({ sound: "copy" });

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      if (copyPayload) {
        trackEvent({
          name: "copy_npm_command",
          properties: { command: copyPayload, pm: packageManager },
        });
      }
    },
  });

  const treeGroups = useMemo(() => {
    const groups: { label: string; pages: { url: string; name: string }[] }[] =
      [];
    for (const item of tree.children) {
      if (item.type !== "folder") {
        continue;
      }
      if (EXCLUDED_SECTIONS.has(item.$id ?? "")) {
        continue;
      }

      const pages = (
        isComponentsFolder(item)
          ? getAllPagesFromFolder(item).filter(
              (page) => page.url !== ROUTES.DOCS_COMPONENTS
            )
          : getPagesFromFolder(item)
      ).map((p) => ({
        name: typeof p.name === "string" ? p.name : String(p.name),
        url: p.url,
      }));
      if (pages.length > 0) {
        groups.push({
          label: typeof item.name === "string" ? item.name : String(item.name),
          pages,
        });
      }
    }
    return groups;
  }, [tree]);

  const handleDocPageHighlight = useCallback(
    (item: { url: string; name?: string }) => {
      setShowGoToPage(true);
      const parsed = parseDocPageUrl(item.url);
      if (parsed.kind === "theme") {
        setCopyPayload(
          `${packageManager} dlx shadcn@latest add ${SITE.REGISTRY}/r/theme-${parsed.slug}.json`
        );
        return;
      }
      if (parsed.kind === "component" || parsed.kind === "template") {
        setCopyPayload(
          `${packageManager} dlx shadcn@latest add ${SITE.REGISTRY}/r/${parsed.slug}.json`
        );
        return;
      }
      setCopyPayload("");
    },
    [packageManager]
  );

  const handleBlockHighlight = useCallback(
    (block: { name: string; description: string; categories: string[] }) => {
      setShowGoToPage(true);
      setCopyPayload(`${packageManager} dlx shadcn@latest add ${block.name}`);
    },
    [packageManager]
  );

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleOpenClick = useCallback(() => setOpen(true), []);

  const searchGroups = useMemo<SearchGroup[]>(() => {
    const groups: SearchGroup[] = [];
    if (navItems.length) {
      groups.push({
        items: navItems.map((item) => ({
          keywords: ["nav", "navigation", item.label.toLowerCase()],
          onHighlight: () => {
            setShowGoToPage(true);
            setCopyPayload("");
          },
          parsed: { kind: "page" },
          title: item.label,
          url: item.href,
          value: `Navigation ${item.label}`,
        })),
        label: "Pages",
      });
    }
    for (const group of treeGroups) {
      groups.push({
        items: group.pages.map((page) => {
          const parsed = parseDocPageUrl(page.url);
          return {
            keywords: buildDocPageKeywords(parsed, page.url, [group.label]),
            onHighlight: () =>
              handleDocPageHighlight({ name: page.name, url: page.url }),
            parsed,
            title: page.name,
            url: page.url,
            value: `${group.label} ${page.name}`,
          };
        }),
        label: group.label,
      });
    }
    if (blocks?.length) {
      groups.push({
        items: blocks.map((block) => ({
          blockName: block.name,
          keywords: [
            "block",
            block.name,
            block.description,
            ...block.categories,
          ],
          onHighlight: () => handleBlockHighlight(block),
          parsed: { kind: "template", slug: block.name },
          title: block.description,
          url: `/blocks/${block.categories[0]}#${block.name}`,
          value: block.name,
        })),
        label: "Blocks",
      });
    }
    return groups;
  }, [
    navItems,
    treeGroups,
    blocks,
    handleDocPageHighlight,
    handleBlockHighlight,
  ]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            const metaKeyPressed = e.metaKey ? "cmd+k" : "ctrl+k";
            trackEvent({
              name: "open_command_menu",
              properties: {
                key: e.key === "/" ? "/" : metaKeyPressed,
                method: "keyboard",
              },
            });
          }
          return !prev;
        });
      }

      if (
        e.key === "c" &&
        (e.metaKey || e.ctrlKey) &&
        copyPayload.includes("shadcn@latest")
      ) {
        runCommand(() => {
          copyFeedback();
          copyToClipboard(copyPayload);
        });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [copyPayload, runCommand, copyToClipboard, copyFeedback]);

  return (
    <Dialog open={open} onOpenChange={setOpen} sounds>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "bg-surface text-surface-foreground/60 dark:bg-card relative h-8 w-full justify-start pl-2.5 font-normal shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64"
          )}
          onClick={handleOpenClick}
          {...props}
        >
          <span className="hidden lg:inline-flex">Search documentation...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <div className="absolute top-1.5 right-1.5 hidden gap-1 sm:flex">
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd className="aspect-square">K</Kbd>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search documentation...</DialogTitle>
          <DialogDescription>Search for a command to run...</DialogDescription>
        </DialogHeader>
        <Command
          className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input-wrapper]:border-input rounded-none bg-transparent **:data-[slot=command-input]:h-9! **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9! **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border"
          items={searchGroups}
          onItemHighlighted={(item: SearchOption | undefined) => {
            if (item) {
              item.onHighlight();
            } else {
              setShowGoToPage(false);
              setCopyPayload("");
            }
          }}
        >
          <CommandInput
            aria-label="Search documentation"
            placeholder="Search documentation..."
          />
          <CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
            No results found.
          </CommandEmpty>
          <CommandList className="no-scrollbar max-h-[min(300px,50dvh)] scroll-pt-2 scroll-pb-1.5">
            {(group: SearchGroup) => (
              <CommandGroup
                key={group.label}
                items={group.items}
                heading={group.label}
                className={GROUP_HEADING_CLS}
              >
                <CommandCollection>
                  {(item: SearchOption) => (
                    <CommandMenuItem
                      key={item.url}
                      value={item}
                      onClick={() => runCommand(() => router.push(item.url))}
                    >
                      <DocPageLeadingIcon parsed={item.parsed} />
                      {item.title}
                      {item.blockName && (
                        <span className="text-muted-foreground ml-auto font-mono text-xs font-normal tabular-nums">
                          {item.blockName}
                        </span>
                      )}
                    </CommandMenuItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="text-muted-foreground absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 overflow-hidden rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium dark:border-t-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center gap-2 shrink-0">
            <Kbd className="shrink-0">
              <CornerDownLeftIcon />
            </Kbd>{" "}
            {showGoToPage ? (
              <span className="min-w-0 truncate">Go to Page</span>
            ) : null}
          </div>
          {copyPayload && (
            <>
              <Separator orientation="vertical" className="h-4!" />
              <div className="flex min-w-0 items-center gap-1">
                <Kbd className="shrink-0">{isMac ? "⌘" : "Ctrl"}</Kbd>
                <Kbd className="shrink-0">C</Kbd>
                <span className="min-w-0 truncate">{copyPayload}</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
