// app/auth/login/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { pinLogin, logIn } from "@/lib/actions/auth";
import { Hash, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"pin" | "full">("pin");
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...pin]; n[i] = v.slice(-1); setPin(n);
    if (v && i < 5) pinRefs.current[i + 1]?.focus();
  };
  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };
  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const n = [...pin]; p.split("").forEach((c, i) => { if (i < 6) n[i] = c; }); setPin(n);
    const next = n.findIndex((v) => !v); pinRefs.current[next === -1 ? 5 : next]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null);
    const filledPin = pin.filter(Boolean).join("");
    if (filledPin.length < 4) { setError("Please enter your PIN."); return; }
    const fd = new FormData(e.currentTarget); fd.set("pin", filledPin);
    setLoading(true);
    const result = mode === "pin" ? await pinLogin(fd) : await logIn(fd);
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--text-1)" }}>
          Welcome back
        </h2>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          {mode === "pin" ? "Sign in with your AWPL ID and PIN" : "Sign in with AWPL ID, password and PIN"}
        </p>
      </div>

      <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--surface-3)" }}>
        {(["pin", "full"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
            className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
            style={{ background: mode === m ? "var(--brand-500)" : "transparent", color: mode === m ? "white" : "var(--text-3)" }}>
            {m === "pin" ? "PIN Login" : "Password + PIN"}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-sm px-4 py-3 rounded-xl mb-5"
          style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>AWPL ID</label>
          <div className="relative">
            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
            <input name="awpl_id" type="text" required placeholder="Your AWPL ID" className="input-base pl-9 uppercase font-mono" />
          </div>
        </div>

        {mode === "full" && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
              <input name="password" type={showPassword ? "text" : "password"} required placeholder="Your password" className="input-base pl-9 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Security PIN</label>
            {mode === "pin" && <span className="text-xs" style={{ color: "var(--text-4)" }}>No password needed</span>}
          </div>
          <div className="flex gap-2" onPaste={handlePinPaste}>
            {pin.map((digit, i) => (
              <input key={i} ref={(el) => { pinRefs.current[i] = el; }}
                type="password" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKey(i, e)}
                className="w-full aspect-square text-center text-lg font-display font-bold rounded-xl transition-all outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${digit ? "rgba(255,115,10,0.4)" : "var(--border-2)"}`,
                  color: "var(--text-1)",
                  boxShadow: digit ? "0 0 0 3px rgba(255,115,10,0.08)" : "none",
                }} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 rounded-xl text-sm font-semibold">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <><span>Sign In</span><ArrowRight size={15} /></>}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5">
        <Link href="/auth/forgot-password" className="text-xs" style={{ color: "var(--text-3)" }}>Forgot password?</Link>
        <Link href="/auth/reset-pin" className="text-xs" style={{ color: "var(--text-3)" }}>Reset PIN</Link>
      </div>
      <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" style={{ color: "var(--brand-400)" }} className="font-medium">Create one</Link>
      </p>
    </div>
  );
}
