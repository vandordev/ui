import Link from "next/link";

import { Button } from "@/registry/new-york/button";

export const ButtonAsChild = () => (
  <Button asChild variant="outline">
    <Link href="/docs/components">Browse components</Link>
  </Button>
);
