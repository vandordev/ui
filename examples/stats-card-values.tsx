"use client";

import { Activity, Wallet } from "lucide-react";

import { StatsCard } from "@/registry/new-york/stats-card";

const currency = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

export const StatsCardValues = () => (
  <StatsCard
    ariaLabel="Payment overview"
    items={[
      {
        caption: "Compared with last month",
        icon: Activity,
        key: "change",
        title: "Balance change",
        value: { format: currency.format, target: -125_000 },
      },
      {
        caption: "Preformatted by the application",
        icon: Wallet,
        key: "volume",
        title: "Exact payment volume",
        value: { display: "Rp9.007.199.254.740.993" },
      },
    ]}
  />
);
