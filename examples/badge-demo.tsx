import { Badge } from "@/registry/new-york/badge";

export const BadgeDemo = () => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <Badge variant="success-light">
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      Ready
    </Badge>
    <Badge variant="info-light">In progress</Badge>
    <Badge variant="outline">Draft</Badge>
  </div>
);
