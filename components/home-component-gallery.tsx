import Link from "next/link";
import type { ComponentType } from "react";

import registry from "@/registry.json";
import { Loading } from "@/registry/new-york/loading";

const getPreview = async (name: string) => {
  // Registry items discover their matching examples/<name>-demo.tsx export.
  if (name === "loading") {
    return <Loading />;
  }
  let demo: Record<string, ComponentType>;
  try {
    demo = await import(`../examples/${name}-demo.tsx`);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "MODULE_NOT_FOUND" ||
        error.code === "ERR_MODULE_NOT_FOUND") &&
      error.message.includes(`${name}-demo`)
    ) {
      return null;
    }
    throw error;
  }
  const expectedName = `${name.replaceAll("-", "")}demo`;
  const exportName = Object.keys(demo).find(
    (key) => key.toLowerCase() === expectedName
  );
  if (!exportName) {
    throw new Error(`Missing ${name} demo export in examples/${name}-demo.tsx`);
  }
  const Demo = demo[exportName];
  return <Demo />;
};

export const HomeComponentGallery = async () => {
  const items = registry.items.filter((item) => item.type === "registry:ui");
  const previews = await Promise.all(
    items.map((item) => getPreview(item.name))
  );
  return (
    <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <section
          className="min-w-0 overflow-hidden rounded-md border"
          key={item.name}
        >
          <div className="flex min-h-48 min-w-0 items-center justify-center overflow-x-auto bg-muted/20 p-6 [&>div]:max-w-full">
            {previews[index] ?? (
              <p className="text-sm text-muted-foreground">
                Explore examples in the documentation.
              </p>
            )}
          </div>
          <h2 className="border-t px-5 py-4 text-sm font-medium">
            <Link
              className="underline-offset-4 hover:underline"
              href={`/docs/components/${item.name}`}
            >
              {item.title ?? item.name}
            </Link>
          </h2>
        </section>
      ))}
    </div>
  );
};
