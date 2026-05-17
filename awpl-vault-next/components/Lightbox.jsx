'use client'
import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

export default function Lightbox({ photos, index, onChange, onClose }) {
  const photo = photos[index]

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft'  && index > 0)              onChange(index - 1)
      if (e.key === 'ArrowRight' && index < photos.length-1) onChange(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, photos.length])

  function download() {
    const a = document.createElement('a')
    a.href = photo.url
    a.download = photo.name || 'photo.jpg'
    a.click()
  }

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.95)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Close */}
      <button onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center
                         border transition-all hover:border-accent"
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text2)' }}>
        <X size={18} />
      </button>

      {/* Image */}
      <img src={photo.url} alt={photo.name}
           className="max-w-full max-h-[75vh] object-contain rounded-xl"
           style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }} />

      {/* Meta */}
      <div className="mt-4 text-center">
        <p className="font-mono text-sm" style={{ color: 'var(--text2)' }}>{photo.name}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
          {photo.date} at {photo.time} — {index + 1} / {photos.length}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button onClick={download}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
                style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', color: 'var(--accent2)' }}>
          <Download size={14} /> Download
        </button>
        <button onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text2)' }}>
          <X size={14} /> Close
        </button>
      </div>

      {/* Prev / Next nav */}
      {index > 0 && (
        <button onClick={() => onChange(index - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center
                           border transition-all hover:scale-110"
                style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}>
          <ChevronLeft size={20} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button onClick={() => onChange(index + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center
                           border transition-all hover:scale-110"
                style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}>
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  )
}
