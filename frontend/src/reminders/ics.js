// Builds a calendar file (.ics) so the reminders ring on the person's phone or computer
// even when Vitalis is closed. Times are "floating": they follow the device's own clock.
import { slotsForDay } from './model.js'

export const MAX_EVENTS = 48

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

// Lines are limited to 75 octets; continuation lines start with one space.
export function fold(line) {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const out = []
  let cur = ''
  let size = 0
  let limit = 75
  for (const ch of line) {
    const n = enc.encode(ch).length
    if (size + n > limit) {
      out.push(cur)
      cur = ''
      size = 0
      limit = 74
    }
    cur += ch
    size += n
  }
  out.push(cur)
  return out.join('\r\n ')
}

const pad = (n) => String(n).padStart(2, '0')
const stamp = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
const local = (day, minutes) =>
  `${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}T${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}00`

// reminders: enabled or not, only the given ones are exported. -> string (CRLF lines)
export function buildIcs(reminders, now = new Date()) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vitalis//Wellness reminders//EN', 'CALSCALE:GREGORIAN']
  let count = 0
  for (const r of reminders) {
    for (const slot of slotsForDay(r)) {
      if (count >= MAX_EVENTS) break
      count++
      lines.push(
        'BEGIN:VEVENT',
        `UID:${r.id}-${slot}@vitalis.local`,
        `DTSTAMP:${stamp(now)}`,
        `DTSTART:${local(now, slot)}`,
        'DURATION:PT5M',
        'RRULE:FREQ=DAILY',
        `SUMMARY:${esc(r.text)}`,
        'DESCRIPTION:A reminder you set in Vitalis. General wellness habit only.',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(r.text)}`,
        'TRIGGER:PT0S',
        'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function icsEventCount(reminders) {
  return Math.min(MAX_EVENTS, reminders.reduce((n, r) => n + slotsForDay(r).length, 0))
}
