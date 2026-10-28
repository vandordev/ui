"use client";

import { useState } from "react";

import { AppShell } from "@/registry/new-york/app-shell";
import { PageContainer } from "@/registry/new-york/page-container";

export const AppShellUserDemo = () => {
  const [status, setStatus] = useState("No account action selected.");
  return (
    <AppShell
      brand={{ name: "Acme" }}
      navigation={[]}
      showHeader={false}
      className="relative isolate min-h-80 w-full [contain:layout] [&_[data-slot=app-shell-sidebar]]:h-80"
      labels={{
        closeNavigation: "Tutup navigasi",
        collapseSidebar: "Ciutkan sidebar",
        expandSidebar: "Perluas sidebar",
        openNavigation: "Buka navigasi",
      }}
      user={{
        description: "avery@example.test",
        items: [
          {
            id: "profile",
            label: "Profile",
            link: <a href="#account-profile">Profile</a>,
          },
          {
            id: "account",
            items: [
              {
                closeOnSelect: "success",
                id: "save",
                label: "Save locally",
                onSelect: async () => {
                  await Promise.resolve();
                  setStatus("Local save completed.");
                },
              },
              {
                closeOnSelect: "success",
                id: "retry",
                label: "Simulate rejection",
                onSelect: () =>
                  Promise.reject(new Error("Local demonstration only")),
                onSelectError: () =>
                  setStatus("Rejected action: navigation remains available."),
              },
            ],
            label: "Local actions",
            type: "group",
          },
        ],
        menuLabel: "Menu akun Avery",
        name: "Avery Cole",
      }}
    >
      <PageContainer>
        <h2 id="account-profile" className="text-lg font-semibold">
          Account menu
        </h2>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {status}
        </p>
      </PageContainer>
    </AppShell>
  );
};
