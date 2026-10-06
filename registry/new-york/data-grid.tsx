"use client";

import type { Row, Cell, Header } from "@tanstack/react-table";
import { cn } from "cn";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useContext } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Checkbox } from "./checkbox";
import type { DataGridFeatures } from "./data-grid-columns";
import {
  DataGridContext,
  DataGridViewportContext,
  useDataGridContext,
} from "./data-grid-context";
import type { DataGridSurface } from "./data-grid-context";
import { DataGridEmpty, DataGridError } from "./data-grid-feedback";
import { dataGridLabels } from "./data-grid-labels";
import type { DataGridLabels } from "./data-grid-labels";
import type { DataGridContract, DataGridRowData } from "./data-grid-schema";

export type DataGridProps<C extends DataGridContract> =
  ComponentProps<"div"> & {
    grid: DataGridSurface<C>;
    variant?: "default" | "striped" | "bordered" | "plain";
    density?: "comfortable" | "compact";
    labels?: Partial<DataGridLabels>;
  };
export function DataGrid<C extends DataGridContract>({
  grid,
  variant = "default",
  density = "comfortable",
  labels,
  className,
  ...props
}: DataGridProps<C>) {
  return (
    <DataGridContext.Provider
      value={{
        density,
        grid,
        labels: { ...dataGridLabels, ...labels },
        variant,
      }}
    >
      <div
        {...props}
        data-slot="data-grid"
        data-variant={variant}
        data-density={density}
        className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      />
    </DataGridContext.Provider>
  );
}
export function DataGridViewport({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <DataGridViewportContext.Provider value={true}>
      <div
        {...props}
        data-slot="data-grid-viewport"
        data-grid-scroll=""
        className={cn("relative min-w-0 overflow-auto rounded-md", className)}
      />
    </DataGridViewportContext.Provider>
  );
}

const cellBase = "text-start align-middle text-sm wrap-anywhere";
export function DataGridColumn({ className, ...props }: ComponentProps<"th">) {
  const { variant, density } = useDataGridContext();
  return (
    <th
      scope="col"
      {...props}
      data-slot="data-grid-column"
      className={cn(
        cellBase,
        "font-medium text-muted-foreground",
        density === "compact" ? "px-3 py-2" : "px-4 py-3",
        variant !== "plain" && "border-b",
        variant === "bordered" && "border-e last:border-e-0",
        className
      )}
    />
  );
}
export function DataGridCell({ className, ...props }: ComponentProps<"td">) {
  const { variant, density } = useDataGridContext();
  return (
    <td
      {...props}
      data-slot="data-grid-cell"
      className={cn(
        cellBase,
        density === "compact" ? "px-3 py-2" : "px-4 py-3",
        variant === "bordered" && "border-e last:border-e-0",
        className
      )}
    />
  );
}
export function DataGridRow({ className, ...props }: ComponentProps<"tr">) {
  const { variant } = useDataGridContext();
  return (
    <tr
      {...props}
      data-slot="data-grid-row"
      className={cn(
        "transition-colors motion-reduce:transition-none hover:bg-muted/50 data-[selected=true]:bg-accent",
        variant !== "plain" && "border-b last:border-b-0",
        variant === "striped" && "even:bg-muted/30",
        className
      )}
    />
  );
}

interface RenderContext<C extends DataGridContract, Native, Props> {
  grid: DataGridSurface<C>;
  row: DataGridRowData<C>;
  native: Native;
  props: Props;
}
export type DataGridTableProps<C extends DataGridContract> =
  ComponentProps<"table"> & {
    grid?: DataGridSurface<C>;
    stickyHeader?: boolean;
    renderRow?: (
      context: RenderContext<
        C,
        Row<DataGridFeatures, DataGridRowData<C>>,
        ComponentProps<"tr">
      >
    ) => ReactNode;
    renderCell?: (
      context: RenderContext<
        C,
        Cell<DataGridFeatures, DataGridRowData<C>, unknown>,
        ComponentProps<"td">
      > & { value: unknown }
    ) => ReactNode;
    renderColumn?: (context: {
      grid: DataGridSurface<C>;
      native: Header<DataGridFeatures, DataGridRowData<C>, unknown>;
      props: ComponentProps<"th">;
    }) => ReactNode;
    renderEmpty?: (context: {
      grid: DataGridSurface<C>;
      filtered: boolean;
      reset: () => void;
    }) => ReactNode;
    renderError?: (context: {
      grid: DataGridSurface<C>;
      error: unknown;
      retry: () => unknown;
      background: boolean;
    }) => ReactNode;
  };

