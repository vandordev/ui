"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import { useDataGridController } from "./data-grid-controller";
import type { DataGridControllerOptions } from "./data-grid-controller";
import type {
  DataGridContract,
  DataGridInput,
  DataGridOutput,
} from "./data-grid-schema";

type QueryFactory<C extends DataGridContract> = (input: DataGridInput<C>) => {
  queryKey: QueryKey;
};
type Selected<O> = O extends { select?: (raw: never) => infer S }
  ? S
  : O extends { queryFn?: (context: never) => infer R }
    ? Awaited<R>
    : never;
type QueryParts<O> =
  O extends UseQueryOptions<infer R, infer E, infer S, infer K>
    ? { raw: R; error: E; selected: S; key: K }
    : never;

export const useDataGrid = <
  C extends DataGridContract,
  F extends QueryFactory<C>,
>(
  options: DataGridControllerOptions<C> & { queryOptions: F },
  ..._proof: Selected<ReturnType<F>> extends DataGridOutput<C>
    ? []
    : [invalidQueryOutput: never]
) => {
  type Native = QueryParts<ReturnType<F>>;
  const useQueryAdapter = (request: DataGridInput<C>) => {
    const query = useQuery(
      options.queryOptions(request) as UseQueryOptions<
        Native["raw"],
        Native["error"],
        Selected<ReturnType<F>>,
        Native["key"]
      >
    );
    return {
      data: query.data as DataGridOutput<C> | undefined,
      failed: query.isError,
      fetching: query.isFetching,
      paused: query.fetchStatus === "paused",
      placeholder: query.isPlaceholderData,
      query: query as UseQueryResult<Selected<ReturnType<F>>, Native["error"]>,
      revision: query.dataUpdatedAt,
      success: query.isSuccess,
    };
  };
  return useDataGridController(options, useQueryAdapter);
};

export type DataGridController<C extends DataGridContract> = ReturnType<
  typeof useDataGrid<
    C,
    (
      input: DataGridInput<C>
    ) => UseQueryOptions<
      DataGridOutput<C>,
      unknown,
      DataGridOutput<C>,
      QueryKey
    >
  >
>;
