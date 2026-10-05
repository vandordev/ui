import { SearchIcon } from "lucide-react";
import Link from "next/link";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/new-york/empty";

export const EmptyOutlineDemo = () => (
  <Empty className="border">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <SearchIcon aria-hidden="true" />
      </EmptyMedia>
      <EmptyTitle>No matching components</EmptyTitle>
      <EmptyDescription>
        Try a different keyword or browse the full component list.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Link
        href="/docs/components"
        className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
      >
        Browse components
      </Link>
    </EmptyContent>
  </Empty>
);
