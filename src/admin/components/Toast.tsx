import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextData {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    timers.current.add(timer);
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = { 
    success: <CheckCircle size={20} aria-hidden="true" />, 
    error: <XCircle size={20} aria-hidden="true" />, 
    info: <Info size={20} aria-hidden="true" /> 
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="adm-toast-container" role="region" aria-label="Notificações" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <span className="adm-toast__icon" aria-hidden="true">{icons[t.type]}</span>
            <span>{t.message}</span>
            <button type="button" className="adm-toast__close" aria-label="Fechar notificação" onClick={() => remove(t.id)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
