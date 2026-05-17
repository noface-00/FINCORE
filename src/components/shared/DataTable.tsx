import React from 'react';

interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyMessage = 'No hay registros disponibles',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-[var(--fc-text-muted)]">
        <div className="w-8 h-8 border-2 border-[var(--fc-primary)] border-t-transparent rounded-full fc-spinner" />
        <span className="text-sm">Cargando datos desde Oracle ORDS...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-[var(--fc-text-muted)]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--fc-border)' }}>
            {columns.map((col, colIdx) => (
              <th
                key={`th-${colIdx}-${String(col.key)}`}
                className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.1em]"
                style={{ color: 'var(--fc-text-muted)' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={`row-${rowIdx}-${row.id ?? rowIdx}`}
              onClick={() => onRowClick?.(row)}
              className="fc-tr"
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={`td-${rowIdx}-${colIdx}-${String(col.key)}`}
                  className={`px-5 py-3.5 text-sm ${col.className || ''}`}
                  style={{ color: 'var(--fc-text-subtle)' }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
