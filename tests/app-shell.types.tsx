import { AppShell } from "../registry/new-york/app-shell";
import type { AppShellUser } from "../registry/new-york/app-shell";

export const malformedUser: AppShellUser = {
  items: [
    {
      id: "invalid",
      label: "Invalid",
      // @ts-expect-error Menu entries retain the real Dropdown action signature.
      onSelect: "not-a-callback",
    },
  ],
  name: "Avery",
};

export const CustomLinkShell = () => (
  <AppShell
    brand={{ name: "Acme" }}
    labels={{ skipToContent: "Skip to content" }}
    navigation={[
      {
        id: "reports",
        label: "Reports",
        renderControl: ({ closeNavigation, collapsed }) => (
          <a
            href="#reports"
            aria-current="page"
            data-compact={collapsed}
            onClick={closeNavigation}
          >
            Reports
          </a>
        ),
      },
    ]}
    showHeader={false}
    user={{ items: [{ id: "profile", label: "Profile" }], name: "Avery Cole" }}
  >
    Reports
  </AppShell>
);
