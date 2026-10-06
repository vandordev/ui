"use client";

import { createContext, useContext } from "react";

import type { DataGridLabels } from "./data-grid-labels";
import type { DataGridContract, DataGridOutput } from "./data-grid-schema";
import type { DataGridController } from "./use-data-grid";

export type DataGridSurface<C extends DataGridContract> = Omit<
  DataGridController<C>,
  "query"
> & {
  query: {
    data: DataGridOutput<C> | undefined;
    error: unknown;
    refetch: () => unknown;
  };
};
export const DataGridContext = createContext<{
  grid: unknown;
  labels: DataGridLabels;
  variant: "default" | "striped" | "bordered" | "plain";
  density: "comfortable" | "compact";
} | null>(null);
export const DataGridViewportContext = createContext(false);

export function useDataGridContext<
  C extends DataGridContract = DataGridContract,
>() {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error("DataGrid components must be inside DataGrid");
  }
  return { ...context, grid: context.grid as DataGridSurface<C> };
}
