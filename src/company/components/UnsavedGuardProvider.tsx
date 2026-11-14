import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { UnsavedGuardContext } from './unsavedGuardContext';
import { ConfirmDialog } from './ConfirmDialog';

export function UnsavedGuardProvider({ children }: { children: ReactNode }) {
  const dirtyRef = useRef(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const setDirty = useCallback((dirty: boolean) => { dirtyRef.current = dirty; }, []);
  const requestLeave = useCallback((proceed: () => void) => {
    if (dirtyRef.current) setPending(() => proceed);
    else proceed();
  }, []);
  const value = useMemo(() => ({ setDirty, requestLeave }), [setDirty, requestLeave]);

  return (
    <UnsavedGuardContext.Provider value={value}>
      {children}
      {pending && (
        <ConfirmDialog
          title="Sair sem salvar?"
          message="Você tem alterações que ainda não foram salvas. Se sair agora, elas serão perdidas."
          confirmLabel="Sair sem salvar"
          cancelLabel="Continuar editando"
          tone="danger"
          onCancel={() => setPending(null)}
          onConfirm={() => { const proceed = pending; setPending(null); proceed(); }}
        />
      )}
    </UnsavedGuardContext.Provider>
  );
}
