import { BoringAvatar } from "@/registry/new-york/boring-avatar";

const colors = ["#F2D7B6", "#B55A30", "#E8A652", "#783F51", "#42665E"];

export const BoringAvatarPaletteDemo = () => (
  <div className="flex flex-wrap items-center gap-4">
    <BoringAvatar name="ada" alt="Ada, round" colors={colors} size={64} />
    <BoringAvatar
      name="ada"
      alt="Ada, square"
      colors={colors}
      square
      size={64}
    />
  </div>
);
