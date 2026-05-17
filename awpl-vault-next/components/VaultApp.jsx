'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, Plus, LogOut, Settings, Download, Upload,
  Copy, Edit2, Trash2, FolderPlus, ChevronDown,
} from 'lucide-react'

import Toast     from '@/components/Toast'
import AddModal  from '@/components/modals/AddModal'
import Lightbox  from '@/components/Lightbox'
import { VaultModal, DeleteModal } from '@/components/modals/VaultModal'

import {
  getProfile, getVaults, saveVaults,
  getEntries, saveEntries,
  exportData, importData, getStorageUsageMB,
} from '@/lib/storage'
import { RANKS, COLORS, getRankColor } from '@/lib/constants'

// ─── ID CARD ──────────────────────────────────────────────────────────────────
function IDCard({ entry, vault, onEdit, onDelete, onPhotoClick }) {
  // Hidden date — stored in data but shown only as tiny, subtle text
  const addedDate = new Date(entry.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  const rankColor = getRankColor(entry.rank)
  const photos    = entry.photos || []

  function copyId() {
    navigator.clipboard.writeText(entry.distId).catch(() => {})
  }

  return (
    <div className="id-card animate-fade-up">
      {/* Color bar */}
      <div className="h-1 w-full" style={{ background: entry.colorHex }} />

      <div className="p-4">
        {/* Card header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
               style={{ background: entry.colorBg }}>
            {entry.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-syne font-bold text-sm truncate">{entry.name}</div>
            {/* The date is secretly stored — shown very subtly */}
            <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text3)' }}>
              {vault ? <span style={{ color: 'var(--accent2)' }}>{vault.name}</span> : null}
              {vault ? ' · ' : ''}
              <span title={`Added: ${addedDate}`}>{addedDate}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {entry.rank && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: rankColor, borderColor: rankColor + '55', background: rankColor + '18' }}>
                {entry.rank}
              </span>
            )}
            <div className="flex gap-1">
              <button onClick={e => { e.stopPropagation(); onEdit() }}
                      className="card-action-btn hover:text-accent2" title="Edit">
                <Edit2 size={12} />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete() }}
                      className="card-action-btn hover:text-red" title="Delete">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Dist ID row */}
        <div className="flex items-center gap-2 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs w-14 flex-shrink-0" style={{ color: 'var(--text3)' }}>Dist. ID</span>
          <span className="font-mono text-xs font-semibold flex-1 truncate" style={{ color: 'var(--text2)' }}>
            {entry.distId}
          </span>
          <button onClick={e => { e.stopPropagation(); copyId() }}
                  className="card-action-btn hover:text-green" title="Copy ID">
            <Copy size={12} />
          </button>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {photos.slice(0, 3).map((p, i) => (
              <img key={i} src={p.url} alt={p.name}
                   onClick={e => { e.stopPropagation(); onPhotoClick(i) }}
                   className="w-14 h-10 object-cover rounded-lg border cursor-pointer
                              transition-all hover:scale-105 hover:border-accent"
                   style={{ borderColor: 'var(--border)' }} />
            ))}
            {photos.length > 3 && (
              <div onClick={e => { e.stopPropagation(); onPhotoClick(3) }}
                   className="w-14 h-10 rounded-lg border flex items-center justify-center
                              text-xs cursor-pointer transition-all hover:border-accent"
                   style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text3)' }}>
                +{photos.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .card-action-btn {
          width: 22px; height: 22px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text3); background: transparent;
          border: none; transition: all 0.15s;
        }
        .card-action-btn:hover { background: var(--bg3); }
        .hover\\:text-accent2:hover { color: var(--accent2) !important; }
        .hover\\:text-red:hover    { color: var(--red) !important; }
        .hover\\:text-green:hover  { color: var(--green) !important; }
      `}</style>
    </div>
  )
}

// ─── MAIN VAULT APP ───────────────────────────────────────────────────────────
export default function VaultApp({ onLock }) {
  const [entries,      setEntries]      = useState([])
  const [vaults,       setVaults]       = useState([])
  const [profile,      setProfile]      = useState(null)
  const [activeVault,  setActiveVault]  = useState(null)  // null = All
  const [search,       setSearch]       = useState('')
  const [sortBy,       setSortBy]       = useState('date-desc')
  const [filterRank,   setFilterRank]   = useState('')
  const [toast,        setToast]        = useState(null)

  // Modal states
  const [showAdd,    setShowAdd]    = useState(false)
  const [editEntry,  setEditEntry]  = useState(null)
  const [deleteId,   setDeleteId]   = useState(null)
  const [showVault,  setShowVault]  = useState(false)
  const [lightbox,   setLightbox]   = useState(null)  // { entryId, index }

  const importRef = useRef()

  // Load from localStorage
  useEffect(() => {
    setEntries(getEntries())
    setVaults(getVaults())
    setProfile(getProfile())
  }, [])

  // Helper to show toast
  function notify(message, type = 'success') {
    setToast({ message, type })
  }

  // ── Save helpers ──────────────────────────────────────────────────────────
  function persistEntries(newEntries) {
    saveEntries(newEntries)
    setEntries(newEntries)
  }

  function handleSaveEntry(data) {
    if (editEntry) {
      // Edit mode
      const updated = entries.map(e => e.id === editEntry.id ? { ...editEntry, ...data } : e)
      persistEntries(updated)
      notify('✓ Entry updated')
    } else {
      // Add mode
      const newEntry = {
        ...data,
        id:        'entry_' + Date.now(),
        createdAt: Date.now(),
        _addedOn:  new Date().toISOString(), // secret timestamp
      }
      persistEntries([newEntry, ...entries])
      notify('✓ Distributor ID added')
    }
    setShowAdd(false)
    setEditEntry(null)
  }

  function handleDeleteEntry() {
    const updated = entries.filter(e => e.id !== deleteId)
    persistEntries(updated)
    setDeleteId(null)
    notify('Entry deleted', 'info')
  }

  function handleSaveVault(data) {
    const newVault = { id: 'vault_' + Date.now(), ...data, createdAt: Date.now() }
    const updated  = [...vaults, newVault]
    saveVaults(updated)
    setVaults(updated)
    setShowVault(false)
    notify(`✓ Vault "${data.name}" created`)
  }

  // ── Import backup ─────────────────────────────────────────────────────────
  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      if (importData(ev.target.result)) {
        setEntries(getEntries())
        setVaults(getVaults())
        notify('✓ Backup restored successfully')
      } else {
        notify('Invalid backup file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Filtered + sorted entries ─────────────────────────────────────────────
  const displayed = entries
    .filter(e => activeVault === null || e.vaultId === activeVault)
    .filter(e => {
      if (!search) return true
      const q = search.toLowerCase()
      return e.name?.toLowerCase().includes(q) || e.distId?.toLowerCase().includes(q)
    })
    .filter(e => !filterRank || e.rank === filterRank)
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.createdAt - a.createdAt
      if (sortBy === 'date-asc')  return a.createdAt - b.createdAt
      if (sortBy === 'name-asc')  return a.name.localeCompare(b.name)
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      return 0
    })

  const rankColor = profile?.rank ? getRankColor(profile.rank) : 'var(--text3)'

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-5 py-3 border-b"
              style={{ background: 'rgba(7,8,13,0.94)', borderColor: 'var(--border)', backdropFilter: 'blur(24px)' }}>
        <div className="font-syne font-black text-xl tracking-tight flex-1">
          AWPL<span className="text-gold-gradient">Vault</span>
          <span className="ml-2 text-[10px] font-mono font-normal px-1.5 py-0.5 rounded align-middle"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent2)', letterSpacing: '1px' }}>
            LOCAL
          </span>
        </div>

        {/* User pill */}
        {profile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs"
               style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                 style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))', color: '#000' }}>
              {profile.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="font-mono font-semibold tracking-wider" style={{ color: 'var(--text)' }}>
              {profile.distId}
            </span>
            {profile.rank && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                    style={{ color: rankColor, borderColor: rankColor + '55', background: rankColor + '18' }}>
                {profile.rank}
              </span>
            )}
          </div>
        )}

        {/* Export button */}
        <button onClick={() => { exportData(); notify('📦 Backup downloaded') }}
                title="Export Backup"
                className="hdr-btn" style={{ color: 'var(--text2)' }}>
          <Download size={16} />
        </button>

        {/* Import button */}
        <button onClick={() => importRef.current?.click()} title="Import Backup"
                className="hdr-btn" style={{ color: 'var(--text2)' }}>
          <Upload size={16} />
        </button>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

        {/* Lock */}
        <button onClick={onLock} title="Lock Vault"
                className="hdr-btn" style={{ color: 'var(--text2)' }}>
          <LogOut size={16} />
        </button>

        <style jsx>{`
          .hdr-btn {
            width: 34px; height: 34px; border-radius: 8px;
            background: var(--surface); border: 1px solid var(--border);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s;
          }
          .hdr-btn:hover { border-color: var(--border2); color: var(--text) !important; }
        `}</style>
      </header>

      {/* ── VAULT TABS ── */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b overflow-x-auto scroll-snap-none"
           style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {/* "All" tab */}
        <button onClick={() => setActiveVault(null)}
                className={`vault-tab ${activeVault === null ? 'active' : ''}`}>
          <span className="text-xs font-semibold">🏠 All</span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>{entries.length}</span>
        </button>

        {vaults.map(v => {
          const count = entries.filter(e => e.vaultId === v.id).length
          return (
            <button key={v.id}
                    onClick={() => setActiveVault(v.id)}
                    className={`vault-tab ${activeVault === v.id ? 'active' : ''}`}>
              <span className="text-xs font-semibold truncate max-w-[90px]">{v.name}</span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--text3)' }}>
                {v.teamId} · {count}
              </span>
            </button>
          )
        })}

        <button onClick={() => setShowVault(true)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs
                           border border-dashed transition-all hover:border-accent hover:text-accent2"
                style={{ borderColor: 'var(--border2)', color: 'var(--text3)' }}>
          <FolderPlus size={12} /> New
        </button>

        <style jsx>{`
          .vault-tab {
            flex-shrink: 0; display: flex; flex-direction: column;
            align-items: flex-start; gap: 1px;
            padding: 0.4rem 0.8rem; border-radius: 8px;
            border: 1px solid var(--border); cursor: pointer;
            transition: all 0.18s; white-space: nowrap;
            background: var(--surface);
          }
          .vault-tab:hover { border-color: var(--border2); }
          .vault-tab.active {
            border-color: var(--accent);
            background: var(--accent-bg);
          }
          .vault-tab.active span:first-child { color: var(--accent2); }
        `}</style>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex gap-2 px-5 py-3 border-b flex-wrap"
           style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search name or ID…"
                 className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-all"
                 style={{
                   background: 'var(--surface)', border: '1px solid var(--border)',
                   color: 'var(--text)',
                 }}
                 onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                 onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="ctrl-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A→Z</option>
          <option value="name-desc">Name Z→A</option>
        </select>

        {/* Filter by rank */}
        <select value={filterRank} onChange={e => setFilterRank(e.target.value)}
                className="ctrl-select">
          <option value="">All Ranks</option>
          {RANKS.map(r => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>

        {/* Add button */}
        <button onClick={() => { setEditEntry(null); setShowAdd(true) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                           border-none cursor-pointer transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--accent)', color: '#fff' }}>
          <Plus size={15} /> Add ID
        </button>

        <style jsx>{`
          .ctrl-select {
            background: var(--surface); border: 1px solid var(--border);
            color: var(--text2); border-radius: 8px;
            padding: 0.45rem 0.8rem; font-size: 0.82rem; outline: none;
            cursor: pointer; font-family: inherit;
          }
          .ctrl-select:focus { border-color: var(--accent); color: var(--text); }
        `}</style>
      </div>

      {/* ── STATS BAR ── */}
      <div className="flex items-center gap-4 px-5 py-2 border-b text-xs overflow-x-auto"
           style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
        <Stat dot="#6c5ce7" label={`${displayed.length} entries`} />
        <Stat dot="#00cec9" label={`${displayed.filter(e => e.photos?.length).length} with photos`} />
        <Stat dot="#ffd700" label={`${vaults.length} vault${vaults.length !== 1 ? 's' : ''}`} />
        <span className="ml-auto font-mono opacity-60">
          Storage: {getStorageUsageMB()} MB
        </span>
      </div>

      {/* ── CARDS GRID ── */}
      <main className="flex-1 p-5">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4 opacity-30">📋</div>
            <p className="text-base" style={{ color: 'var(--text2)' }}>No entries found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
              {entries.length > 0 ? 'Try adjusting your search or filters' : 'Click "+ Add ID" to add your first distributor'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3"
               style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
            {displayed.map(entry => (
              <IDCard
                key={entry.id}
                entry={entry}
                vault={vaults.find(v => v.id === entry.vaultId)}
                onEdit={() => { setEditEntry(entry); setShowAdd(true) }}
                onDelete={() => setDeleteId(entry.id)}
                onPhotoClick={i => setLightbox({ entry, index: i })}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {showAdd && (
        <AddModal
          entry={editEntry}
          vaults={vaults}
          onSave={handleSaveEntry}
          onClose={() => { setShowAdd(false); setEditEntry(null) }}
        />
      )}

      {showVault && (
        <VaultModal
          onSave={handleSaveVault}
          onClose={() => setShowVault(false)}
        />
      )}

      {deleteId && (
        <DeleteModal
          entryName={entries.find(e => e.id === deleteId)?.name ?? ''}
          onConfirm={handleDeleteEntry}
          onClose={() => setDeleteId(null)}
        />
      )}

      {lightbox && (
        <Lightbox
          photos={lightbox.entry.photos}
          index={lightbox.index}
          onChange={i => setLightbox(prev => ({ ...prev, index: i }))}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

// Small stat item
function Stat({ dot, label }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {label}
    </div>
  )
}
