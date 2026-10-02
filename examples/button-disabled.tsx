import { Button } from "@/registry/new-york/button";

export const ButtonDisabled = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button disabled>Disabled</Button>
    <Button variant="outline" disabled>
      Disabled outline
    </Button>
  </div>
);
