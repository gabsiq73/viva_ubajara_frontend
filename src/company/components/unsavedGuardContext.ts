import { createContext, useContext, useEffect } from 'react';

interface UnsavedGuard {
  setDirty: (dirty: boolean) => void;
  /** Executa `proceed` agora ou, se há alterações não salvas, depois da confirmação da pessoa. */
  requestLeave: (proceed: () => void) => void;
}

export const UnsavedGuardContext = createContext<UnsavedGuard>({
  setDirty: () => {},
  requestLeave: (proceed) => proceed(),
});

export const useUnsavedGuard = () => useContext(UnsavedGuardContext);

/** Avisa ao fechar/recarregar a aba e bloqueia a navegação interna (via requestLeave) enquanto `dirty`. */
export function useUnsavedChangesWarning(dirty: boolean) {
  const { setDirty } = useUnsavedGuard();
  useEffect(() => {
    setDirty(dirty);
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
      setDirty(false);
    };
  }, [dirty, setDirty]);
}
