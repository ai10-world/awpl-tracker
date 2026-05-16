// components/ui/toast.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const success = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const error = useCallback((msg: string) => toast(msg, "error", 5000), [toast]);
  const info = useCallback((msg: string) => toast(msg, "info"), [toast]);
  const warning = useCallback((msg: string) => toast(msg, "warning"), [toast]);

  const icons = {
    success: <CheckCircle size={15} />,
    error: <AlertCircle size={15} />,
    info: <Info size={15} />,
    warning: <AlertTriangle size={15} />,
  };
  const styles = {
    success: { bg: "var(--success-dim)", border: "rgba(34,197,94,0.25)", color: "#4ade80" },
    error: { bg: "var(--danger-dim)", border: "rgba(239,68,68,0.25)", color: "#f87171" },
    info: { bg: "var(--info-dim)", border: "rgba(59,130,246,0.25)", color: "#60a5fa" },
    warning: { bg: "var(--warning-dim)", border: "rgba(245,158,11,0.25)", color: "#fbbf24" },
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const s = styles[t.type];
          return (
            <div
              key={t.id}
              className="animate-toast-in pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl text-sm shadow-xl"
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${s.border}`,
                backdropFilter: "blur(16px)",
              }}
            >
              <div style={{ color: s.color, flexShrink: 0, marginTop: 1 }}>
                {icons[t.type]}
              </div>
              <p className="flex-1 leading-snug" style={{ color: "var(--text-1)" }}>{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 transition-colors hover:opacity-100 opacity-40"
                style={{ color: "var(--text-2)" }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
