import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyField: (row: T) => string;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ columns, rows, keyField, emptyMessage, onRowClick }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="rounded-xl2 border border-dashed border-border p-8 text-center text-sm text-mutedForeground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-border bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-border bg-muted/60">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-semibold text-secondary">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={keyField(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-border last:border-0 ${onRowClick ? "cursor-pointer hover:bg-muted/40" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 text-primary ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
