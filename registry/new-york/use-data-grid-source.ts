"use client";

import { useDataGridController } from "./data-grid-controller";
import type { DataGridControllerOptions } from "./data-grid-controller";
import type { DataGridContract, DataGridOutput } from "./data-grid-schema";

export interface DataGridSource<C extends DataGridContract> {
  data: DataGridOutput<C> | undefined;
  error?: unknown;
  loading?: boolean;
  refreshing?: boolean;
  refetch: () => unknown;
}

/** Consumer owns data/request correspondence, caching and stale-response handling. */
export const useDataGridSource = <C extends DataGridContract>(
  options: DataGridControllerOptions<C> & { source: DataGridSource<NoInfer<C>> }
) => {
  const useSourceAdapter = () => {
    const { source } = options;
    const failed = source.error !== undefined && source.error !== null;
    return {
      data: source.data,
      failed,
      fetching: Boolean(source.loading || source.refreshing),
      paused: false,
      placeholder: false,
      query: {
        data: source.data,
        error: source.error,
        refetch: source.refetch,
      },
      // Reconcile immutable updates and completed refreshes of the same object.
      revision: Boolean(source.loading || source.refreshing),
      success: source.data !== undefined && !failed,
    };
  };
  return useDataGridController(options, useSourceAdapter);
};
