// app/auth/signup/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { User, Mail, Lock, Hash, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function SignUpPage() {
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
    if (filledPin.length < 4) { setError("Please enter at least 4 digits for your PIN."); return; }
    const formData = new FormData(e.currentTarget);
    formData.set("pin", filledPin);
    setLoading(true);
    const result = await signUp(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  const fields = [
    { name: "name", type: "text", placeholder: "Your full name", label: "Full Name", icon: User },
    { name: "awpl_id", type: "text", placeholder: "Your AWPL distributor ID", label: "AWPL ID", icon: Hash, mono: true, upper: true },
    { name: "email", type: "email", placeholder: "you@example.com", label: "Email", icon: Mail },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-7">
        <h1 className="font-display font-bold text-3xl mb-2" style={{ color: "var(--text-1)" }}>
          Create account
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Join with your AWPL ID to get started.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-sm rounded-xl px-4 py-3 mb-5 animate-fade-down"
          style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.name}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>{f.label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
                <input name={f.name} type={f.type} required placeholder={f.placeholder}
                  className={`input-base pl-9 ${f.mono ? "font-mono" : ""} ${f.upper ? "uppercase" : ""}`} />
              </div>
            </div>
          );
        })}

        {/* Password */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
            <input name="password" type={showPassword ? "text" : "password"} required minLength={8}
              placeholder="Min. 8 characters" className="input-base pl-9 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity opacity-40 hover:opacity-100"
              style={{ color: "var(--text-2)" }}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* PIN */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
            Security PIN{" "}
            <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(4–6 digits)</span>
          </label>
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
          <p className="text-xs mt-1.5" style={{ color: "var(--text-4)" }}>
            Used for daily login. Keep it safe.
          </p>
        </div>

        <button type="submit" disabled={loading}
          className="btn btn-primary w-full py-3 mt-2 text-sm font-semibold rounded-xl">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ color: "var(--brand-400)" }}
          className="font-medium hover:opacity-80 transition-opacity">
          Sign in
        </Link>
      </p>
    </div>
  );
}
