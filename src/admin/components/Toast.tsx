import { useState, useCallback, useEffect, useLayoutEffect, useRef, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { usePresence } from '../../utils/usePresence';

const LEAVE_MS = 200;
const REORDER_MS = 250;

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  leaving: boolean;
}

interface ToastContextData {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<number, HTMLDivElement>());
  const offsets = useRef(new Map<number, number>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Reposiciona os irmãos com FLIP: mede o offset antes/depois do layout e anima só a diferença.
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const next = new Map<number, number>();
    // O contêiner é ancorado por top/bottom, então a posição precisa ser medida na viewport, não no offset interno.
    const containerTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    itemRefs.current.forEach((el, id) => {
      const top = containerTop + el.offsetTop;
      next.set(id, top);
      const previous = offsets.current.get(id);
      if (reduce || previous === undefined || previous === top) return;
      el.style.transition = 'none';
      el.style.transform = `translateY(${previous - top}px)`;
      void el.offsetHeight;
      el.style.transition = `transform ${REORDER_MS}ms var(--ease-out)`;
      el.style.transform = '';
    });
    offsets.current = next;
  }, [toasts]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      remove(id);
    }, LEAVE_MS);
    timers.current.add(timer);
  }, [remove]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      dismiss(id);
    }, 4000);
    timers.current.add(timer);
  }, [dismiss]);

  const icons = { 
    success: <CheckCircle size={20} aria-hidden="true" />, 
    error: <XCircle size={20} aria-hidden="true" />, 
    info: <Info size={20} aria-hidden="true" /> 
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div ref={containerRef} className="adm-toast-container" role="region" aria-label="Notificações" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            ref={(el) => {
              if (el) itemRefs.current.set(t.id, el);
              else itemRefs.current.delete(t.id);
            }}
          >
            <ToastItem toast={t} icon={icons[t.type]} onClose={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, icon, onClose }: { toast: Toast; icon: ReactNode; onClose: () => void }) {
  const { state } = usePresence(!toast.leaving, LEAVE_MS);
  return (
    <div className={`adm-toast adm-toast--${toast.type}`} data-state={state} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className="adm-toast__icon" aria-hidden="true">{icon}</span>
      <span>{toast.message}</span>
      <button type="button" className="adm-toast__close" aria-label="Fechar notificação" onClick={onClose}>
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
