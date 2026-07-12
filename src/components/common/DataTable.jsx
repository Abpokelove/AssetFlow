import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

/**
 * DataTable — TanStack Table v8 wrapper
 * Props:
 *   columns: ColumnDef[]
 *   data: T[]
 *   loading: boolean
 *   emptyMessage: string
 *   pageSize: number (default 10)
 *   onRowClick: (row) => void
 */
export default function DataTable({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',
  pageSize: initialPageSize = 10,
  onRowClick,
}) {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-card border border-border">
        <table className="af-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-background">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide select-none"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                        className="inline-flex items-center gap-1 hover:text-text-primary transition-colors disabled:cursor-default"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="inline-flex flex-col gap-0">
                            <ChevronUp size={10} className={header.column.getIsSorted() === 'asc' ? 'text-primary' : 'text-text-muted'} />
                            <ChevronDown size={10} className={header.column.getIsSorted() === 'desc' ? 'text-primary' : 'text-text-muted'} />
                          </span>
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <LoadingSpinner size="md" className="mx-auto" />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`hover:bg-background/70 transition-colors border-b border-border last:border-0 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3.5 px-4 text-sm text-text-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner /></div>
        ) : table.getRowModel().rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">{emptyMessage}</p>
        ) : (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={`bg-surface rounded-card border border-border p-4 space-y-2 ${onRowClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''}`}
            >
              {row.getVisibleCells().map((cell) => {
                const header = cell.column.columnDef.header;
                return typeof header === 'string' ? (
                  <div key={cell.id} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-text-muted font-medium flex-shrink-0">{header}</span>
                    <span className="text-xs text-text-primary text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && data.length > initialPageSize && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-text-muted">
            Showing {table.getState().pagination.pageIndex * initialPageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * initialPageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors">
              <ChevronsLeft size={16} />
            </button>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-secondary px-2">
              Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors">
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
