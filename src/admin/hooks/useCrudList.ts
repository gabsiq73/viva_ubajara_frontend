import { useState, useEffect, useCallback } from 'react';
import type { PageResponse } from '../types';

interface UseCrudListOptions<T> {
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
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const result = await fetchFn(p, pageSize);
      setData(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      onError?.('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, fetchFn]);

  useEffect(() => { fetch(page); }, [page]);

  const confirmDelete = useCallback((id: string) => setDeleteId(id), []);
  const cancelDelete = useCallback(() => setDeleteId(null), []);

  const executeDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteFn(deleteId);
      onSuccess?.('Registro deletado com sucesso.');
      setDeleteId(null);
      fetch(page);
    } catch {
      onError?.('Erro ao deletar registro.');
    } finally {
      setDeleting(false);
    }
  }, [deleteId, deleteFn, page]);

  const filtered = search.trim()
    ? data.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  return {
    data: filtered,
    page, setPage,
    totalPages, totalElements,
    loading,
    search, setSearch,
    deleteId, deleting,
    confirmDelete, cancelDelete, executeDelete,
    refresh: () => fetch(page),
  };
}
