import { CodeBlockCommand } from "@/components/code-block-command";
import registry from "@/registry.json";

export const ComponentDependencies = ({ name }: { name: string }) => {
  const dependencies = registry.items.find(
    (item) => item.name === name
  )?.dependencies;
  if (!dependencies?.length) {
    return null;
  }
  const packages = dependencies.join(" ");

  return (
    <section
      aria-label={`${name} dependencies`}
      className="not-prose mt-6 grid min-w-0 overflow-hidden rounded-md border bg-code text-code-foreground md:grid-cols-[15rem_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-2 border-b p-5 md:border-b-0 md:border-r">
        <span className="text-sm font-medium">Dependencies</span>
        <span className="text-xs text-muted-foreground">
          {dependencies.length} required packages
        </span>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {dependencies.map((dependency) => (
            <li key={dependency} className="break-all font-mono">
              {dependency}
            </li>
          ))}
        </ul>
      </div>
      <CodeBlockCommand
        className="min-w-0 rounded-none"
        __npm__={`npm install ${packages}`}
        __pnpm__={`pnpm add ${packages}`}
        __yarn__={`yarn add ${packages}`}
        __bun__={`bun add ${packages}`}
      />
    </section>
  );
};
