"use client";

import { DownloadIcon } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/logo";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { BRAND_ASSETS } from "@/constants/brand";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export const BrandContextMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast.success("Logo URL copied"),
  });

  const handleCopy = useCallback(() => {
    copyToClipboard(new URL(BRAND_ASSETS.logo, window.location.origin).href);
  }, [copyToClipboard]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopy}>
          <LogoMark alt="" />
          Copy logo URL
        </ContextMenuItem>

        <ContextMenuItem asChild>
          <a href={BRAND_ASSETS.logo} download="vandor-ui-logo.png">
            <DownloadIcon /> Download PNG
          </a>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
