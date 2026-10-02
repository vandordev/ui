import Image from "next/image";

import { BRAND_ASSETS } from "@/constants/brand";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

export const LogoMark = ({
  className,
  alt = `${SITE.NAME} logo`,
  width = 24,
  height = 24,
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src" | "alt"> & {
  alt?: string;
}) => (
  <Image
    {...props}
    src={BRAND_ASSETS.logo}
    alt={alt}
    width={width}
    height={height}
    className={cn("size-4 object-contain invert dark:invert-0", className)}
    unoptimized
  />
);
