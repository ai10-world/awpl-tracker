// components/team/team-header.tsx
"use client";

import { useState } from "react";
import { Users, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { updateTeam, deleteTeam } from "@/lib/actions/team";

export function TeamHeader({
  team,
  canManage,
  memberCount,
}: {
  team: any;
  canManage: boolean;
  memberCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set("team_id", team.id);
    fd.set("name", name);
    fd.set("description", description);
    await updateTeam(fd);
    setLoading(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set("team_id", team.id);
    await deleteTeam(fd);
  };

  return (
    <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-display font-bold text-brand-400 text-xl">
            {team.name?.[0]?.toUpperCase()}
          </div>
          <div>
            {editing ? (
              <div className="space-y-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500/50 w-64"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Description (optional)"
                  className="block bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50 w-64 resize-none"
                />
              </div>
            ) : (
              <>
                <h1 className="font-display font-bold text-2xl">{team.name}</h1>
                {team.description && (
                  <p className="text-white/40 text-sm mt-1">{team.description}</p>
                )}
              </>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
              <span>Admin: {team.admin?.full_name} ({team.admin?.awpl_id})</span>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs bg-brand-500 hover:bg-brand-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <X size={12} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
                {!showDelete ? (
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Sure?</span>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => setShowDelete(false)}
                      className="text-xs text-white/40 border border-white/10 px-3 py-1.5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
