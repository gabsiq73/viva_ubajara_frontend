import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnsavedGuard } from '../../company/components/unsavedGuardContext';

export function useGuardedNavigate() {
  const navigate = useNavigate();
  const { requestLeave } = useUnsavedGuard();

  return (to: string, onProceed?: () => void) => (event?: MouseEvent) => {
    if (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    requestLeave(() => { onProceed?.(); navigate(to); });
  };
}
