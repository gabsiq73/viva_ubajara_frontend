import { useState, useEffect, useCallback, useRef } from 'react';
import type { PageResponse } from '../types';
import { useUrlListState } from './useUrlListState';

// Com busca ativa a listagem traz até este número de registros e filtra/pagina no cliente.
const SEARCH_FETCH_LIMIT = 200;

interface UseCrudListOptions<T> {
  /** Precisa ter identidade estável (referência de service), senão o fetch dispara a cada render. */
  fetchFn: (page: number, size: number) => Promise<PageResponse<T>>;
  deleteFn: (id: string) => Promise<void>;
  pageSize?: number;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export function useCrudList<T extends { id: string }>({
  fetchFn,
  deleteFn,
  pageSize = 10,
  onSuccess,
  onError,
}: UseCrudListOptions<T>) {
  const { page: urlPage, search, setPage, setSearch } = useUrlListState();
  const [rows, setRows] = useState<T[]>([]);
  const [rowsFromSearch, setRowsFromSearch] = useState(false);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [serverTotalElements, setServerTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const requestRef = useRef(0);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const hasSearch = search.trim() !== '';
  const serverPage = hasSearch ? 0 : urlPage;

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const result = hasSearch
        ? await fetchFn(0, SEARCH_FETCH_LIMIT)
        : await fetchFn(serverPage, pageSize);
      if (request !== requestRef.current) return;
      if (!hasSearch && serverPage > 0 && result.content.length === 0 && result.totalPages > 0) {
        setPage(result.totalPages - 1, true);
        return;
      }
      setRows(result.content);
      setRowsFromSearch(hasSearch);
      setServerTotalPages(result.totalPages);
      setServerTotalElements(result.totalElements);
    } catch {
      if (request === requestRef.current) onErrorRef.current?.('Erro ao carregar dados.');
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [fetchFn, hasSearch, serverPage, pageSize, setPage]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = useCallback((id: string) => setDeleteId(id), []);
  const cancelDelete = useCallback(() => setDeleteId(null), []);

  const executeDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteFn(deleteId);
      onSuccessRef.current?.('Registro deletado com sucesso.');
      setDeleteId(null);
      load();
    } catch {
      onErrorRef.current?.('Erro ao deletar registro.');
    } finally {
      setDeleting(false);
    }
  }, [deleteId, deleteFn, load]);

  const visibleRows = rowsFromSearch === hasSearch ? rows : [];
  const matches = hasSearch
    ? visibleRows.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : visibleRows;

  const totalPages = hasSearch ? Math.ceil(matches.length / pageSize) : serverTotalPages;
  const totalElements = hasSearch ? matches.length : serverTotalElements;
  const page = hasSearch ? Math.min(urlPage, Math.max(0, totalPages - 1)) : urlPage;
  const data = hasSearch ? matches.slice(page * pageSize, (page + 1) * pageSize) : matches;

  return {
    data,
    page, setPage,
    totalPages, totalElements,
    loading,
    search, setSearch,
    deleteId, deleting,
    confirmDelete, cancelDelete, executeDelete,
    refresh: load,
  };
}
