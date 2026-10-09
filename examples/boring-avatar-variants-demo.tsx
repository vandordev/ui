import { BoringAvatar } from "@/registry/new-york/boring-avatar";

export const BoringAvatarVariantsDemo = () => (
  <div className="flex flex-wrap justify-center gap-5">
    {(["beam", "marble", "pixel", "sunset", "ring", "bauhaus"] as const).map(
      (variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <BoringAvatar
            name="vandor"
            alt={`Vandor, ${variant}`}
            variant={variant}
            size={56}
          />
          <span className="text-sm text-muted-foreground">{variant}</span>
        </div>
      )
    )}
  </div>
);
