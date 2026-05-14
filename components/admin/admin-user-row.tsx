// components/admin/admin-user-row.tsx
"use client";

import { useState } from "react";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Loader2, Shield, Crown, Star, User } from "lucide-react";

const roleColors: Record<string, string> = {
  platform_admin: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  team_admin: "text-brand-400 bg-brand-500/10 border-brand-500/20",
  team_leader: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  member: "text-white/40 bg-white/5 border-white/10",
};

const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  team_admin: "Team Admin",
  team_leader: "Leader",
  member: "Member",
};

export function AdminUserRow({ user, currentUserId }: { user: any; currentUserId: string }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const isCurrentUser = user.id === currentUserId;

  const handleRoleChange = async (newRole: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: newRole }),
    });
    if (res.ok) setRole(newRole);
    setLoading(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-white/12 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center font-display font-semibold text-xs text-white/60">
          {user.full_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-medium flex items-center gap-1.5">
            {user.full_name}
            {isCurrentUser && <span className="text-xs text-white/25">(you)</span>}
          </div>
          <div className="text-xs text-white/30 font-mono">{user.awpl_id}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {editing && !isCurrentUser ? (
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={loading}
            className="bg-[#1a1a1a] border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="member">Member</option>
            <option value="team_leader">Team Leader</option>
            <option value="team_admin">Team Admin</option>
            <option value="platform_admin">Platform Admin</option>
          </select>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[role]}`}>
            {roleLabels[role]}
          </span>
        )}

        {!isCurrentUser && (
          loading ? (
            <Loader2 size={13} className="animate-spin text-white/30" />
          ) : (
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-white/25 hover:text-white/60 transition-colors border border-white/10 px-2 py-1 rounded-lg"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          )
        )}
      </div>
    </div>
  );
}
