"use client";

import { Activity } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/new-york/button";
import { StatsCard } from "@/registry/new-york/stats-card";

export const StatsCardUpdating = () => {
  const [target, setTarget] = useState(1248);
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <StatsCard
        ariaLabel="Live deliveries"
        items={[
          {
            caption: "Stable key keeps updates continuous",
            icon: Activity,
            key: "delivered",
            title: "Delivered",
            value: { target },
          },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setTarget((current) => current + 100)}
        >
          Add 100
        </Button>
        <Button
          variant="outline"
          onClick={() => setTarget((current) => current - 100)}
        >
          Subtract 100
        </Button>
        <Button variant="outline" onClick={() => setTarget(1248)}>
          Reset value
        </Button>
      </div>
    </div>
  );
};
