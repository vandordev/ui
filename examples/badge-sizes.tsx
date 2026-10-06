import { Badge } from "@/registry/new-york/badge";

export const BadgeSizes = () => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    {(["xs", "sm", "default", "lg", "xl"] as const).map((size) => (
      <Badge key={size} variant="secondary" size={size}>
        {size}
      </Badge>
    ))}
    <Badge variant="outline" radius="full">
      Pill
    </Badge>
  </div>
);
