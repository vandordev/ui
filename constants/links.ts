export const GITHUB = {
  branch: "main",
  org: "vandordev",
  repo: "ui",
  user: "vandordev",
} as const;

const githubUrl = `https://github.com/${GITHUB.org}/${GITHUB.repo}`;

export const LINK = {
  GITHUB: githubUrl,
  ISSUES: `${githubUrl}/issues`,
  LICENSE: `${githubUrl}/blob/${GITHUB.branch}/LICENSE`,
  PORTFOLIO: `https://github.com/${GITHUB.org}`,
  SHADCN_MCP_DOCS: "https://ui.shadcn.com/docs/mcp",
} as const;
