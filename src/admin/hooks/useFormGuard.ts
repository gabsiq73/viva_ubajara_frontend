import { useState } from 'react';
import { useUnsavedChangesWarning } from '../../company/components/unsavedGuardContext';

const serialize = (state: unknown) =>
  JSON.stringify(state, (_key, value) => (value instanceof File ? `file:${value.name}:${value.size}` : value));

/** `ready` deve ficar true só depois que o estado inicial do formulário foi carregado (modo edição). */
export function useFormGuard(state: unknown, ready = true) {
  const current = serialize(state);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  if (ready && snapshot === null) setSnapshot(current);

  const dirty = ready && snapshot !== null && snapshot !== current;
  useUnsavedChangesWarning(dirty);
  return dirty;
}
