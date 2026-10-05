import { FolderIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/new-york/empty";

export const EmptyDemo = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FolderIcon aria-hidden="true" />
      </EmptyMedia>
      <EmptyTitle>No projects yet</EmptyTitle>
      <EmptyDescription>
        Create your first project to get started.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);
