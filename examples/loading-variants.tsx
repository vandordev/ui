import { Loading } from "@/registry/new-york/loading";
import { loadingVariants } from "@/registry/new-york/loading-variants";

export const LoadingVariants = () => (
  <ul className="m-0 grid list-none grid-cols-1 gap-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {loadingVariants.map((variant) => (
      <li
        key={variant}
        className="flex min-w-0 flex-col items-center gap-5 border-b p-6"
      >
        <div
          className="flex h-24 w-full items-center justify-center"
          aria-hidden="true"
        >
          <Loading
            variant={variant}
            size={variant.startsWith("text-") ? 18 : 24}
          />
        </div>
        <code className="text-xs text-muted-foreground">{variant}</code>
      </li>
    ))}
  </ul>
);
