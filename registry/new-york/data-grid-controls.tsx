"use client";

import { cn } from "cn";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "./button";
import { useDataGridContext } from "./data-grid-context";
import type { DataGridSurface } from "./data-grid-context";
import type { DataGridContract, DataGridFilterInput } from "./data-grid-schema";
import { getDataGridPageLinks } from "./data-grid-state";
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownCheckboxItem,
} from "./dropdown";
import { InputSearch } from "./input-search";
import type { InputSearchProps } from "./input-search";
import { Select } from "./select";

export function DataGridToolbar({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="data-grid-toolbar"
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
    />
  );
}

export function DataGridFilter<
  C extends DataGridContract,
  K extends keyof DataGridFilterInput<C> & string,
>({
  grid,
  field,
  children,
}: {
  grid: DataGridSurface<C>;
  field: K;
  children: (binding: {
    value: DataGridFilterInput<C>[K];
    onChange: (value: DataGridFilterInput<C>[K]) => void;
    reset: () => void;
    error: string | undefined;
  }) => ReactNode;
}) {
  return children(grid.getFilterBinding(field));
}

type StringField<C extends DataGridContract> = {
  [K in keyof DataGridFilterInput<C>]: NonNullable<
    DataGridFilterInput<C>[K]
  > extends string
    ? K
    : never;
}[keyof DataGridFilterInput<C>] &
  string;
export function DataGridSearch<
  C extends DataGridContract,
  K extends StringField<C>,
>({
  grid,
  field,
  debounce = 300,
  onChange,
  ...props
}: Omit<InputSearchProps, "value" | "defaultValue"> & {
  grid: DataGridSurface<C>;
  field: K;
  debounce?: number;
}) {
  const { labels } = useDataGridContext();
  const id = useId();
  const binding = grid.getFilterBinding(field);
  const errorId = `${id}-error`;
  return (
    <div className="min-w-0">
      <InputSearch
        {...props}
        value={String(binding.value ?? "")}
        searchLabel={labels.search}
        clearLabel={labels.clearSearch}
        aria-invalid={Boolean(binding.error)}
        aria-describedby={
          binding.error
            ? [props["aria-describedby"], errorId].filter(Boolean).join(" ")
            : props["aria-describedby"]
        }
        onChange={(event) => {
          onChange?.(event);
          if (event.defaultPrevented) {
            return;
          }
          const { value } = event.currentTarget;
          grid.setFilter(field, value as DataGridFilterInput<C>[K], {
            debounce: value === "" ? 0 : debounce,
          });
        }}
      />
      {binding.error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {binding.error}
        </p>
      )}
    </div>
  );
}

export function DataGridApplyFilters({
  onClick,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const { grid, labels } = useDataGridContext();
  return (
    <Button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          grid.applyFilters();
        }
      }}
    >
      {children ?? labels.apply}
    </Button>
  );
}
export function DataGridResetFilters({
  onClick,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const { grid, labels } = useDataGridContext();
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          grid.resetFilters();
        }
      }}
    >
      {children ?? labels.reset}
    </Button>
  );
}

export function DataGridColumnVisibility() {
  const { grid, labels } = useDataGridContext();
  return (
    <DropdownRoot>
      <DropdownTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        {labels.columns}
      </DropdownTrigger>
      <DropdownContent align="end">
        {grid.table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked)}
            >
              {grid.columns.find((definition) => definition.id === column.id)
                ?.meta.dataGrid.label ?? column.id}
            </DropdownCheckboxItem>
          ))}
      </DropdownContent>
    </DropdownRoot>
  );
}

const DataGridPageLinks = ({
  links,
  index,
}: {
  links: (number | "ellipsis")[];
  index: number;
}) => {
  const { grid, labels } = useDataGridContext();
  return links.map((link, position) => {
    if (link === "ellipsis") {
      return (
        <span
          key={`gap-${position}`}
          aria-hidden="true"
          className="flex size-8 items-center justify-center text-muted-foreground"
        >
          …
        </span>
      );
    }
    return (
      <Button
        key={link}
        type="button"
        size="icon-sm"
        variant={link === index ? "default" : "outline"}
        data-page={link}
        aria-label={labels.page(link)}
        aria-current={link === index ? "page" : undefined}
        disabled={!grid.presentation.currentData}
        onClick={() => grid.table.setPageIndex(link - 1)}
        className="min-w-8 w-auto px-2 tabular-nums"
      >
        {link}
      </Button>
    );
  });
};

