// The most recent AI explanation, kept on this device so it can be read again later.
import { KEYS, getItem, removeItem, setItem } from '../lib/store.js'

export const MAX_TEXT = 4000

export function saveExplanation({ text, readings, reason }, now = new Date()) {
  if (typeof text !== 'string' || !text.trim()) return
  setItem(KEYS.explanation, JSON.stringify({ text: text.slice(0, MAX_TEXT), readings: readings ?? null, reason: reason ?? '', savedAt: now.toISOString() }))
}

// -> { text, readings, reason, savedAt: Date } | null
export function loadExplanation() {
  const raw = getItem(KEYS.explanation)
  if (!raw) return null
  try {
    const d = JSON.parse(raw)
    const savedAt = new Date(d.savedAt)
    if (typeof d.text !== 'string' || !d.text || Number.isNaN(savedAt.getTime())) return null
    return { text: d.text.slice(0, MAX_TEXT), readings: d.readings ?? null, reason: d.reason ?? '', savedAt }
  } catch {
    return null
  }
}

export function clearExplanation() {
  removeItem(KEYS.explanation)
}
