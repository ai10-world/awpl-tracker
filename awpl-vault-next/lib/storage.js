// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────
const KEYS = {
  PIN:     'awpl_v3_pin',
  PROFILE: 'awpl_v3_profile',
  VAULTS:  'awpl_v3_vaults',
  ENTRIES: 'awpl_v3_entries',
}

// ─── PIN ──────────────────────────────────────────────────────────────────────
export function getPin()          { return localStorage.getItem(KEYS.PIN) }
export function setPin(pin)       { localStorage.setItem(KEYS.PIN, btoa(pin)) }
export function verifyPin(pin)    { return localStorage.getItem(KEYS.PIN) === btoa(pin) }
export function clearPin()        { localStorage.removeItem(KEYS.PIN) }

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export function getProfile() {
  try { return JSON.parse(localStorage.getItem(KEYS.PROFILE)) } catch { return null }
}
export function saveProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
}

// ─── VAULTS ───────────────────────────────────────────────────────────────────
export function getVaults() {
  try { return JSON.parse(localStorage.getItem(KEYS.VAULTS)) || [] } catch { return [] }
}
export function saveVaults(vaults) {
  localStorage.setItem(KEYS.VAULTS, JSON.stringify(vaults))
}

// ─── ENTRIES ──────────────────────────────────────────────────────────────────
export function getEntries() {
  try { return JSON.parse(localStorage.getItem(KEYS.ENTRIES)) || [] } catch { return [] }
}
export function saveEntries(entries) {
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries))
}

// ─── EXPORT / IMPORT (Backup) ─────────────────────────────────────────────────
export function exportData() {
  const data = {
    version: 3,
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    vaults:  getVaults(),
    entries: getEntries(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `awpl-vault-backup-${new Date().toLocaleDateString('en-IN').replace(/\//g,'-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(json) {
  try {
    const data = JSON.parse(json)
    if (!data.entries || !data.vaults) throw new Error('Invalid backup file')
    saveVaults(data.vaults)
    saveEntries(data.entries)
    if (data.profile) saveProfile(data.profile)
    return true
  } catch {
    return false
  }
}

// ─── IMAGE COMPRESSION ────────────────────────────────────────────────────────
// Compresses image to max 800px & 75% JPEG quality before storing
export function compressImage(file, maxPx = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height / width) * maxPx); width = maxPx }
          else                { width = Math.round((width / height) * maxPx); height = maxPx }
        }
        const canvas = document.createElement('canvas')
        canvas.width  = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Check how full localStorage is (rough estimate in MB)
export function getStorageUsageMB() {
  let total = 0
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += (localStorage[key].length + key.length) * 2 // UTF-16
    }
  }
  return (total / 1024 / 1024).toFixed(2)
}
