"use client";

import { Activity } from "lucide-react";

import { StatsCard } from "@/registry/new-york/stats-card";

export const StatsCardDemo = () => (
  <StatsCard
    ariaLabel="Delivery overview"
    items={[
      {
        badge: { label: "Healthy", variant: "secondary" },
        caption: "Last 30 days",
        icon: Activity,
        key: "delivered",
        title: "Delivered",
        value: { target: 1248 },
      },
    ]}
  />
);
