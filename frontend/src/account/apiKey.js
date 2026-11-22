import { KEYS, getItem, removeItem, setItem } from '../lib/store.js'

// A Presage API key is a run of visible characters. Same rule as the scan service, so a key
// that passes here is not refused there for its shape.
export const KEY_PATTERN = /^[\x21-\x7e]{8,256}$/

export const KEY_ERROR = 'That does not look like a Presage API key. Copy the whole key from your Presage account and paste it here.'

export function cleanKey(value) {
  return String(value ?? '').trim()
}

export function isValidKey(value) {
  return KEY_PATTERN.test(cleanKey(value))
}

export function getApiKey() {
  const key = getItem(KEYS.apiKey)
  return key && KEY_PATTERN.test(key) ? key : ''
}

// Returns an error message, or '' when the key was saved.
export function saveApiKey(value) {
  const key = cleanKey(value)
  if (!KEY_PATTERN.test(key)) return KEY_ERROR
  setItem(KEYS.apiKey, key)
  return ''
}

export function clearApiKey() {
  removeItem(KEYS.apiKey)
}

// Enough to recognise a key without showing it: the last four characters.
export function keyHint(key) {
  return key.length >= 12 ? `ending in ${key.slice(-4)}` : ''
}
