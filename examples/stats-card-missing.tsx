"use client";

import { CircleCheck } from "lucide-react";

import { StatsCard } from "@/registry/new-york/stats-card";

export const StatsCardMissing = () => (
  <StatsCard
    ariaLabel="Success rate overview"
    items={[
      {
        badge: { label: "Awaiting data", variant: "outline" },
        icon: CircleCheck,
        key: "rate",
        title: "Success rate",
        value: { target: null },
      },
    ]}
  />
);
