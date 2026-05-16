// app/auth/login/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { pinLogin, logIn } from "@/lib/actions/auth";
import { Hash, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"pin" | "full">("pin");
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < 5) pinRefs.current[index + 1]?.focus();
  };
  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) pinRefs.current[index - 1]?.focus();
  };
  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newPin = [...pin];
    pasted.split("").forEach((char, i) => { if (i < 6) newPin[i] = char; });
    setPin(newPin);
    const nextEmpty = newPin.findIndex((v) => !v);
    pinRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const filledPin = pin.filter(Boolean).join("");
    if (filledPin.length < 4) { setError("Please enter your PIN."); return; }
    const formData = new FormData(e.currentTarget);
    formData.set("pin", filledPin);
    setLoading(true);
    const result = mode === "pin" ? await pinLogin(formData) : await logIn(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--text-1)" }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          {mode === "pin" ? "Sign in with AWPL ID + PIN" : "Sign in with AWPL ID + Password + PIN"}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--surface-3)" }}>
        {(["pin", "full"] as const).map((m) => (
          <button key={m} type="button"
            onClick={() => { setMode(m); setError(null); }}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: mode === m ? "var(--brand-500)" : "transparent",
              color: mode === m ? "white" : "var(--text-3)",
            }}>
            {m === "pin" ? "PIN Login" : "Password + PIN"}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-sm rounded-xl px-4 py-3 mb-5 animate-fade-down"
          style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* AWPL ID */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>AWPL ID</label>
          <div className="relative">
            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
            <input name="awpl_id" type="text" required placeholder="Your AWPL ID"
              className="input-base pl-9 uppercase font-mono" />
          </div>
        </div>

        {/* Password — full mode only */}
        {mode === "full" && (
          <div className="animate-fade-down">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
              <input name="password" type={showPassword ? "text" : "password"} required placeholder="Your password"
                className="input-base pl-9 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-4)" }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* PIN */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Security PIN</label>
          <div className="flex gap-2" onPaste={handlePinPaste}>
            {pin.map((digit, i) => (
              <input key={i}
                ref={(el) => { pinRefs.current[i] = el; }}
                type="password" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                className="flex-1 aspect-square text-center font-mono text-lg font-bold rounded-xl border transition-all outline-none"
                style={{
                  background: digit ? "rgba(255,115,10,0.08)" : "var(--surface-2)",
                  borderColor: digit ? "rgba(255,115,10,0.4)" : "var(--border-2)",
                  color: "var(--text-1)",
                  boxShadow: digit ? "0 0 0 3px rgba(255,115,10,0.08)" : "none",
                }}
              />
            ))}
          </div>
          {mode === "pin" && (
            <p className="text-xs mt-1.5" style={{ color: "var(--text-4)" }}>
              Daily login — no password needed
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="btn btn-primary w-full py-3 mt-2 text-sm font-semibold rounded-xl">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign In"}
        </button>
      </form>

      {/* Links */}
      <div className="flex items-center justify-between mt-5">
        <Link href="/auth/forgot-password"
          className="text-xs transition-colors hover:opacity-100 opacity-60"
          style={{ color: "var(--brand-400)" }}>
          Forgot password?
        </Link>
        <Link href="/auth/reset-pin"
          className="text-xs transition-colors hover:opacity-100 opacity-60"
          style={{ color: "var(--brand-400)" }}>
          Reset PIN
        </Link>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
        No account?{" "}
        <Link href="/auth/signup" style={{ color: "var(--brand-400)" }}
          className="font-medium hover:opacity-80 transition-opacity">
          Create one
        </Link>
      </p>
    </div>
  );
}
