// components/team/add-member-form.tsx
"use client";

import { useState } from "react";
import { addMember } from "@/lib/actions/team";
import { UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function AddMemberForm({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("team_id", teamId);
    const result = await addMember(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    if (result?.success) {
      setSuccess(result.success);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
      <div className="flex items-center gap-2 mb-5">
        <UserPlus size={16} className="text-brand-400" />
        <h3 className="font-display font-semibold text-sm">Add Member</h3>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mb-4">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 mb-4">
          <CheckCircle size={13} className="flex-shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-white/40 mb-1">AWPL ID *</label>
          <input
            name="awpl_id"
            type="text"
            required
            placeholder="Member's AWPL ID"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-all font-mono"
          />
          <p className="text-xs text-white/20 mt-1">Member must have an account first</p>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1">Role *</label>
          <select
            name="role"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all"
          >
            <option value="member">Member</option>
            <option value="team_leader">Team Leader</option>
            <option value="team_admin">Team Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1">Rank</label>
          <input
            name="rank"
            type="number"
            min="0"
            max="100"
            defaultValue="0"
            placeholder="0"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-all"
          />
          <p className="text-xs text-white/20 mt-1">Lower = higher rank (0 is top)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Adding…</> : <><UserPlus size={14} /> Add Member</>}
        </button>
      </form>
    </div>
  );
}
