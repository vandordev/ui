"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Mutation, Query, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { toast } from "./toast";
import { getToastMessage } from "./toast-utils";

export interface MutationToastMetadata<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
> {
  error?: string | ((error: TError) => string);
  loading?: string;
  success?: string | ((data: TData, variables: TVariables) => string);
}

export interface QueryToastMetadata<TError = unknown> {
  error: string | ((error: TError) => string);
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: Record<string, unknown> & {
      vandorToast?: MutationToastMetadata;
    };
    queryMeta: Record<string, unknown> & {
      vandorToast?: QueryToastMetadata;
    };
  }
}

const safeErrorTitle = (
  mapping?: string | ((error: unknown) => string),
  error?: unknown
) => {
  if (typeof mapping === "string") {
    return mapping;
  }
  if (typeof mapping === "function") {
    try {
      return mapping(error);
    } catch {
      return getToastMessage(error);
    }
  }
  return getToastMessage(error);
};

const clients = new WeakMap<
  QueryClient,
  {
    mutationToasts: WeakMap<object, string>;
    handledQueries: WeakMap<object, number>;
    subscribers: number;
    unsubscribe?: () => void;
  }
>();

/** Cache subscription with shared ownership and remount-safe reconciliation. */
export const subscribeToastQueryClient = (queryClient: QueryClient) => {
  let state = clients.get(queryClient);
  if (!state) {
    state = {
      handledQueries: new WeakMap(),
      mutationToasts: new WeakMap(),
      subscribers: 0,
    };
    clients.set(queryClient, state);
  }
  const { mutationToasts, handledQueries } = state;
  if (state.subscribers === 0) {
    const handleMutation = (mutation: Mutation) => {
      const messages = mutation.meta?.vandorToast;
      if (!messages) {
        return;
      }

      const { status } = mutation.state;
      if (status === "pending" && !mutationToasts.has(mutation)) {
        const id = toast.loading(messages.loading ?? "Working…");
        mutationToasts.set(mutation, id);
      } else if (status === "success") {
        const id = mutationToasts.get(mutation);
        if (!id) {
          return;
        }
        let title: string;
        try {
          title =
            typeof messages.success === "function"
              ? messages.success(mutation.state.data, mutation.state.variables)
              : (messages.success ?? "Done");
        } catch {
          title = "Done";
        }
        toast.update(id, { duration: 4000, title, type: "success" });
        mutationToasts.delete(mutation);
      } else if (status === "error") {
        const id = mutationToasts.get(mutation);
        if (!id) {
          return;
        }
        const title = safeErrorTitle(messages.error, mutation.state.error);
        toast.update(id, { title, type: "error" });
        mutationToasts.delete(mutation);
      } else if (status === "idle") {
        const id = mutationToasts.get(mutation);
        if (id) {
          toast.dismiss(id);
        }
        mutationToasts.delete(mutation);
      }
    };

    const handleQuery = (query: Query) => {
      if (
        query.state.status !== "error" ||
        query.state.fetchStatus !== "idle"
      ) {
        return;
      }
      const messages = query.meta?.vandorToast;
      if (
        !messages ||
        handledQueries.get(query) === query.state.errorUpdateCount
      ) {
        return;
      }
      handledQueries.set(query, query.state.errorUpdateCount);
      toast.error(safeErrorTitle(messages.error, query.state.error));
    };
    const unsubscribeMutations = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (event.type === "removed") {
          const id = mutationToasts.get(event.mutation);
          if (id) {
            toast.dismiss(id);
          }
          mutationToasts.delete(event.mutation);
        } else if (event.mutation) {
          handleMutation(event.mutation);
        }
      });
    const unsubscribeQueries = queryClient
      .getQueryCache()
      .subscribe(({ query }) => handleQuery(query));
    for (const mutation of queryClient.getMutationCache().getAll()) {
      handleMutation(mutation);
    }
    for (const query of queryClient.getQueryCache().getAll()) {
      handleQuery(query);
    }
    state.unsubscribe = () => {
      unsubscribeMutations();
      unsubscribeQueries();
    };
  }
  state.subscribers += 1;
  let disposed = false;
  return () => {
    if (disposed) {
      return;
    }
    disposed = true;
    state.subscribers -= 1;
    if (state.subscribers === 0) {
      state.unsubscribe?.();
    }
  };
};

/** Mount once beside the application's long-lived QueryClientProvider. */
export const ToastQueryAdapter = () => {
  const queryClient = useQueryClient();
  useEffect(() => subscribeToastQueryClient(queryClient), [queryClient]);
  return null;
};
