// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/actions/auth";
import { Hash, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);
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
          <h1 className="font-display font-bold text-2xl mb-1">Forgot Password</h1>
          <p className="text-white/40 text-sm">
            Enter your AWPL ID and we&apos;ll send a reset link to your registered email.
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
            <div className="flex items-center justify-center gap-2 text-green-400 mb-3">
              <CheckCircle size={24} />
            </div>
            <p className="text-green-400 font-medium mb-2">Reset link sent!</p>
            <p className="text-white/40 text-sm mb-6">{success}</p>
            <p className="text-white/30 text-xs">
              Check your inbox and click the link to reset your password. Then come back and log in.
            </p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 mt-6 text-brand-400 hover:text-brand-300 text-sm transition-colors">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="text-xs text-white/25 mt-1">
                The reset link will be sent to your registered email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
