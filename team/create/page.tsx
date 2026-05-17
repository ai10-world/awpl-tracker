// app/team/create/page.tsx
"use client";

import { useState } from "react";
import { createTeam } from "@/lib/actions/team";
import Link from "next/link";
import { ArrowLeft, Loader2, Users } from "lucide-react";

export default function CreateTeamPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createTeam(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center px-4 h-14 border-b"
        style={{ borderColor: "var(--border-1)", background: "var(--surface-1)" }}>
        <Link href="/team" className="flex items-center gap-2 text-sm"
          style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={16} /> Teams
        </Link>
      </div>

      <div className="lg:ml-60 pt-0 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">

          <Link href="/team"
            className="hidden lg:flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: "var(--text-3)" }}>
            <ArrowLeft size={15} /> Back to Teams
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(255,115,10,0.1)", border: "1px solid rgba(255,115,10,0.2)" }}>
              <Users size={22} style={{ color: "var(--brand-400)" }} />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1"
              style={{ color: "var(--text-1)" }}>
              Create a Team
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              You will automatically become the Team Admin.
            </p>
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl mb-5"
              style={{ background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                Team Name *
              </label>
              <input name="name" type="text" required
                placeholder="e.g. Kanpur Sales Team"
                className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                Description <span style={{ color: "var(--text-4)" }}>(optional)</span>
              </label>
              <textarea name="description" rows={3}
                placeholder="What is this team about?"
                className="input-base resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="btn btn-primary w-full py-3 text-sm font-semibold">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Creating…</>
                : "Create Team"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
