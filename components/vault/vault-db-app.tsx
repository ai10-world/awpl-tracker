"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, LogOut, Download, Upload, FolderPlus, Copy, Edit2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getRankColor, RANKS } from "@/lib/vault/constants";
import { downloadJson } from "@/lib/vault/utils";
import { VaultToast } from "@/components/vault/toast";
import { AddModal } from "@/components/vault/modals/add-modal";
import { VaultLightbox } from "@/components/vault/lightbox";
import { VaultModal, DeleteModal } from "@/components/vault/modals/vault-modal";

function IDCard({ entry, vault, onEdit, onDelete, onPhotoClick }: any) {
  const addedDate = new Date(entry.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const rankColor = getRankColor(entry.rank);
  const photos = entry.photos || [];

  function copyId() {
    navigator.clipboard.writeText(entry.distId).catch(() => {});
  }

  return (
    <div className="id-card animate-fade-up">
      <div className="h-1 w-full" style={{ background: entry.colorHex }} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: entry.colorBg }}>
            {entry.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm truncate">{entry.name}</div>
            <div className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text3)" }}>
              {vault ? <span style={{ color: "var(--accent2)" }}>{vault.name}</span> : null}
              {vault ? " - " : ""}
              <span title={`Added: ${addedDate}`}>{addedDate}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {entry.rank && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: rankColor, borderColor: `${rankColor}55`, background: `${rankColor}18` }}>
                {entry.rank}
              </span>
            )}
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="card-action-btn hover:text-accent2" title="Edit">
                <Edit2 size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="card-action-btn hover:text-red" title="Delete">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs w-14 flex-shrink-0" style={{ color: "var(--text3)" }}>Dist. ID</span>
          <span className="font-mono text-xs font-semibold flex-1 truncate" style={{ color: "var(--text2)" }}>{entry.distId}</span>
          <button onClick={(e) => { e.stopPropagation(); copyId(); }} className="card-action-btn hover:text-green" title="Copy ID">
            <Copy size={12} />
          </button>
        </div>

        {photos.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {photos.slice(0, 3).map((p: any, i: number) => (
              <img key={i} src={p.url} alt={p.name} onClick={(e) => { e.stopPropagation(); onPhotoClick(i); }} className="w-14 h-10 object-cover rounded-lg border cursor-pointer transition-all hover:scale-105 hover:border-accent" style={{ borderColor: "var(--border)" }} />
            ))}
            {photos.length > 3 && (
              <div onClick={(e) => { e.stopPropagation(); onPhotoClick(3); }} className="w-14 h-10 rounded-lg border flex items-center justify-center text-xs cursor-pointer transition-all hover:border-accent" style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text3)" }}>
                +{photos.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .card-action-btn {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text3);
          background: transparent;
          border: none;
          transition: all 0.15s;
        }
        .card-action-btn:hover { background: var(--bg3); }
        .hover\\:text-accent2:hover { color: var(--accent2) !important; }
        .hover\\:text-red:hover { color: var(--red) !important; }
        .hover\\:text-green:hover { color: var(--green) !important; }
      `}</style>
    </div>
  );
}

export function VaultDbApp({
  profile,
  availableTeams,
  onLock,
}: {
  profile: any;
  availableTeams: Array<{ id: string; name: string; myRole: string; canViewVault: boolean }>;
  onLock: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [entries, setEntries] = useState<any[]>([]);
  const [vaults, setVaults] = useState<any[]>([]);
  const [activeVault, setActiveVault] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterRank, setFilterRank] = useState("");
  const [toast, setToast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showVault, setShowVault] = useState(false);
  const [lightbox, setLightbox] = useState<any>(null);

  const importRef = useRef<HTMLInputElement | null>(null);

  const teamMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of availableTeams) m[t.id] = t.name;
    return m;
  }, [availableTeams]);

  function notify(message: string, type = "success") {
    setToast({ message, type });
  }

  async function loadData() {
    setLoading(true);

    const [{ data: vaultRows, error: vaultErr }, { data: entryRows, error: entryErr }] = await Promise.all([
      supabase
        .from("awpl_vaults")
        .select("id,name,team_id,created_at,team:teams(id,name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("awpl_vault_entries")
        .select("id,vault_id,name,dist_id,rank,icon,color_hex,color_bg,color_name,photos,created_at,added_on")
        .order("created_at", { ascending: false }),
    ]);

    if (vaultErr || entryErr) {
      notify("Could not load vault data", "error");
      setLoading(false);
      return;
    }

    const mappedVaults = (vaultRows || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      teamId: v.team_id,
      teamName: v.team?.name || teamMap[v.team_id] || "Unknown Team",
      createdAt: new Date(v.created_at).getTime(),
    }));

    const mappedEntries = (entryRows || []).map((e: any) => ({
      id: e.id,
      vaultId: e.vault_id,
      name: e.name,
      distId: e.dist_id,
      rank: e.rank,
      icon: e.icon,
      colorHex: e.color_hex,
      colorBg: e.color_bg,
      colorName: e.color_name,
      photos: e.photos || [],
      createdAt: new Date(e.created_at).getTime(),
      _addedOn: e.added_on,
    }));

    setVaults(mappedVaults);
    setEntries(mappedEntries);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveVault(data: { name: string; teamId: string | null }) {
    if (data.teamId && !availableTeams.some((t) => t.id === data.teamId)) {
      notify("You are not allowed to create vault in that team", "error");
      return;
    }

    const { error } = await supabase.from("awpl_vaults").insert({
      owner_id: profile.id,
      name: data.name,
      team_id: data.teamId || null,
    });

    if (error) {
      notify(error.message || "Could not create vault", "error");
      return;
    }

    setShowVault(false);
    await loadData();
    notify(`Vault '${data.name}' created`);
  }

  async function handleSaveEntry(data: any) {
    if (editEntry) {
      const { error } = await supabase
        .from("awpl_vault_entries")
        .update({
          vault_id: data.vaultId,
          name: data.name,
          dist_id: data.distId,
          rank: data.rank || null,
          icon: data.icon,
          color_hex: data.colorHex,
          color_bg: data.colorBg,
          color_name: data.colorName,
          photos: data.photos || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", editEntry.id);

      if (error) {
        notify(error.message || "Could not update entry", "error");
        return;
      }

      notify("Entry updated");
    } else {
      const { error } = await supabase.from("awpl_vault_entries").insert({
        owner_id: profile.id,
        vault_id: data.vaultId,
        name: data.name,
        dist_id: data.distId,
        rank: data.rank || null,
        icon: data.icon,
        color_hex: data.colorHex,
        color_bg: data.colorBg,
        color_name: data.colorName,
        photos: data.photos || [],
      });

      if (error) {
        notify(error.message || "Could not add entry", "error");
        return;
      }

      notify("Distributor ID added");
    }

    setShowAdd(false);
    setEditEntry(null);
    await loadData();
  }

  async function handleDeleteEntry() {
    if (!deleteId) return;

    const { error } = await supabase.from("awpl_vault_entries").delete().eq("id", deleteId);
    if (error) {
      notify(error.message || "Could not delete entry", "error");
      return;
    }

    setDeleteId(null);
    await loadData();
    notify("Entry deleted", "info");
  }

  function handleExport() {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profile: {
        name: profile.full_name,
        distId: profile.awpl_id,
        role: profile.role,
      },
      vaults,
      entries,
    };

    const stamp = new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
    downloadJson(`awpl-vault-backup-${stamp}.json`, data);
    notify("Backup downloaded");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    try {
      const parsed = JSON.parse(text);
      const backupVaults = Array.isArray(parsed.vaults) ? parsed.vaults : [];
      const backupEntries = Array.isArray(parsed.entries) ? parsed.entries : [];

      if (!backupVaults.length && !backupEntries.length) {
        notify("Backup file is empty or invalid", "error");
        return;
      }

      const validTeamIds = new Set(availableTeams.map((t) => t.id));
      const vaultPayload = backupVaults
        .map((v: any) => ({
          id: v.id,
          owner_id: profile.id,
          name: v.name,
          team_id: v.teamId || null,
        }))
        .filter((v: any) => !v.team_id || validTeamIds.has(v.team_id));

      if (vaultPayload.length > 0) {
        const { error } = await supabase.from("awpl_vaults").upsert(vaultPayload, { onConflict: "id" });
        if (error) {
          notify(error.message || "Vault import failed", "error");
          return;
        }
      }

      if (backupEntries.length > 0) {
        const payload = backupEntries.map((it: any) => ({
          id: it.id,
          owner_id: profile.id,
          vault_id: it.vaultId,
          name: it.name,
          dist_id: it.distId,
          rank: it.rank || null,
          icon: it.icon,
          color_hex: it.colorHex,
          color_bg: it.colorBg,
          color_name: it.colorName,
          photos: it.photos || [],
        }));

        const { error } = await supabase.from("awpl_vault_entries").upsert(payload, { onConflict: "id" });
        if (error) {
          notify(error.message || "Entry import failed", "error");
          return;
        }
      }

      await loadData();
      notify("Backup restored");
    } catch {
      notify("Invalid backup file", "error");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  const displayed = entries
    .filter((x) => activeVault === null || x.vaultId === activeVault)
    .filter((x) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return x.name?.toLowerCase().includes(q) || x.distId?.toLowerCase().includes(q);
    })
    .filter((x) => !filterRank || x.rank === filterRank)
    .sort((a, b) => {
      if (sortBy === "date-desc") return b.createdAt - a.createdAt;
      if (sortBy === "date-asc") return a.createdAt - b.createdAt;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  const roleColor = profile?.role === "platform_admin"
    ? "#60a5fa"
    : profile?.role === "team_admin"
      ? "#fb923c"
      : "#a29bfe";

  return (
    <div className="vault-theme flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-40 flex items-center gap-3 px-5 py-3 border-b" style={{ background: "rgba(7,8,13,0.94)", borderColor: "var(--border)", backdropFilter: "blur(24px)" }}>
        <div className="font-display font-black text-xl tracking-tight flex-1">
          AWPL<span className="text-gold-gradient">Vault</span>
          <span className="ml-2 text-[10px] font-mono font-normal px-1.5 py-0.5 rounded align-middle" style={{ background: "var(--accent-bg)", color: "var(--accent2)", letterSpacing: "1px" }}>
            DB
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs" style={{ background: "var(--surface)", borderColor: "var(--border2)" }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: "linear-gradient(135deg, var(--accent), var(--gold))", color: "#000" }}>
            {profile.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="font-mono font-semibold tracking-wider" style={{ color: "var(--text)" }}>{profile.awpl_id}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border" style={{ color: roleColor, borderColor: `${roleColor}55`, background: `${roleColor}18` }}>
            {profile.role?.replace(/_/g, " ")}
          </span>
        </div>

        <button onClick={handleExport} title="Export Backup" className="hdr-btn" style={{ color: "var(--text2)" }}>
          <Download size={16} />
        </button>

        <button onClick={() => importRef.current?.click()} title="Import Backup" className="hdr-btn" style={{ color: "var(--text2)" }}>
          <Upload size={16} />
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        <button onClick={onLock} title="Lock Vault" className="hdr-btn" style={{ color: "var(--text2)" }}>
          <LogOut size={16} />
        </button>

        <style jsx>{`
          .hdr-btn {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            background: var(--surface);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }
          .hdr-btn:hover { border-color: var(--border2); color: var(--text) !important; }
        `}</style>
      </header>

      <div className="flex items-center gap-2 px-5 py-2.5 border-b overflow-x-auto" style={{ background: "var(--bg2)", borderColor: "var(--border)" }}>
        <button onClick={() => setActiveVault(null)} className={`vault-tab ${activeVault === null ? "active" : ""}`}>
          <span className="text-xs font-semibold">All</span>
          <span className="font-mono text-[10px]" style={{ color: "var(--text3)" }}>{entries.length}</span>
        </button>

        {vaults.map((v) => {
          const count = entries.filter((x) => x.vaultId === v.id).length;
          return (
            <button key={v.id} onClick={() => setActiveVault(v.id)} className={`vault-tab ${activeVault === v.id ? "active" : ""}`}>
              <span className="text-xs font-semibold truncate max-w-[90px]">{v.name}</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--text3)" }}>{v.teamName} - {count}</span>
            </button>
          );
        })}

        <button onClick={() => setShowVault(true)} className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-dashed transition-all hover:border-accent hover:text-accent2" style={{ borderColor: "var(--border2)", color: "var(--text3)" }}>
          <FolderPlus size={12} /> New
        </button>

        <style jsx>{`
          .vault-tab {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 1px;
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            border: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.18s;
            white-space: nowrap;
            background: var(--surface);
          }
          .vault-tab:hover { border-color: var(--border2); }
          .vault-tab.active { border-color: var(--accent); background: var(--accent-bg); }
          .vault-tab.active span:first-child { color: var(--accent2); }
        `}</style>
      </div>

      <div className="flex gap-2 px-5 py-3 border-b flex-wrap" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <div className="flex-1 min-w-[180px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text3)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or ID..." className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-all" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ctrl-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>

        <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)} className="ctrl-select">
          <option value="">All Ranks</option>
          {RANKS.map((r) => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>

        <button
          onClick={() => {
            if (!vaults.length) {
              notify("Create a vault first", "info");
              return;
            }
            setEditEntry(null);
            setShowAdd(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Plus size={15} /> Add ID
        </button>

        <style jsx>{`
          .ctrl-select {
            background: var(--surface);
            border: 1px solid var(--border);
            color: var(--text2);
            border-radius: 8px;
            padding: 0.45rem 0.8rem;
            font-size: 0.82rem;
            outline: none;
            cursor: pointer;
            font-family: inherit;
          }
          .ctrl-select:focus { border-color: var(--accent); color: var(--text); }
        `}</style>
      </div>

      <div className="flex items-center gap-4 px-5 py-2 border-b text-xs overflow-x-auto" style={{ borderColor: "var(--border)", color: "var(--text3)" }}>
        <Stat dot="#6c5ce7" label={`${displayed.length} entries`} />
        <Stat dot="#00cec9" label={`${displayed.filter((e) => e.photos?.length).length} with photos`} />
        <Stat dot="#ffd700" label={`${vaults.length} vault${vaults.length !== 1 ? "s" : ""}`} />
        <span className="ml-auto font-mono opacity-60">Stored in Supabase</span>
      </div>

      <main className="flex-1 p-5">
        {loading ? (
          <div className="card p-5 text-sm" style={{ color: "var(--text2)" }}>Loading vault data...</div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4 opacity-30">{entries.length > 0 ? "Search" : "Vault"}</div>
            <p className="text-base" style={{ color: "var(--text2)" }}>{entries.length > 0 ? "No entries found" : "No entries yet"}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text3)" }}>
              {entries.length > 0 ? "Try changing search or filters" : "Create a vault and add your first distributor"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
            {displayed.map((entry) => (
              <IDCard
                key={entry.id}
                entry={entry}
                vault={vaults.find((v) => v.id === entry.vaultId)}
                onEdit={() => {
                  setEditEntry(entry);
                  setShowAdd(true);
                }}
                onDelete={() => setDeleteId(entry.id)}
                onPhotoClick={(i: number) => setLightbox({ entry, index: i })}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <AddModal
          entry={editEntry}
          vaults={vaults}
          onSave={handleSaveEntry}
          onClose={() => {
            setShowAdd(false);
            setEditEntry(null);
          }}
        />
      )}

      {showVault && (
        <VaultModal
          teamOptions={[{ id: "", name: "Personal Vault" }, ...availableTeams.map((t) => ({ id: t.id, name: t.name }))]}
          onSave={handleSaveVault}
          onClose={() => setShowVault(false)}
        />
      )}

      {deleteId && (
        <DeleteModal
          entryName={entries.find((e) => e.id === deleteId)?.name ?? ""}
          onConfirm={handleDeleteEntry}
          onClose={() => setDeleteId(null)}
        />
      )}

      {lightbox && (
        <VaultLightbox
          photos={lightbox.entry.photos}
          index={lightbox.index}
          onChange={(i) => setLightbox((prev: any) => ({ ...prev, index: i }))}
          onClose={() => setLightbox(null)}
        />
      )}

      {toast && <VaultToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function Stat({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {label}
    </div>
  );
}
