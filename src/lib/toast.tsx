import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X } from 'lucide-react'
import { useCopy } from './ui-copy'

type Toast = { id: number; message: string; tone: 'default' | 'success' }

type ToastContextValue = {
  notify: (message: string, tone?: Toast['tone']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback((message: string, tone: Toast['tone'] = 'default') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { id, message, tone }])
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastRow key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const copy = useCopy()
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3600)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="animate-pop pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-[var(--shadow-pop)]">
      {toast.tone === 'success' ? (
        <CheckCircle2 size={16} className="shrink-0 text-positive" aria-hidden />
      ) : (
        <Info size={16} className="shrink-0 text-brand" aria-hidden />
      )}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-0.5 text-muted transition hover:text-ink"
        aria-label={copy.a11y.dismiss}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
