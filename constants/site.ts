export const FALLBACK_SITE_ORIGIN = "https://vandor-ui.vercel.app" as const;

const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.SITE_URL ?? FALLBACK_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "Vandor",
  },
  DESCRIPTION: {
    LONG: "An open-source collection of customizable React components, distributed through the shadcn registry and maintained by Vandor.",
    SHORT: "Customizable React components by Vandor",
  },
  KEYWORDS: [
    "vandor-ui",
    "vandor",
    "shadcn",
    "shadcn registry",
    "component registry",
    "shadcn components",
    "next.js",
    "tailwindcss",
    "npx shadcn add",
  ] as const,
  NAME: "Vandor UI",
  OG_IMAGE: `${baseUrl}/og`,
  REGISTRY: baseUrl,
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#09090b",
  light: "#ffffff",
};

export const UTM_PARAMS = {
  utm_source: new URL(baseUrl).hostname,
};
