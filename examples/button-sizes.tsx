import { ArrowUpRightIcon } from "lucide-react";

import { Button } from "@/registry/new-york/button";

export const ButtonSizes = () => (
  <div className="flex flex-wrap items-center gap-4">
    <div className="flex items-center gap-2">
      <Button variant="outline" size="xs">
        Extra small
      </Button>
      <Button variant="outline" size="icon-xs" aria-label="Open extra small">
        <ArrowUpRightIcon />
      </Button>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        Small
      </Button>
      <Button variant="outline" size="icon-sm" aria-label="Open small">
        <ArrowUpRightIcon />
      </Button>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline">Default</Button>
      <Button variant="outline" size="icon" aria-label="Open default">
        <ArrowUpRightIcon />
      </Button>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="lg">
        Large
      </Button>
      <Button variant="outline" size="icon-lg" aria-label="Open large">
        <ArrowUpRightIcon />
      </Button>
    </div>
  </div>
);
