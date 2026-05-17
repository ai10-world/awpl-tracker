'use client'
import { useState, useEffect } from 'react'
import { X, Upload, Trash2, Image } from 'lucide-react'
import { compressImage } from '@/lib/storage'
import { ICONS, COLORS, RANKS } from '@/lib/constants'

export default function AddModal({ entry, vaults, onSave, onClose }) {
  const isEdit = !!entry

  const [name,     setName]     = useState(entry?.name     ?? '')
  const [distId,   setDistId]   = useState(entry?.distId   ?? '')
  const [rank,     setRank]     = useState(entry?.rank      ?? '')
  const [vaultId,  setVaultId]  = useState(entry?.vaultId  ?? vaults[0]?.id ?? '')
  const [icon,     setIcon]     = useState(entry?.icon     ?? ICONS[0])
  const [color,    setColor]    = useState(entry?.colorHex  ? COLORS.find(c => c.hex === entry.colorHex) ?? COLORS[0] : COLORS[0])
  const [photos,   setPhotos]   = useState(entry?.photos   ?? [])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleFileSelect(files) {
    setLoading(true)
    const newPhotos = []
    for (const file of files) {
      try {
        const url = await compressImage(file)
        newPhotos.push({
          url,
          name: file.name,
          date: new Date().toLocaleDateString('en-IN'),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        })
      } catch { /* skip failed */ }
    }
    setPhotos(prev => [...prev, ...newPhotos])
    setLoading(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) handleFileSelect(files)
  }

  function removePhoto(i) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
  }

  function save() {
    if (!name.trim())   { setError('Name is required'); return }
    if (!distId.trim()) { setError('Distributor ID is required'); return }
    onSave({
      ...(isEdit ? entry : {}),
      name:      name.trim(),
      distId:    distId.trim().toUpperCase(),
      rank,
      vaultId,
      icon,
      colorHex:  color.hex,
      colorBg:   color.bg,
      colorName: color.name,
      photos,
    })
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.88)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="modal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border flex flex-col"
           style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b sticky top-0 z-10"
             style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background: color.bg }}>
            {icon}
          </div>
          <div>
            <h2 className="font-syne font-bold text-lg">
              {isEdit ? 'Edit Entry' : 'Add Distributor ID'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {name || 'New distributor'}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto btn-icon-sm">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Name + ID */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name *">
              <input value={name} onChange={e => { setName(e.target.value); setError('') }}
                     placeholder="Rajesh Kumar"
                     className="form-input" />
            </Field>
            <Field label="Distributor ID *">
              <input value={distId} onChange={e => { setDistId(e.target.value); setError('') }}
                     placeholder="AWPL123456"
                     className="form-input font-mono tracking-wider" />
            </Field>
          </div>

          {/* Vault + Rank */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Team Vault">
              <select value={vaultId} onChange={e => setVaultId(e.target.value)}
                      className="form-input">
                {vaults.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Rank">
              <select value={rank} onChange={e => setRank(e.target.value)}
                      className="form-input">
                <option value="">— Select Rank —</option>
                {RANKS.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Icon Picker */}
          <Field label="Icon">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border"
                 style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
              {ICONS.map(ic => (
                <button key={ic}
                        onClick={() => setIcon(ic)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center
                                    transition-all border ${icon === ic ? 'scale-110' : 'hover:scale-105'}`}
                        style={{
                          background:  icon === ic ? color.bg : 'var(--surface)',
                          borderColor: icon === ic ? color.hex : 'var(--border)',
                        }}>
                  {ic}
                </button>
              ))}
            </div>
          </Field>

          {/* Color Picker */}
          <Field label="Color Label">
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c.name}
                        onClick={() => setColor(c)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${color.hex === c.hex ? 'scale-125' : 'hover:scale-110'}`}
                        style={{
                          background:  c.hex,
                          borderColor: color.hex === c.hex ? '#fff' : 'transparent',
                        }} />
              ))}
            </div>
          </Field>

          {/* Photo Upload */}
          <Field label="ID Photos">
            <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                           transition-all hover:border-accent"
                 style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}
                 onClick={() => document.getElementById('photo-input').click()}
                 onDragOver={e => e.preventDefault()}
                 onDrop={handleDrop}>
              <input id="photo-input" type="file" multiple accept="image/*" className="hidden"
                     onChange={e => handleFileSelect(Array.from(e.target.files))} />
              <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text3)' }} />
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                {loading ? 'Compressing…' : 'Click or drag to upload'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                ID card, passbook, screenshots — auto-compressed
              </p>
            </div>

            {/* Photo previews */}
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p.url} alt={p.name}
                         className="w-16 h-12 object-cover rounded-lg border"
                         style={{ borderColor: 'var(--border)' }} />
                    <button onClick={() => removePhoto(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                                       flex items-center justify-center text-white opacity-0
                                       group-hover:opacity-100 transition-opacity"
                            style={{ background: 'var(--red)' }}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t sticky bottom-0"
             style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={save}    className="btn-primary flex-1">
            {isEdit ? '✓ Save Changes' : '+ Add Entry'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--text);
          border-radius: 8px;
          padding: 0.65rem 0.9rem;
          font-size: 0.88rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text3); }
        .btn-icon-sm {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--bg3);
          border: 1px solid var(--border);
          color: var(--text2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-icon-sm:hover { color: var(--red); border-color: rgba(255,107,107,0.3); }
        .btn-primary {
          background: var(--accent); color: #fff; border: none;
          border-radius: 8px; padding: 0.75rem 1.2rem;
          font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary {
          background: var(--surface2); color: var(--text2);
          border: 1px solid var(--border2); border-radius: 8px;
          padding: 0.75rem 1.2rem; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-secondary:hover { color: var(--text); border-color: var(--accent); }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
