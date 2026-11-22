import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInsight, habitKey } from '../src/insight/parse.js'
import * as M from '../src/reminders/model.js'
import { buildIcs, fold } from '../src/reminders/ics.js'

const SAMPLE = `## Your Wellness Snapshot

**What the readings show:**
- **Heart rate (83 bpm)** — Within the normal resting range (60–100 bpm).
- **Breathing rate (18 rpm)** — Right at the upper edge.

**Worth noting:** The confidence scores are low.

**Simple everyday habits that may help:**
- Try slow, deep breathing (inhale 4 counts, exhale 6) to support calm
- Stay well hydrated throughout the day
- Take short movement breaks if sitting for long periods
- Prioritise consistent sleep`

test('parseInsight finds the habits list only', () => {
  const { blocks, habits } = parseInsight(SAMPLE)
  assert.equal(habits.length, 4)
  assert.match(habits[1].text, /hydrated/)
  const lists = blocks.filter((b) => b.type === 'list')
  assert.equal(lists[0].habits, false)
  assert.equal(lists[1].habits, true)
  assert.equal(blocks[0].type, 'heading')
})

test('parseInsight never keeps markup characters or html', () => {
  const { blocks } = parseInsight('**Bold** <script>x</script>\n- a *b*')
  assert.equal(blocks[0].parts[0].bold, true)
  assert.ok(JSON.stringify(blocks).indexOf('**') === -1)
})

test('habit keys are stable and ignore punctuation', () => {
  assert.equal(habitKey('Stay hydrated!'), habitKey('stay  hydrated'))
  assert.notEqual(habitKey('a'), habitKey('b'))
})

test('classifyHabit', () => {
  assert.equal(M.classifyHabit('Stay well hydrated throughout the day'), 'interval')
  assert.equal(M.classifyHabit('Take short movement breaks'), 'interval')
  assert.equal(M.classifyHabit('Prioritise consistent sleep'), 'daily')
  assert.equal(M.classifyHabit('Try slow, deep breathing'), 'daily')
})

test('validate and slots', () => {
  const r = { text: 'x', kind: 'interval', every: 60, from: '08:00', to: '10:00' }
  assert.equal(M.validateReminder(r), '')
  assert.deepEqual(M.slotsForDay(r), [480, 540, 600])
  assert.match(M.validateReminder({ ...r, to: '07:00' }), /later/)
  assert.match(M.validateReminder({ ...r, every: 7 }), /how often/)
  assert.match(M.validateReminder({ text: 'x', kind: 'daily', time: '25:00' }), /time/)
  assert.equal(M.formatTime('13:05'), '1:05 PM')
  assert.equal(M.formatTime('00:00'), '12:00 AM')
})

test('dueSlot honours grace and fired map', () => {
  const r = { id: 'a', enabled: true, kind: 'daily', time: '09:00' }
  const at = (h, m) => new Date(2026, 10, 21, h, m)
  assert.equal(M.dueSlot(r, at(8, 59)), null)
  assert.equal(M.dueSlot(r, at(9, 3)), 540)
  assert.equal(M.dueSlot(r, at(9, 11)), null)
  const fired = M.markFired({}, r, at(9, 3), 540)
  assert.equal(M.dueSlot(r, at(9, 4), fired), null)
  assert.equal(M.dueSlot({ ...r, enabled: false }, at(9, 3)), null)
})

test('nextOccurrence rolls to tomorrow', () => {
  const r = { id: 'a', enabled: true, kind: 'daily', time: '09:00' }
  const n = M.nextOccurrence(r, new Date(2026, 10, 21, 10, 0))
  assert.equal(n.getDate(), 22)
  assert.equal(n.getHours(), 9)
})

test('ics output', () => {
  const rs = [
    { id: 'a', text: 'Drink water, stretch; go', kind: 'interval', every: 120, from: '08:00', to: '12:00', enabled: true },
    { id: 'b', text: 'Sleep', kind: 'daily', time: '22:30', enabled: true },
  ]
  const ics = buildIcs(rs, new Date(Date.UTC(2026, 10, 21, 12)))
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/)
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 4)
  assert.match(ics, /RRULE:FREQ=DAILY/)
  assert.match(ics, /TRIGGER:PT0S/)
  assert.match(ics, /SUMMARY:Drink water\\, stretch\; go/)
  assert.match(ics, /DTSTART:20261121T223000\r\n/)
  assert.ok(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75))
  assert.ok(!/[^\r]\n/.test(ics))
})

test('fold keeps multibyte characters whole', () => {
  const folded = fold('SUMMARY:' + 'é'.repeat(80)).split('\r\n')
  assert.ok(folded.length > 1)
  assert.equal(folded.join('').replace(/^ /gm, '').length, 'SUMMARY:'.length + 80 + folded.length - 1)
})
