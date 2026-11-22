// Reminder rules. Pure functions only, so they can be tested without a browser.
//
// A reminder is { id, habitKey, text, kind: 'daily' | 'interval', time: 'HH:MM',
//                 every (minutes), from: 'HH:MM', to: 'HH:MM', enabled, createdAt }.
// 'daily' fires once a day at `time`. 'interval' fires every `every` minutes between from and to.

export const INTERVAL_CHOICES = [30, 45, 60, 90, 120, 180, 240]
export const MAX_REMINDERS = 12
export const GRACE_MINUTES = 10
export const DEFAULTS = { time: '09:00', every: 60, from: '08:00', to: '20:00' }

const INTERVAL_WORDS = /hydrat|water|drink|break|stretch|walk|posture|move|movement|stand|throughout the day|regularly|often|every hour/i
const DAILY_WORDS = /sleep|bed|meditat|breathing|breathe|journal|routine|morning|evening|night/i

// What a habit most likely needs: repeated through the day, or once a day. The person can change it.
export function classifyHabit(text) {
  const t = String(text ?? '')
  if (INTERVAL_WORDS.test(t) && !/sleep/i.test(t)) return 'interval'
  if (DAILY_WORDS.test(t)) return 'daily'
  return 'daily'
}

export function toMinutes(hhmm) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(hhmm ?? ''))
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

export function formatTime(hhmm) {
  const mins = toMinutes(hhmm)
  if (mins === null) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export function describe(r) {
  if (r.kind === 'interval') return `Every ${everyLabel(r.every)}, ${formatTime(r.from)} to ${formatTime(r.to)}`
  return `Every day at ${formatTime(r.time)}`
}

export function everyLabel(minutes) {
  if (minutes % 60 === 0) return minutes === 60 ? 'hour' : `${minutes / 60} hours`
  return `${minutes} minutes`
}

// -> string error | '' when valid
export function validateReminder(r) {
  if (!r || typeof r.text !== 'string' || !r.text.trim()) return 'Choose an activity to be reminded about.'
  if (r.kind === 'daily') return toMinutes(r.time) === null ? 'Choose a time of day.' : ''
  if (r.kind === 'interval') {
    if (!INTERVAL_CHOICES.includes(Number(r.every))) return 'Choose how often to repeat.'
    const from = toMinutes(r.from)
    const to = toMinutes(r.to)
    if (from === null || to === null) return 'Choose the hours to be reminded between.'
    if (to <= from) return 'The end time must be later than the start time.'
    return ''
  }
  return 'Choose when to be reminded.'
}

// Minutes after midnight at which the reminder fires on any day, ascending.
export function slotsForDay(r) {
  if (r.kind === 'daily') {
    const t = toMinutes(r.time)
    return t === null ? [] : [t]
  }
  const from = toMinutes(r.from)
  const to = toMinutes(r.to)
  const every = Number(r.every)
  if (from === null || to === null || !(every > 0) || to < from) return []
  const out = []
  for (let t = from; t <= to; t += every) out.push(t)
  return out
}

export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const minutesOf = (d) => d.getHours() * 60 + d.getMinutes()

// The latest slot that has passed today, within the grace window and not yet shown.
// `fired` maps `${id}|${day}` to the last slot (minutes) already shown. -> minutes | null
export function dueSlot(r, now, fired = {}) {
  if (!r.enabled) return null
  const nowMin = minutesOf(now)
  const done = fired[`${r.id}|${dayKey(now)}`] ?? -1
  let due = null
  for (const s of slotsForDay(r)) {
    if (s <= nowMin && nowMin - s <= GRACE_MINUTES && s > done) due = s
  }
  return due
}

export function markFired(fired, r, now, slot) {
  const key = `${r.id}|${dayKey(now)}`
  const next = { ...fired, [key]: Math.max(fired[key] ?? -1, slot) }
  // Keep the map small: only today's entries matter.
  const today = dayKey(now)
  for (const k of Object.keys(next)) if (!k.endsWith(`|${today}`)) delete next[k]
  return next
}

// The next time this reminder will fire after `now`, as a Date, or null.
export function nextOccurrence(r, now) {
  if (!r.enabled) return null
  const slots = slotsForDay(r)
  if (!slots.length) return null
  const nowMin = minutesOf(now)
  const at = (dayOffset, minutes) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, 0, minutes, 0, 0)
    return d
  }
  const later = slots.find((s) => s > nowMin)
  return later !== undefined ? at(0, later) : at(1, slots[0])
}

export function newReminder({ habitKey, text, kind, time, every, from, to }, now = new Date()) {
  return {
    id: `r${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    habitKey: habitKey ?? '',
    text: String(text).trim().slice(0, 200),
    kind,
    time: time ?? DEFAULTS.time,
    every: Number(every ?? DEFAULTS.every),
    from: from ?? DEFAULTS.from,
    to: to ?? DEFAULTS.to,
    enabled: true,
    createdAt: now.toISOString(),
  }
}

// Drops anything in stored data that is not a usable reminder.
export function sanitizeList(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((r) => r && typeof r === 'object' && typeof r.id === 'string' && validateReminder(r) === '')
    .slice(0, MAX_REMINDERS)
}
