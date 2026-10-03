import Link from "next/link";

import { CommandBox } from "@/components/command-box";
import { HomeCtas } from "@/components/home-ctas";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { Button } from "@/registry/new-york/button";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

export const dynamic = "force-static";
export const revalidate = false;

export default function IndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
      <PageTransition>
        <section className="container-wrapper relative">
          <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
            <h1 className="max-w-7xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-transparent">
              {SITE.NAME}
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Customizable React components by Vandor. Install with the shadcn
              CLI, own the source, and adapt it to your project.
            </p>

            <CommandBox className="mt-4 w-full max-w-xl" />

            <HomeCtas className="mt-4" />
          </div>
        </section>

        <section className="container-wrapper pb-8 lg:pb-12">
          <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <section className="overflow-hidden rounded-md border">
              <div className="flex min-h-48 items-center justify-center bg-muted/20 p-6">
                <Button>Button</Button>
              </div>
              <h2 className="border-t px-5 py-4 text-sm font-medium">
                <Link
                  href="/docs/components/button"
                  className="underline-offset-4 hover:underline"
                >
                  Button
                </Link>
              </h2>
            </section>
          </div>
        </section>
      </PageTransition>
    </>
  );
}
