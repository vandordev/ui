import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";

import { Badge } from "@/registry/new-york/badge";

export const BadgeComposition = () => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <Badge variant="success-light">
      <Check aria-hidden="true" />
      Verified
    </Badge>
    <Badge variant="info-light" role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
      Refreshing
    </Badge>
    <Badge
      variant="outline"
      render={<a href="#behavior--accessibility" aria-label="Accessibility" />}
    >
      Accessibility
      <ArrowUpRight aria-hidden="true" />
    </Badge>
  </div>
);
