import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { Button } from "@/registry/new-york/button";

export const ButtonIcon = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button variant="outline">
      <PlusIcon data-icon="inline-start" /> Add item
    </Button>
    <Button>
      Continue <ArrowRightIcon data-icon="inline-end" />
    </Button>
    <Button variant="outline" size="icon" aria-label="Add item">
      <PlusIcon />
    </Button>
  </div>
);
