import { BRAND_ASSETS } from "@/constants/brand";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

const JsonLdScript = ({ data }: { data: Record<string, unknown> }) => (
  <script
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);

export const WebsiteJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      description: SITE.DESCRIPTION.LONG,
      inLanguage: "en-US",
      name: SITE.NAME,
      url: SITE.URL,
    }}
  />
);

export const SoftwareSourceCodeJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      applicationCategory: "DeveloperApplication",
      author: {
        "@type": "Organization",
        name: SITE.AUTHOR.NAME,
        url: LINK.PORTFOLIO,
      },
      codeRepository: LINK.GITHUB,
      description: SITE.DESCRIPTION.LONG,
      isAccessibleForFree: true,
      keywords: SITE.KEYWORDS,
      license: LINK.LICENSE,
      maintainer: {
        "@type": "Organization",
        name: SITE.AUTHOR.NAME,
        url: LINK.PORTFOLIO,
      },
      name: SITE.NAME,
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        price: "0",
        priceCurrency: "USD",
      },
      programmingLanguage: ["TypeScript", "React", "Next.js"],
      runtimePlatform: "Node.js",
      url: SITE.URL,
    }}
  />
);

export const OrganizationJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "Organization",
      logo: `${SITE.URL}${BRAND_ASSETS.logo}`,
      name: SITE.NAME,
      sameAs: [LINK.GITHUB, LINK.PORTFOLIO],
      url: SITE.URL,
    }}
  />
);

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; path: string }[];
}) => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        item: `${SITE.URL}${item.path.startsWith(ROUTES.HOME) ? item.path : `${ROUTES.HOME}${item.path}`}`,
        name: item.name,
        position: index + 1,
      })),
    }}
  />
);

export const JsonLdScripts = () => (
  <>
    <WebsiteJsonLd />
    <SoftwareSourceCodeJsonLd />
    <OrganizationJsonLd />
  </>
);
