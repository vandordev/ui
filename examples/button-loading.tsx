import { PlusIcon } from "lucide-react";

import { Button } from "@/registry/new-york/button";

export const ButtonLoading = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button isLoading>Save</Button>
    <Button isLoading variant="outline">
      Upload
    </Button>
    <Button isLoading size="icon" aria-label="Add item">
      <PlusIcon />
    </Button>
  </div>
);
