"use client";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getStatsCardCode,
  getStatsCardDefaults,
  getStatsCardPreviewProps,
  statsCardPlaygroundDefinitions,
} from "@/lib/stats-card-playground";
import { StatsCard } from "@/registry/new-york/stats-card";

export const StatsCardPlayground = () => (
  <ComponentPlayground
    title="StatsCard"
    definitions={statsCardPlaygroundDefinitions}
    initialValues={getStatsCardDefaults()}
    getCode={getStatsCardCode}
    hint="Numeric targets animate for 1.2 seconds. Exact display values stay static; missing targets show a dash. Reset restores configuration and remounts the preview, counting from zero again."
    renderPreview={(values) => (
      <StatsCard {...getStatsCardPreviewProps(values)} />
    )}
  />
);
