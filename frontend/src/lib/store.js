// Everything Vitalis remembers lives in this browser, on this device, and nowhere else.
// localStorage can be missing or blocked (private windows, strict settings), so every read and
// write is guarded, and a copy is kept in memory so the page still works until it is closed.

export const PREFIX = 'vitalis.'
export const KEYS = {
  apiKey: `${PREFIX}apiKey.v1`,
  profile: `${PREFIX}profile.v1`,
  reminders: `${PREFIX}reminders.v1`,
  fired: `${PREFIX}fired.v1`,
  explanation: `${PREFIX}explanation.v1`,
}

const memory = new Map()
const listeners = new Set()

function notify() {
  for (const fn of [...listeners]) fn()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Another tab changed something.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith(PREFIX)) notify()
  })
}

export function getItem(key) {
  try {
    const value = localStorage.getItem(key)
    if (value !== null) return value
  } catch {
    /* blocked: fall through to memory */
  }
  return memory.get(key) ?? null
}

export function setItem(key, value) {
  memory.set(key, value)
  try {
    localStorage.setItem(key, value)
  } catch {
    /* blocked or full: the in-memory copy still works for this visit */
  }
  notify()
}

export function removeItem(key) {
  memory.delete(key)
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
  notify()
}

// Removes everything Vitalis stored on this device.
export function clearAll() {
  memory.clear()
  try {
    const mine = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) mine.push(k)
    }
    mine.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
  notify()
}

// A reader for a JSON value that returns the same object until the stored text changes.
// (React's useSyncExternalStore needs that.) `fallback` should be a constant.
export function jsonReader(key, fallback) {
  let raw
  let value = fallback
  let ready = false
  return () => {
    const now = getItem(key)
    if (!ready || now !== raw) {
      ready = true
      raw = now
      try {
        value = now === null ? fallback : JSON.parse(now)
      } catch {
        value = fallback
      }
    }
    return value
  }
}

export function writeJson(key, value) {
  setItem(key, JSON.stringify(value))
}
