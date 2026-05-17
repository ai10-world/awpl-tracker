'use client'
import { useState } from 'react'
import { Delete } from 'lucide-react'
import { verifyPin } from '@/lib/storage'

const PIN_LENGTH = 4

// Number keypad rows
const KEYS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['',  '0','⌫'],
]

// Letters under each number (like a phone keypad)
const KEY_LETTERS = { '2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ' }

export default function LockScreen({ onUnlock }) {
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState(false)
  const [shake,   setShake]   = useState(false)

  function pressKey(key) {
    if (key === '⌫') {
      setPin(p => p.slice(0, -1))
      setError(false)
      return
    }
    if (key === '') return
    if (pin.length >= PIN_LENGTH) return

    const next = pin + key
    setPin(next)

    // Auto-verify when PIN is complete
    if (next.length === PIN_LENGTH) {
      setTimeout(() => checkPin(next), 150)
    }
  }

  function checkPin(attempt) {
    if (verifyPin(attempt)) {
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setPin('')
      setTimeout(() => { setError(false); setShake(false) }, 600)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6"
         style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(108,92,231,0.22) 0%, transparent 70%), var(--bg)' }}>

      {/* Vault emblem */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6
                       border-2 animate-glow-pulse ${shake ? 'animate-shake' : ''}`}
           style={{
             background:   'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(255,215,0,0.1))',
             borderColor:  error ? 'var(--red)' : 'rgba(255,215,0,0.3)',
           }}>
        🔐
      </div>

      {/* Title */}
      <h1 className="font-syne text-4xl font-black tracking-tight mb-1">
        AWPL<span className="text-gold-gradient">Vault</span>
      </h1>
      <p className="font-mono text-xs tracking-[3px] uppercase mb-8" style={{ color: 'var(--text3)' }}>
        ENTER YOUR PIN
      </p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div key={i}
               className="w-4 h-4 rounded-full border-2 transition-all duration-150"
               style={{
                 borderColor: error ? 'var(--red)'  : pin.length > i ? 'var(--gold)' : 'var(--border2)',
                 background:  error ? 'var(--red)'  : pin.length > i ? 'var(--gold)' : 'transparent',
                 boxShadow:   pin.length > i && !error ? '0 0 12px rgba(255,215,0,0.5)' : 'none',
               }} />
        ))}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-[280px] rounded-2xl p-4 border"
           style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>
        <div className="grid grid-cols-3 gap-3">
          {KEYS.flat().map((key, i) => (
            <button key={i}
                    onClick={() => pressKey(key)}
                    disabled={key === ''}
                    className={`rounded-xl flex flex-col items-center justify-center gap-0.5
                                min-h-[58px] font-syne font-bold text-xl
                                transition-all duration-100 active:scale-95 select-none
                                ${key === '' ? 'invisible' : 'cursor-pointer hover:scale-[1.03]'}`}
                    style={{
                      background:   key === '' ? 'transparent' : 'var(--bg3)',
                      border:       `1px solid ${key === '' ? 'transparent' : 'var(--border)'}`,
                      color:        key === '⌫' ? 'var(--text2)' : 'var(--text)',
                    }}>
              {key === '⌫' ? <Delete size={18} /> : key}
              {KEY_LETTERS[key] && (
                <span className="font-body font-normal text-[9px] tracking-[1.5px]"
                      style={{ color: 'var(--text3)' }}>
                  {KEY_LETTERS[key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-sm animate-fade-up" style={{ color: 'var(--red)' }}>
          ✕ Incorrect PIN — try again
        </p>
      )}
    </div>
  )
}
