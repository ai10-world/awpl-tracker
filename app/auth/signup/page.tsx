// app/auth/signup/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { User, Mail, Lock, Hash, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function SignUpPage() {
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
    const filledPin = pin.join("").trim();
    if (filledPin.length < 4) { setError("Please enter at least 4 digits for your PIN."); return; }
    const fd = new FormData(e.currentTarget); fd.set("pin", filledPin);
    setLoading(true);
    const result = await signUp(fd);
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  const fields = [
    { name: "name", label: "Full Name", icon: User, type: "text", placeholder: "Your full name" },
    { name: "awpl_id", label: "AWPL ID", icon: Hash, type: "text", placeholder: "Your AWPL distributor ID", mono: true, upper: true },
    { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@example.com" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--text-1)" }}>Create account</h2>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>Join with your AWPL ID to get started</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-sm px-4 py-3 rounded-xl mb-5"
          style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>{f.label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
                <input name={f.name} type={f.type} required placeholder={f.placeholder}
                  className={`input-base pl-9 ${f.mono ? "font-mono" : ""} ${f.upper ? "uppercase" : ""}`} />
              </div>
            </div>
          );
        })}

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
            <input name="password" type={showPassword ? "text" : "password"} required minLength={8}
              placeholder="Min. 8 characters" className="input-base pl-9 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Security PIN</label>
            <span className="text-xs" style={{ color: "var(--text-4)" }}>4–6 digits</span>
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
          <p className="text-xs mt-1.5" style={{ color: "var(--text-4)" }}>Used for daily login. Keep it safe.</p>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 rounded-xl text-sm font-semibold mt-2">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : <><span>Create Account</span><ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ color: "var(--brand-400)" }} className="font-medium">Sign in</Link>
      </p>
    </div>
  );
}