export function DataGridTable<C extends DataGridContract>({
  grid: supplied,
  stickyHeader = false,
  renderRow,
  renderCell,
  renderColumn,
  renderEmpty,
  renderError,
  className,
  ...props
}: DataGridTableProps<C>) {
  const context = useDataGridContext<C>();
  const grid = supplied ?? context.grid;
  const { labels, variant } = context;
  const inViewport = useContext(DataGridViewportContext);
  const selection = grid.selectionMode !== "none";
  const span = Math.max(
    1,
    grid.table.getVisibleLeafColumns().length + Number(selection)
  );
  const { status } = grid.presentation;
  const selectionCell = (header: boolean, id?: string) => (
    <Checkbox
      aria-label={header ? labels.selectPage : labels.selectRow(id ?? "")}
      disabled={!grid.canSelectRows}
      checked={
        header ? grid.pageSelection.checked : grid.isRowSelected(id ?? "")
      }
      indeterminate={header && grid.pageSelection.indeterminate}
      onCheckedChange={(checked) =>
        header ? grid.togglePage(checked) : grid.toggleRow(id ?? "", checked)
      }
    />
  );
  const error = (background: boolean) =>
    renderError ? (
      renderError({
        background,
        error: grid.query.error,
        grid,
        retry: grid.query.refetch,
      })
    ) : (
      <DataGridError
        labels={labels}
        retry={grid.query.refetch}
        inline={background}
      />
    );
  const neutral = status === "paused" ? labels.paused : labels.inactive;
  const content = (
    <table
      {...props}
      data-slot="data-grid-table"
      aria-busy={
        status === "loading" ||
        status === "refreshing" ||
        status === "placeholder"
      }
      className={cn("w-full caption-bottom border-collapse text-sm", className)}
    >
      <thead
        className={cn(
          variant !== "plain" && "bg-muted/40",
          stickyHeader && "sticky top-0 z-10 bg-background"
        )}
      >
        {grid.table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {selection && (
              <DataGridColumn className="w-10">
                {selectionCell(true)}
              </DataGridColumn>
            )}
            {group.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              const label =
                grid.columns.find((column) => column.id === header.column.id)
                  ?.meta.dataGrid.label ?? header.column.id;
              const headerContent = <grid.table.FlexRender header={header} />;
              const columnProps: ComponentProps<"th"> = {
                "aria-sort": header.column.getCanSort()
                  ? sorted === "asc"
                    ? "ascending"
                    : sorted === "desc"
                      ? "descending"
                      : "none"
                  : undefined,
                children: header.column.getCanSort() ? (
                  <button
                    type="button"
                    className="inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-sm text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={labels.sort(
                      label,
                      header.column.getNextSortingOrder()
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {headerContent}
                    {sorted === "asc" ? (
                      <ArrowUp aria-hidden="true" className="size-3.5" />
                    ) : sorted === "desc" ? (
                      <ArrowDown aria-hidden="true" className="size-3.5" />
                    ) : (
                      <ChevronsUpDown aria-hidden="true" className="size-3.5" />
                    )}
                  </button>
                ) : (
                  headerContent
                ),
              };
              return (
                <FragmentColumn key={header.id}>
                  {renderColumn ? (
                    renderColumn({ grid, native: header, props: columnProps })
                  ) : (
                    <DataGridColumn {...columnProps} />
                  )}
                </FragmentColumn>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {grid.presentation.hasRows &&
          grid.table.getRowModel().rows.map((row) => {
            const rowProps: ComponentProps<"tr"> & { "data-selected": string } =
              {
                children: (
                  <>
                    {selection && (
                      <DataGridCell className="w-10">
                        {selectionCell(false, row.id)}
                      </DataGridCell>
                    )}
                    {row.getVisibleCells().map((cell) => {
                      const cellProps = {
                        children: <grid.table.FlexRender cell={cell} />,
                      };
                      return (
                        <FragmentColumn key={cell.id}>
                          {renderCell ? (
                            renderCell({
                              grid,
                              row: row.original,
                              native: cell,
                              value: cell.getValue(),
                              props: cellProps,
                            })
                          ) : (
                            <DataGridCell {...cellProps} />
                          )}
                        </FragmentColumn>
                      );
                    })}
                  </>
                ),
                "data-selected": String(grid.isRowSelected(row.id)),
              };
            return (
              <FragmentColumn key={row.id}>
                {renderRow ? (
                  renderRow({
                    grid,
                    native: row,
                    props: rowProps,
                    row: row.original,
                  })
                ) : (
                  <DataGridRow {...rowProps} />
                )}
              </FragmentColumn>
            );
          })}
        {status === "loading" &&
          !grid.presentation.hasRows &&
          Array.from({ length: 5 }, (_, index) => (
            <DataGridRow key={index} aria-hidden="true">
              {Array.from({ length: span }, (__, cell) => (
                <DataGridCell key={cell}>
                  <span className="block h-4 w-4/5 rounded bg-muted motion-safe:animate-pulse" />
                </DataGridCell>
              ))}
            </DataGridRow>
          ))}
        {!grid.presentation.hasRows && status !== "loading" && (
          <tr>
            <td colSpan={span}>
              {status === "error" ? (
                error(false)
              ) : status === "empty" ? (
                renderEmpty ? (
                  renderEmpty({
                    filtered: grid.filtered,
                    grid,
                    reset: grid.resetFilters,
                  })
                ) : (
                  <DataGridEmpty grid={grid} labels={labels} />
                )
              ) : (
                <div
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                  role="status"
                >
                  {neutral}
                </div>
              )}
            </td>
          </tr>
        )}
        {status === "backgroundError" && (
          <tr>
            <td colSpan={span}>{error(true)}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
  return (
    <>
      {(status === "placeholder" ||
        status === "refreshing" ||
        status === "loading" ||
        (status === "paused" && grid.presentation.hasRows)) && (
        <div
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {status === "placeholder"
            ? labels.updating
            : status === "paused"
              ? labels.paused
              : status === "loading"
                ? labels.loading
                : labels.refreshing}
        </div>
      )}
      {inViewport ? (
        content
      ) : (
        <div
          data-grid-scroll=""
          className="relative min-w-0 overflow-auto rounded-md"
        >
          {content}
        </div>
      )}
    </>
  );
}
function FragmentColumn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export {
  DataGridApplyFilters,
  DataGridColumnVisibility,
  DataGridFilter,
  DataGridPagination,
  DataGridResetFilters,
  DataGridSearch,
  DataGridSelectionBar,
  DataGridToolbar,
} from "./data-grid-controls";
export type { DataGridLabels } from "./data-grid-labels";
