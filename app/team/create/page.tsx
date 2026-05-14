// app/team/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTeam } from "@/lib/actions/team";
import { ArrowLeft, Loader2, Users } from "lucide-react";

export default function CreateTeamPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="min-h-screen bg-[#080808] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <img src="/logo.png" alt="Asclepius" className="h-7 w-auto" />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-12">
        <Link href="/team" className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Back to Teams
        </Link>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
            <Users size={22} className="text-brand-400" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-1">Create a Team</h1>
          <p className="text-white/40 text-sm">You will automatically become the Team Admin.</p>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Team Name *</label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Kanpur Sales Team"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Description (optional)</label>
            <textarea
              name="description"
              rows={3}
              placeholder="What is this team about?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500/50 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : "Create Team"}
          </button>
        </form>
      </main>
    </div>
  );
}
