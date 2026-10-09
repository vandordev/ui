import { BoringAvatar } from "@/registry/new-york/boring-avatar";

export const BoringAvatarDemo = () => (
  <div className="flex flex-wrap items-center gap-3">
    {["vandor", "ada", "luna", "mars"].map((name) => (
      <BoringAvatar key={name} name={name} alt={name} size={48} />
    ))}
  </div>
);
