import Link from "next/link";
import type { ReactNode } from "react";

import registry from "@/registry.json";
import { Button } from "@/registry/new-york/button";
import { Loading } from "@/registry/new-york/loading";

const previews: Record<string, ReactNode> = {
  button: <Button>Button</Button>,
  loading: <Loading />,
};

export const HomeComponentGallery = () => (
  <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {registry.items
      .filter((item) => item.type === "registry:ui")
      .map((item) => (
        <section className="overflow-hidden rounded-md border" key={item.name}>
          <div className="flex min-h-48 items-center justify-center bg-muted/20 p-6">
            {previews[item.name] ?? (
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
