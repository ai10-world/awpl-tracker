'use client'
import { useState } from 'react'
import { Eye, EyeOff, ChevronRight } from 'lucide-react'
import { setPin, saveProfile, saveVaults } from '@/lib/storage'
import { RANKS } from '@/lib/constants'

export default function ProfileSetup({ onComplete }) {
  const [step,       setStep]       = useState(1)   // 1 = Profile, 2 = Set PIN
  const [name,       setName]       = useState('')
  const [distId,     setDistId]     = useState('')
  const [rank,       setRank]       = useState('')
  const [pin,        setPin_]       = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin,    setShowPin]    = useState(false)
  const [error,      setError]      = useState('')

  function goToPin() {
    if (!name.trim())   { setError('Please enter your name'); return }
    if (!distId.trim()) { setError('Please enter your Distributor ID'); return }
    if (!rank)          { setError('Please select your rank'); return }
    setError('')
    setStep(2)
  }

  function finish() {
    if (pin.length < 4)          { setError('PIN must be at least 4 digits'); return }
    if (pin !== confirmPin)      { setError('PINs do not match'); return }
    if (!/^\d+$/.test(pin))      { setError('PIN must be numbers only'); return }

    // Save profile + PIN + auto-create default vault
    saveProfile({ name: name.trim(), distId: distId.trim().toUpperCase(), rank })
    setPin(pin)
    saveVaults([{
      id:        'vault_' + Date.now(),
      name:      'My Team',
      teamId:    distId.trim().toUpperCase(),
      createdAt: Date.now(),
    }])
    onComplete()
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-y-auto"
         style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(108,92,231,0.2) 0%, transparent 70%), var(--bg)' }}>

      {/* Logo */}
      <div className="font-syne text-3xl font-black tracking-tight mb-2">
        AWPL<span className="text-gold-gradient">Vault</span>
      </div>
      <p className="font-mono text-xs tracking-[2px] uppercase mb-8" style={{ color: 'var(--text3)' }}>
        FIRST TIME SETUP
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-syne
                            transition-all duration-300`}
                 style={{
                   background: step >= s ? 'var(--accent)' : 'var(--surface2)',
                   color:      step >= s ? '#fff' : 'var(--text3)',
                 }}>
              {s}
            </div>
            {s < 2 && <div className="w-8 h-0.5 rounded" style={{ background: step > s ? 'var(--accent)' : 'var(--border2)' }} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl p-6 border flex flex-col gap-4"
           style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}>

        {step === 1 ? (
          <>
            <div>
              <h2 className="font-syne text-xl font-bold mb-1">Your AWPL Profile</h2>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Enter your details once — stored only on this device.
              </p>
            </div>

            <Field label="Your Name *">
              <input value={name} onChange={e => { setName(e.target.value); setError('') }}
                     placeholder="e.g. Rajesh Kumar"
                     className="input-base" />
            </Field>

            <Field label="Distributor ID *">
              <input value={distId} onChange={e => { setDistId(e.target.value); setError('') }}
                     placeholder="e.g. AWPL123456"
                     className="input-base font-mono tracking-wider" />
            </Field>

            <Field label="Your Rank *">
              <div className="flex flex-wrap gap-2">
                {RANKS.map(r => (
                  <button key={r.name}
                          onClick={() => { setRank(r.name); setError('') }}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border-[1.5px] transition-all"
                          style={{
                            color:       r.color,
                            borderColor: rank === r.name ? r.color : 'var(--border)',
                            background:  rank === r.name ? r.color + '22' : 'var(--bg3)',
                          }}>
                    {r.name}
                  </button>
                ))}
              </div>
            </Field>

            {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}

            <button onClick={goToPin}
                    className="btn-primary flex items-center justify-center gap-2 mt-2">
              Next — Set PIN <ChevronRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="font-syne text-xl font-bold mb-1">Set Your Vault PIN</h2>
              <p className="text-sm" style={{ color: 'var(--text2)' }}>
                Use a 4–6 digit numeric PIN. You'll enter this every time you open the vault.
              </p>
            </div>

            <Field label="Create PIN *">
              <div className="relative">
                <input type={showPin ? 'text' : 'password'}
                       value={pin}
                       onChange={e => { setPin_(e.target.value.replace(/\D/g,'')); setError('') }}
                       placeholder="Enter 4-6 digits"
                       maxLength={6}
                       className="input-base font-mono tracking-[0.5em] pr-10" />
                <button onClick={() => setShowPin(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text3)' }}>
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm PIN *">
              <input type="password"
                     value={confirmPin}
                     onChange={e => { setConfirmPin(e.target.value.replace(/\D/g,'')); setError('') }}
                     placeholder="Re-enter PIN"
                     maxLength={6}
                     className="input-base font-mono tracking-[0.5em]" />
            </Field>

            {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}

            <div className="flex gap-3 mt-2">
              <button onClick={() => { setStep(1); setError('') }}
                      className="btn-secondary flex-1">
                ← Back
              </button>
              <button onClick={finish}
                      className="btn-primary flex-1">
                Open Vault 🔐
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .input-base {
          width: 100%;
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--text);
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-base:focus { border-color: var(--accent); }
        .input-base::placeholder { color: var(--text3); }
        .btn-primary {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary {
          background: var(--surface2);
          color: var(--text2);
          border: 1px solid var(--border2);
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover { color: var(--text); border-color: var(--accent); }
      `}</style>
    </div>
  )
}

// Small reusable field wrapper
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
