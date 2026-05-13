// app/auth/login/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { logIn } from "@/lib/actions/auth";
import { Hash, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
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
    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newPin = [...pin];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newPin[i] = char;
    });
    setPin(newPin);
    const nextEmpty = newPin.findIndex((v) => !v);
    pinRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const filledPin = pin.filter(Boolean).join("");
    if (filledPin.length < 4) {
      setError("Please enter your PIN.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("pin", filledPin);

    setLoading(true);
    const result = await logIn(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-8 border border-white/8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm">
            Sign in with your AWPL ID, password and PIN.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AWPL ID */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              AWPL ID
            </label>
            <div className="relative">
              <Hash
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                name="awpl_id"
                type="text"
                required
                placeholder="Your AWPL distributor ID"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 focus:bg-white/8 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 focus:bg-white/8 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              Security PIN
            </label>
            <div className="flex gap-2" onPaste={handlePinPaste}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    pinRefs.current[i] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  className="w-full aspect-square text-center bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-500/50 focus:bg-white/8 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
