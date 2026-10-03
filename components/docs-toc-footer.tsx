import { LINK } from "@/constants/links";
import { cn } from "@/lib/utils";

export const DocsTocFooter = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <a
      href={LINK.GITHUB}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors text-[0.8rem] hover:text-foreground text-muted-foreground [&_svg]:size-3 flex gap-1.5 items-center"
    >
      View on GitHub
    </a>
    <a
      href={LINK.ISSUES}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors text-[0.8rem] hover:text-foreground text-muted-foreground [&_svg]:size-3 flex gap-1.5 items-center"
    >
      Report an issue
    </a>
  </div>
);
