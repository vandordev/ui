import { Badge } from "@/registry/new-york/badge";

export const BadgeVariants = () => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="info">Info</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="destructive">Error</Badge>
    <Badge variant="success-light">Success light</Badge>
    <Badge variant="info-light">Info light</Badge>
    <Badge variant="warning-light">Warning light</Badge>
    <Badge variant="destructive-light">Error light</Badge>
    <Badge variant="success-outline">Success outline</Badge>
    <Badge variant="info-outline">Info outline</Badge>
    <Badge variant="warning-outline">Warning outline</Badge>
    <Badge variant="destructive-outline">Error outline</Badge>
  </div>
);