const usePaginationPresentation = (showPageNumbers: boolean) => {
  const { grid } = useDataGridContext();
  const { pagination } = grid.request;
  const { data } = grid.query;
  const page = "pageIndex" in pagination;
  const count =
    data && "rowCount" in data && !grid.presentation.placeholder
      ? data.rowCount
      : undefined;
  const from =
    count === undefined || count === 0 || !page
      ? 0
      : pagination.pageIndex * pagination.pageSize + 1;
  const to =
    count === undefined
      ? 0
      : Math.min(from === 0 ? 0 : from + pagination.pageSize - 1, count);
  const index = page ? pagination.pageIndex + 1 : grid.cursorHistory.index + 1;
  const numbered = page && showPageNumbers;
  const links =
    numbered && count !== undefined
      ? getDataGridPageLinks(index, grid.pageCount ?? 1)
      : [];
  return { count, from, index, links, numbered, page, pagination, to };
};

export function DataGridPagination({
  pageSizes = [25, 50, 100],
  showPageNumbers = true,
  className,
  ...props
}: ComponentProps<"div"> & {
  pageSizes?: readonly number[];
  showPageNumbers?: boolean;
}) {
  const { grid, labels } = useDataGridContext();
  const { count, from, index, links, numbered, page, pagination, to } =
    usePaginationPresentation(showPageNumbers);
  return (
    <div
      {...props}
      data-slot="data-grid-pagination"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-3 text-sm",
        className
      )}
    >
      <div className="text-muted-foreground">
        {page && count !== undefined
          ? labels.range(from, to, count)
          : labels.page(index)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label={labels.pageSize}
          data={pageSizes.map((value) => ({ label: String(value), value }))}
          value={pagination.pageSize}
          onValueChange={(value) => {
            if (value !== null) {
              grid.setPageSize(value);
            }
          }}
          size="sm"
        />
        {page && !numbered && (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={!grid.canPreviousPage}
            onClick={() => grid.table.setPageIndex(0)}
            aria-label={labels.first}
          >
            <ChevronsLeft aria-hidden="true" />
          </Button>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          disabled={!grid.canPreviousPage}
          onClick={() => grid.previousPage()}
          aria-label={labels.previous}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        {links.length > 0 ? (
          <DataGridPageLinks links={links} index={index} />
        ) : (
          <span className="tabular-nums">
            {labels.page(
              index,
              page && count !== undefined ? grid.pageCount : undefined
            )}
          </span>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          disabled={!grid.canNextPage}
          onClick={() => grid.nextPage()}
          aria-label={labels.next}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
        {page && !numbered && (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={!grid.canNextPage}
            onClick={() => grid.table.setPageIndex((grid.pageCount ?? 1) - 1)}
            aria-label={labels.last}
          >
            <ChevronsRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function DataGridSelectionBar({
  className,
  ...props
}: ComponentProps<"div">) {
  const { grid, labels } = useDataGridContext();
  const all = grid.selection.mode === "allMatching";
  const count =
    grid.selection.mode === "explicit" ? grid.selection.ids.length : 0;
  if (!all && count === 0) {
    return null;
  }
  const { data } = grid.query;
  const total = data && "rowCount" in data ? data.rowCount : undefined;
  return (
    <div
      {...props}
      data-slot="data-grid-selection-bar"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-3 text-sm",
        className
      )}
    >
      <span role="status" aria-live="polite">
        {all ? labels.allMatching : labels.selected(count)}
      </span>
      {!all &&
        grid.selectionMode === "allMatching" &&
        grid.pageSelection.checked && (
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={!grid.canSelectRows}
            onClick={() => grid.selectAllMatching()}
          >
            {labels.selectAllMatching(total)}
          </Button>
        )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => grid.clearSelection()}
      >
        {labels.clearSelection}
      </Button>
    </div>
  );
}
