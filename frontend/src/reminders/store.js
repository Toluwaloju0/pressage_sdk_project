import { useSyncExternalStore } from 'react'
import { KEYS, jsonReader, subscribe, writeJson } from '../lib/store.js'
import { MAX_REMINDERS, newReminder, sanitizeList, validateReminder } from './model.js'

const EMPTY = Object.freeze([])
const readRaw = jsonReader(KEYS.reminders, EMPTY)
let lastRaw
let lastList = EMPTY
// Same array until the stored data changes.
function read() {
  const raw = readRaw()
  if (raw !== lastRaw) {
    lastRaw = raw
    lastList = raw === EMPTY ? EMPTY : sanitizeList(raw)
  }
  return lastList
}

export function listReminders() {
  return read()
}

export function useReminders() {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

// -> error string | ''
export function addReminder(fields) {
  const error = validateReminder(fields)
  if (error) return error
  const list = read()
  if (list.length >= MAX_REMINDERS) return `You can keep up to ${MAX_REMINDERS} reminders. Remove one first.`
  writeJson(KEYS.reminders, [...list, newReminder(fields)])
  return ''
}

export function updateReminder(id, fields) {
  const list = read()
  const current = list.find((r) => r.id === id)
  if (!current) return 'That reminder no longer exists.'
  const next = { ...current, ...fields }
  const error = validateReminder(next)
  if (error) return error
  writeJson(KEYS.reminders, list.map((r) => (r.id === id ? next : r)))
  return ''
}

export function removeReminder(id) {
  writeJson(KEYS.reminders, read().filter((r) => r.id !== id))
}

const firedRead = jsonReader(KEYS.fired, {})
export const readFired = () => {
  const v = firedRead()
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}
export const writeFired = (map) => writeJson(KEYS.fired, map)
