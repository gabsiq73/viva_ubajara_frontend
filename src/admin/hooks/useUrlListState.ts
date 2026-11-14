import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Estado de listagem na URL: `page` (1-based na URL, 0-based aqui), `q` e filtros extras. Valores padrão são omitidos da URL. Os setters têm identidade estável. */
export function useUrlListState() {
  const [params, setParams] = useSearchParams();
  const setParamsRef = useRef(setParams);
  useEffect(() => { setParamsRef.current = setParams; });

  const rawPage = Number(params.get('page'));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage - 1 : 0;
  // O texto digitado fica em estado local: o React Router atualiza a URL dentro de uma transition,
  // e um <input> controlado direto pela URL perde caractere/posição do cursor ao digitar rápido.
  const [search, setSearchState] = useState(() => params.get('q') ?? '');

  const getFilter = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const value = params.get(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  };

  const setPage = useCallback((next: number, replace = false) => {
    setParamsRef.current((prev) => {
      const out = new URLSearchParams(prev);
      if (next > 0) out.set('page', String(next + 1));
      else out.delete('page');
      return out;
    }, { replace });
  }, []);

  // Mudar busca ou filtro volta para a primeira página no próprio handler, não em efeito.
  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setParamsRef.current((prev) => {
      const out = new URLSearchParams(prev);
      if (value) out.set('q', value);
      else out.delete('q');
      out.delete('page');
      return out;
    }, { replace: true });
  }, []);

  const setFilter = useCallback((key: string, value: string, fallback: string) => {
    setParamsRef.current((prev) => {
      const out = new URLSearchParams(prev);
      if (value && value !== fallback) out.set(key, value);
      else out.delete(key);
      out.delete('page');
      return out;
    }, { replace: true });
  }, []);

  return { page, search, getFilter, setPage, setSearch, setFilter };
}
