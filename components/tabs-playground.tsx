"use client";

import { useState } from "react";

import { ComponentPlayground } from "@/components/component-playground";
import {
  getTabsCode,
  getTabsDefaults,
  getTabsPreviewProps,
  tabsProps,
} from "@/lib/tabs-playground";
import type { TabsPlaygroundValues } from "@/lib/tabs-playground";
import { Tabs } from "@/registry/new-york/tabs";

export const TabsPreview = ({ values }: { values: TabsPlaygroundValues }) => {
  const [active, setActive] = useState("overview");
  return <Tabs {...getTabsPreviewProps(values, active, setActive)} />;
};

export const TabsPlayground = () => (
  <ComponentPlayground
    title="Tabs"
    definitions={tabsProps}
    initialValues={getTabsDefaults()}
    getCode={getTabsCode}
    hint="Panels: arrows move focus; Enter/Space selects in manual mode. Links: demo-owned navigation, not a real router. Reset restores configuration and selection; copied code starts at Overview."
    renderPreview={(values) => (
      <TabsPreview key={values.mode} values={values} />
    )}
  />
);
