import { ExternalLink, SquarePen, Star } from "lucide-react";
import type { Metadata } from "next";

import { ExternalLinkButton } from "@/components/external-link-button";
import { PageTransition } from "@/components/page-transition";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { createPageMetadata } from "@/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  description:
    "Support Vandor UI by reporting issues, contributing components, or starring the repository on GitHub.",
  path: ROUTES.SPONSOR,
  title: "Support",
});

export default function SupportPage() {
  return (
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container max-w-2xl flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Support {SITE.NAME}
          </h1>
          <p className="text-base text-muted-foreground text-balance">
            Help improve Vandor&apos;s open-source React components. Report a
            bug, suggest a component, or contribute a pull request on GitHub.
          </p>
          <p className="text-sm text-muted-foreground text-balance">
            You can also support the project by starring the repository or
            sharing it with other developers.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <ExternalLinkButton sound="click" href={LINK.ISSUES}>
              <SquarePen />
              Report an issue
              <ExternalLink className="size-3.5 opacity-60" />
            </ExternalLinkButton>
            <ExternalLinkButton
              sound="star"
              variant="outline"
              href={LINK.GITHUB}
            >
              <Star />
              Star on GitHub
            </ExternalLinkButton>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
