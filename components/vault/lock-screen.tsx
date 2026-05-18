"use client";

import { useRef, useState } from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";

export function VaultLockScreen({ onUnlock }: { onUnlock: (pin: string) => Promise<{ ok: boolean; error?: string }> }) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...pin];
    n[i] = v.slice(-1);
    setPin(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePinKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const n = ["", "", "", "", "", ""];
    raw.split("").forEach((c, i) => {
      if (i < 6) n[i] = c;
    });
    setPin(n);
    const next = n.findIndex((d) => !d);
    refs.current[next === -1 ? 5 : next]?.focus();
  };

  const submit = async () => {
    setError(null);
    const filledPin = pin.filter(Boolean).join("");
    if (filledPin.length < 4) {
      setError("Please enter at least 4 digits.");
      return;
    }

    setLoading(true);
    const result = await onUnlock(filledPin);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Incorrect PIN.");
      setPin(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
  };

  return (
    <div className="vault-theme min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border2)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-bg)", color: "var(--accent2)" }}>
            <Lock size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>AWPL Vault</h1>
            <p className="text-xs" style={{ color: "var(--text3)" }}>Enter your main app PIN to continue</p>
          </div>
        </div>

        <div className="flex gap-2" onPaste={handlePinPaste}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(i, e.target.value)}
              onKeyDown={(e) => handlePinKey(i, e)}
              className="w-full aspect-square text-center text-lg font-display font-bold rounded-xl outline-none"
              style={{
                background: "var(--bg3)",
                border: `1px solid ${digit ? "rgba(108,92,231,0.6)" : "var(--border2)"}`,
                color: "var(--text)",
              }}
            />
          ))}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm" style={{ color: "var(--red)" }}>
            <AlertCircle size={15} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.8 : 1 }}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : "Unlock Vault"}
        </button>
      </div>
    </div>
  );
}
