import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, keyField, loading, emptyMessage = 'Nenhum registro encontrado.' }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="adm-loading-center">
        <span className="adm-spinner adm-spinner--lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="adm-empty">
        <span className="adm-empty__icon"><Inbox size={48} /></span>
        <p className="adm-empty__text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={col.width ? { width: col.width } : {}}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])}>
              {columns.map((col, i) => (
                <td key={i}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : String(row[col.accessor] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Pagination component
interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button
        className="adm-btn adm-btn--ghost adm-btn--sm"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        ← Anterior
      </button>
      <span className="adm-pagination__info">
        Página {page + 1} de {totalPages} ({totalElements} registros)
      </span>
      <button
        className="adm-btn adm-btn--ghost adm-btn--sm"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima →
      </button>
    </div>
  );
}
