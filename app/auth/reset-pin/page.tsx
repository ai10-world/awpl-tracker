// app/auth/reset-pin/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { resetPin } from "@/lib/actions/auth";
import { Hash, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ResetPinPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const newPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinInput = (
    index: number,
    value: string,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...arr];
    updated[index] = value.slice(-1);
    setArr(updated);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    arr: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !arr[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const newPinStr = newPin.filter(Boolean).join("");
    const confirmPinStr = confirmPin.filter(Boolean).join("");

    if (newPinStr.length < 4) { setError("Please enter at least 4 digits for new PIN."); return; }
    if (newPinStr !== confirmPinStr) { setError("PINs do not match."); return; }

    const formData = new FormData(e.currentTarget);
    formData.set("new_pin", newPinStr);
    formData.set("confirm_pin", confirmPinStr);

    setLoading(true);
    const result = await resetPin(formData);
    setLoading(false);

    if (result?.error) setError(result.error);
    if (result?.success) setSuccess(result.success);
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-8 border border-white/8">
        <Link href="/auth/login" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm mb-6">
          <ArrowLeft size={15} /> Back to Login
        </Link>

        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl mb-1">Reset PIN</h1>
          <p className="text-white/40 text-sm">
            Verify your identity with your password, then set a new PIN.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-medium mb-2">PIN Reset Successfully!</p>
            <p className="text-white/40 text-sm mb-6">{success}</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm px-6 py-2.5 rounded-full transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* AWPL ID */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">AWPL ID</label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="awpl_id"
                  type="text"
                  required
                  placeholder="Your AWPL ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 transition-all font-mono uppercase"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Current Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Your current password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">New PIN <span className="text-white/25 font-normal">(4–6 digits)</span></label>
              <div className="flex gap-2">
                {newPin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { newPinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinInput(i, e.target.value, newPin, setNewPin, newPinRefs)}
                    onKeyDown={(e) => handlePinKeyDown(i, e, newPin, newPinRefs)}
                    className="w-full aspect-square text-center bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-500/50 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Confirm New PIN</label>
              <div className="flex gap-2">
                {confirmPin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { confirmPinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinInput(i, e.target.value, confirmPin, setConfirmPin, confirmPinRefs)}
                    onKeyDown={(e) => handlePinKeyDown(i, e, confirmPin, confirmPinRefs)}
                    className={`w-full aspect-square text-center bg-white/5 border rounded-xl text-sm text-white font-mono focus:outline-none transition-all ${
                      confirmPin.filter(Boolean).length > 0 && newPin.join("") !== confirmPin.join("")
                        ? "border-red-500/40"
                        : "border-white/10 focus:border-brand-500/50"
                    }`}
                  />
                ))}
              </div>
              {confirmPin.filter(Boolean).length === newPin.filter(Boolean).length &&
                confirmPin.filter(Boolean).length >= 4 &&
                newPin.join("") !== confirmPin.join("") && (
                <p className="text-xs text-red-400 mt-1">PINs do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting…</> : "Reset PIN"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
