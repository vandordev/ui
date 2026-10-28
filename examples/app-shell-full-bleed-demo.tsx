"use client";

import { AppShell } from "@/registry/new-york/app-shell";

export const AppShellFullBleedDemo = () => (
  <AppShell
    brand={{ name: "Acme" }}
    navigation={[{ active: true, id: "canvas", label: "Canvas" }]}
    showHeader={false}
    className="relative isolate h-96 min-h-0 w-full [contain:layout] [&_[data-slot=app-shell-sidebar]]:h-full"
  >
    <section
      aria-label="Full-bleed canvas"
      className="min-h-96 w-full bg-muted"
    >
      <h2 className="p-4 text-lg font-semibold">Full-bleed canvas</h2>
      <p className="px-4 text-sm text-muted-foreground">
        This surface reaches the main content edges. No PageContainer or shell
        page padding is applied; the canvas owns its internal spacing.
      </p>
    </section>
  </AppShell>
);
