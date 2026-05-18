"use client";

import { useEffect } from "react";

export function VaultToast({ message, type = "success", onClose }: { message: string; type?: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors: Record<string, { bg: string; border: string; text: string }> = {
    success: { bg: "rgba(0,206,201,0.15)", border: "rgba(0,206,201,0.3)", text: "#00cec9" },
    error: { bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)", text: "#ff6b6b" },
    info: { bg: "var(--accent-bg)", border: "rgba(108,92,231,0.3)", text: "var(--accent2)" },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      className="toast-enter fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl max-w-xs"
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-xs">x</button>
    </div>
  );
}
