"use client";

import { Button } from "./button";
import type { DataGridSurface } from "./data-grid-context";
import type { DataGridLabels } from "./data-grid-labels";
import type { DataGridContract } from "./data-grid-schema";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./empty";
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateTitle,
} from "./error-state-base";

export function DataGridError({
  labels,
  retry,
  inline = false,
}: {
  labels: DataGridLabels;
  retry: () => unknown;
  inline?: boolean;
}) {
  return (
    <ErrorState variant={inline ? "inline" : "centered"} role="alert">
      <ErrorStateContent>
        <ErrorStateHeader>
          <ErrorStateTitle>{labels.error}</ErrorStateTitle>
          <ErrorStateDescription>
            {labels.errorDescription}
          </ErrorStateDescription>
        </ErrorStateHeader>
        <ErrorStateActions>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => retry()}
          >
            {labels.retry}
          </Button>
        </ErrorStateActions>
      </ErrorStateContent>
    </ErrorState>
  );
}

export function DataGridEmpty<C extends DataGridContract>({
  grid,
  labels,
}: {
  grid: DataGridSurface<C>;
  labels: DataGridLabels;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          {grid.filtered ? labels.noMatches : labels.noData}
        </EmptyTitle>
        <EmptyDescription>
          {grid.filtered
            ? labels.noMatchesDescription
            : labels.noDataDescription}
        </EmptyDescription>
      </EmptyHeader>
      {grid.filtered && (
        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => grid.resetFilters()}
          >
            {labels.reset}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
