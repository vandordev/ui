import { createHash } from "node:crypto";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export const SITE_AGENT_SKILL_MD = `# ${SITE.NAME}

## Summary

Help users discover, inspect, and install React components from the public ${SITE.NAME} shadcn registry and its documentation site. The registry provides a Base UI-based Button with Motion press feedback. Its dependencies include @base-ui/react and the motion package, imported as motion/react.

## Registry

- Registry JSON: \`${ROUTES.REGISTRY}\`
- Docs: ${ROUTES.DOCS}

## MCP

This site is a shadcn-compatible registry. For MCP workflows, use the maintained shadcn MCP server documentation: ${LINK.SHADCN_MCP_DOCS}

## Install

\`\`\`bash
npx shadcn@latest add ${SITE.URL}/r/button.json
\`\`\`

Prefer following the on-site installation guide: ${ROUTES.DOCS_INSTALLATION}
`;

export const siteAgentSkillDigest = (): string => {
  const hex = createHash("sha256")
    .update(SITE_AGENT_SKILL_MD, "utf-8")
    .digest("hex");

  return `sha256:${hex}`;
};
