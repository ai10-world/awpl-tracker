'use client'
import { useState, useEffect } from 'react'
import LockScreen    from '@/components/LockScreen'
import ProfileSetup  from '@/components/ProfileSetup'
import VaultApp      from '@/components/VaultApp'
import { getPin, getProfile } from '@/lib/storage'

// Loading spinner shown while we check localStorage
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6"
         style={{ background: 'var(--bg)' }}>
      <div className="font-syne text-4xl font-black tracking-tight">
        AWPL<span className="text-gold-gradient">Vault</span>
      </div>
      <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
        <div className="h-full w-1/2 rounded-full animate-pulse"
             style={{ background: 'linear-gradient(90deg, var(--accent), var(--gold))' }} />
      </div>
    </div>
  )
}

export default function Home() {
  // 'loading' → check storage → 'setup' (first time) or 'lock' → 'app'
  const [screen, setScreen] = useState('loading')

  useEffect(() => {
    const pin     = getPin()
    const profile = getProfile()
    if (!pin || !profile) {
      setScreen('setup')   // First time user
    } else {
      setScreen('lock')    // Returning user
    }
  }, [])

  if (screen === 'loading') return <LoadingScreen />
  if (screen === 'lock')    return <LockScreen    onUnlock={() => setScreen('app')} />
  if (screen === 'setup')   return <ProfileSetup  onComplete={() => setScreen('lock')} />
  return                           <VaultApp       onLock={() => setScreen('lock')} />
}
