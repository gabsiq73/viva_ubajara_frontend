import { useEffect, useRef, useState } from 'react';

/** Chame `focusFirstError()` no mesmo handler que grava os erros; o foco vai ao primeiro campo com aria-invalid após o re-render. */
export function useFocusFirstError() {
  const formRef = useRef<HTMLFormElement>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempts]);

  return { formRef, focusFirstError: () => setAttempts((n) => n + 1) };
}
