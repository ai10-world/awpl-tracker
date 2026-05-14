// components/team/member-list.tsx
"use client";

import { useState } from "react";
import { removeMember, updateMemberRole } from "@/lib/actions/team";
import { Users, Trash2, Edit2, Check, X, Loader2, Crown, Star } from "lucide-react";

const roleColors: Record<string, string> = {
  team_admin: "text-brand-400 bg-brand-500/10 border-brand-500/20",
  team_leader: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  member: "text-white/40 bg-white/5 border-white/10",
};

const roleLabels: Record<string, string> = {
  team_admin: "Team Admin",
  team_leader: "Leader",
  member: "Member",
};

const roleIcons: Record<string, any> = {
  team_admin: Crown,
  team_leader: Star,
  member: null,
};

export function MemberList({
  members,
  teamId,
  currentUserId,
  canManage,
  isAdmin,
}: {
  members: any[];
  teamId: string;
  currentUserId: string;
  canManage: boolean;
  isAdmin: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editRank, setEditRank] = useState(0);
  const [editCanAssign, setEditCanAssign] = useState(false);
  const [editCanView, setEditCanView] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setEditRole(m.role);
    setEditRank(m.rank || 0);
    setEditCanAssign(m.can_assign_tasks || false);
    setEditCanView(m.can_view_reports || false);
  };

  const saveEdit = async (m: any) => {
    setLoadingId(m.id);
    const fd = new FormData();
    fd.set("member_id", m.id);
    fd.set("role", editRole);
    fd.set("rank", String(editRank));
    fd.set("can_assign_tasks", String(editCanAssign));
    fd.set("can_view_reports", String(editCanView));
    await updateMemberRole(fd);
    setLoadingId(null);
    setEditingId(null);
  };

  const handleRemove = async (m: any) => {
    if (!confirm(`Remove ${m.profile.full_name} from this team?`)) return;
    setLoadingId(m.id);
    const fd = new FormData();
    fd.set("member_id", m.id);
    fd.set("profile_id", m.profile.id);
    fd.set("team_id", teamId);
    await removeMember(fd);
    setLoadingId(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-white/40" />
        <h3 className="font-display font-semibold text-sm text-white/80">
          Members ({members.length})
        </h3>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 border border-white/5 rounded-2xl text-white/25 text-sm">
          No members yet. Add someone using their AWPL ID.
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m: any) => {
            const RoleIcon = roleIcons[m.role];
            const isCurrentUser = m.profile.id === currentUserId;
            const isEditing = editingId === m.id;
            const isLoading = loadingId === m.id;

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/12 transition-all"
              >
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{m.profile.full_name}</div>
                        <div className="text-xs text-white/30 font-mono">{m.profile.awpl_id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(m)}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-white/40 border border-white/10 px-3 py-1.5 rounded-lg"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-white/30 mb-1 block">Role</label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="team_leader">Team Leader</option>
                          <option value="team_admin">Team Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-white/30 mb-1 block">Rank</label>
                        <input
                          type="number"
                          value={editRank}
                          onChange={(e) => setEditRank(parseInt(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editCanAssign}
                          onChange={(e) => setEditCanAssign(e.target.checked)}
                          className="accent-orange-500"
                        />
                        Can assign tasks
                      </label>
                      <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editCanView}
                          onChange={(e) => setEditCanView(e.target.checked)}
                          className="accent-orange-500"
                        />
                        Can view reports
                      </label>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center font-display font-semibold text-xs text-white/70">
                        {m.profile.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{m.profile.full_name}</span>
                          {isCurrentUser && (
                            <span className="text-xs text-white/25">(you)</span>
                          )}
                        </div>
                        <div className="text-xs text-white/30 font-mono">{m.profile.awpl_id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${roleColors[m.role]}`}>
                          {RoleIcon && <RoleIcon size={10} />}
                          {roleLabels[m.role]}
                        </span>
                        {m.rank > 0 && (
                          <div className="text-xs text-white/20 mt-0.5">Rank #{m.rank}</div>
                        )}
                      </div>

                      {canManage && !isCurrentUser && (
                        <>
                          <button
                            onClick={() => startEdit(m)}
                            className="text-white/20 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleRemove(m)}
                            disabled={isLoading}
                            className="text-red-400/30 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                          >
                            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
