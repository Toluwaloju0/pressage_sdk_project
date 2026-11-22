// The profile is kept in this browser only. Nothing here is sent anywhere.
import { KEYS, getItem, removeItem, setItem } from '../lib/store.js'

// -> { profile: object | null, updatedAt: Date | null }
export function loadProfile() {
  const raw = getItem(KEYS.profile)
  if (!raw) return { profile: null, updatedAt: null }
  try {
    const data = JSON.parse(raw)
    if (!data || typeof data.profile !== 'object' || data.profile === null || Array.isArray(data.profile)) {
      return { profile: null, updatedAt: null }
    }
    const when = data.updated_at ? new Date(data.updated_at) : null
    return { profile: data.profile, updatedAt: when && !Number.isNaN(when.getTime()) ? when : null }
  } catch {
    return { profile: null, updatedAt: null }
  }
}

export function saveProfile(payload, now = new Date()) {
  setItem(KEYS.profile, JSON.stringify({ profile: payload, updated_at: now.toISOString() }))
  return { profile: payload, updatedAt: now }
}

export function deleteProfile() {
  removeItem(KEYS.profile)
}
