import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { WebSocket } from 'ws'
import { readConfig } from '../src/config.js'
import { INSIGHT_PROMPT, createInsightTracker, decodeInsight, encodeInsight } from '../src/insight.js'
import { summarize } from '../src/metrics.js'
import { buildResult, isComplete, mergeReadings } from '../src/results.js'
import { createScanServer } from '../src/server.js'

const ORIGIN = 'http://localhost:5173'
const KEY = 'test-key-1234567890'
const W = 160
const H = 160
const START = { type: 'start', width: W, height: H, apiKey: KEY }
const STEADY_PULSE = { value: 72, stable: true, confidence: 90 }
const STEADY_BREATH = { value: 15, stable: true, confidence: 80 }
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function frame(ts, w = W, h = H) {
  const buf = Buffer.alloc(8 + w * h * 3, 7)
  buf.writeDoubleLE(ts, 0)
  return buf
}

// A stand-in for the SDK session. `insight(handlers, id)` decides how Presage answers.
async function setup({ maxSeconds = 60, failStart, insight, insightTimeoutMs = 300, insightMinSeconds = 0, maxConcurrentScans = 1 } = {}) {
  const calls = { frames: [], started: 0, stopped: 0, handlers: null, keys: [], logged: [], errors: [], insightRequests: [], order: [] }
  const createSession = async (handlers, { apiKey }) => {
    calls.handlers = handlers
    calls.keys.push(apiKey)
    return {
      start() {
        if (failStart) throw Object.assign(new Error(`boom internal detail ${apiKey}`), failStart)
        calls.started++
      },
      sendFrame(rgb, w, h, ts) {
        calls.frames.push({ len: rgb.length, w, h, ts })
        return true
      },
      async stop() {
        calls.order.push('stop')
        calls.stopped++
      },
      ...(insight
        ? {
            requestInsight(text) {
              const id = calls.insightRequests.length + 1
              calls.insightRequests.push(text)
              calls.order.push('request')
              insight(handlers, id)
              return id
            },
          }
        : {}),
    }
  }
  const config = { ...readConfig({}), maxSeconds, allowedOrigins: [ORIGIN], insightTimeoutMs, insightMinSeconds, maxConcurrentScans }
  const log = { error: (m, ...d) => calls.errors.push([m, ...d].join(' ')), info: (m) => calls.logged.push(m) }
  const app = createScanServer({ config, createSession, log })
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r))
  const url = `ws://127.0.0.1:${app.server.address().port}/scan-ws`
  return { app, calls, url }
}

// Opens a socket and records every JSON message it receives.
function connect(url, { origin = ORIGIN } = {}) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url, { headers: origin ? { origin } : {} })
    const messages = []
    const waiters = []
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString())
      messages.push(m)
      for (const w of [...waiters]) if (w.test(m)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(m) }
    })
    const api = {
      ws,
      messages,
      next: (type, match = () => true) =>
        new Promise((res, rej) => {
          const test = (m) => m.type === type && match(m)
          const found = messages.find(test)
          if (found) return res(found)
          const t = setTimeout(() => rej(new Error(`timed out waiting for ${type}`)), 3000)
          waiters.push({ test, resolve: (m) => { clearTimeout(t); res(m) } })
        }),
      closed: new Promise((res) => ws.on('close', (code) => res(code))),
    }
    ws.on('open', () => resolve({ ok: true, ...api }))
    ws.on('unexpected-response', (_req, res) => resolve({ ok: false, status: res.statusCode }))
    ws.on('error', () => {})
  })
}

const open = []
afterEach(async () => {
  for (const c of open.splice(0)) await c().catch(() => {})
})
async function run(opts) {
  const s = await setup(opts)
  open.push(() => s.app.close())
  return s
}
async function started(opts) {
  const s = await run(opts)
  const c = await connect(s.url)
  c.ws.send(JSON.stringify(START))
  await c.next('ready')
  return { ...s, c }
}

describe('who may connect', () => {
  it('refuses a page we do not serve', async () => {
    const { url } = await run()
    assert.equal((await connect(url, { origin: 'http://evil.example' })).status, 403)
    assert.equal((await connect(url, { origin: null })).status, 403)
  })
  it('only serves the scan path', async () => {
    const { url } = await run()
    assert.equal((await connect(url.replace('/scan-ws', '/other'))).status, 404)
  })
  it('allows one scan at a time and frees the slot afterwards', async () => {
    const { url, app } = await run()
    const a = await connect(url)
    assert.equal(a.ok, true)
    assert.equal((await connect(url)).status, 503)
    a.ws.close()
    await a.closed
    await wait(50)
    assert.equal(app.activeCount(), 0)
    assert.equal((await connect(url)).ok, true)
  })
  it('can allow more scans at once', async () => {
    const { url } = await run({ maxConcurrentScans: 2 })
    assert.equal((await connect(url)).ok, true)
    assert.equal((await connect(url)).ok, true)
    assert.equal((await connect(url)).status, 503)
  })
  it('reports whether it is busy on /health', async () => {
    const { url } = await run()
    const base = url.replace('ws://', 'http://').replace('/scan-ws', '')
    assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok', busy: false })
    await connect(url)
    assert.equal((await (await fetch(`${base}/health`)).json()).busy, true)
  })
})

describe("the person's own API key", () => {
  for (const [name, apiKey] of [['missing', undefined], ['empty', ''], ['too short', 'abc'], ['has spaces', 'abcd efgh ijkl'], ['not text', 12345678], ['has control characters', 'abcdefgh\n1234']]) {
    it(`refuses a key that is ${name}`, async () => {
      const { url, calls } = await run()
      const c = await connect(url)
      c.ws.send(JSON.stringify({ ...START, apiKey }))
      assert.equal((await c.next('error')).code, 'no_key')
      assert.equal(calls.keys.length, 0)
    })
  }
  it('passes the key to the SDK for that scan only', async () => {
    const { calls } = await started()
    assert.deepEqual(calls.keys, [KEY])
  })
  it('trims whitespace around the key', async () => {
    const { url, calls } = await run()
    const c = await connect(url)
    c.ws.send(JSON.stringify({ ...START, apiKey: `  ${KEY}\n` }))
    await c.next('ready')
    assert.deepEqual(calls.keys, [KEY])
  })
  it('never writes the key to the logs, even if the SDK repeats it', async () => {
    const { c, calls } = await started()
    calls.handlers.onError(5, `request to https://x?key=${KEY} failed`, true)
    await c.next('error')
    await wait(50)
    assert.ok(calls.errors.length > 0)
    assert.ok(![...calls.errors, ...calls.logged].some((l) => l.includes(KEY)), calls.errors.join('|'))
  })
  it('never writes the key to the logs when the SDK fails to start', async () => {
    const { url, calls } = await run({ failStart: { code: 5 } })
    const c = await connect(url)
    c.ws.send(JSON.stringify(START))
    const e = await c.next('error')
    assert.equal(e.code, 'start_failed')
    assert.ok(![...calls.errors, ...calls.logged, JSON.stringify(e)].some((l) => l.includes(KEY)))
    assert.ok(!JSON.stringify(e).includes('internal detail'))
  })
  it('tells the person when Presage does not accept the key', async () => {
    const { url } = await run({ failStart: { code: 2 } })
    const c = await connect(url)
    c.ws.send(JSON.stringify(START))
    const e = await c.next('error')
    assert.equal(e.code, 'bad_key')
    assert.match(e.message, /Account page/)
    assert.equal(e.retryable, false)
  })
  it('tells the person when the account has no credit', async () => {
    const { c, calls } = await started()
    calls.handlers.onError(4, 'credit', false)
    assert.equal((await c.next('error')).code, 'no_credit')
  })
  it('does not mix up keys between scans', async () => {
    const { url, calls } = await run()
    const a = await connect(url)
    a.ws.send(JSON.stringify(START))
    await a.next('ready')
    a.ws.close()
    await a.closed
    await wait(80)
    const b = await connect(url)
    b.ws.send(JSON.stringify({ ...START, apiKey: 'second-key-0987654321' }))
    await b.next('ready')
    assert.deepEqual(calls.keys, [KEY, 'second-key-0987654321'])
  })
})

describe('a scan', () => {
  it('starts, passes frames to the SDK with their own timestamps, and stops cleanly', async () => {
    const { c, calls } = await started()
    c.ws.send(frame(1000))
    c.ws.send(frame(34000))
    c.ws.send(JSON.stringify({ type: 'stop' }))
    assert.equal((await c.next('ended')).reason, 'stopped')
    assert.deepEqual(calls.frames.map((f) => f.ts), [1000, 34000])
    assert.equal(calls.frames[0].len, W * H * 3)
    assert.equal(calls.started, 1)
    await c.closed
    assert.equal(calls.stopped, 1)
  })
  it('drops frames whose timestamps do not increase', async () => {
    const { c, calls } = await started()
    for (const ts of [100, 200, 200, 150, 300]) c.ws.send(frame(ts))
    c.ws.send(JSON.stringify({ type: 'stop' }))
    await c.next('ended')
    assert.deepEqual(calls.frames.map((f) => f.ts), [100, 200, 300])
  })
  it('limits the frame rate', async () => {
    const { c, calls } = await started()
    for (let i = 1; i <= 100; i++) c.ws.send(frame(i * 1000))
    c.ws.send(JSON.stringify({ type: 'stop' }))
    await c.next('ended')
    assert.ok(calls.frames.length <= 41, `${calls.frames.length} frames got through`)
  })
  it('relays what the SDK reports', async () => {
    const { c, calls } = await started()
    calls.handlers.onStatus('running')
    calls.handlers.onValidation(3, 'Move into the light')
    calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: null, hrv: null })
    assert.equal((await c.next('metrics')).pulse.value, 72)
    assert.equal((await c.next('validation')).hint, 'Move into the light')
    assert.equal((await c.next('status')).status, 'running')
  })
  it('ends the scan at the time limit', async () => {
    const { c, calls } = await started({ maxSeconds: 0.05 })
    assert.equal((await c.next('ended')).reason, 'time_limit')
    await c.closed
    assert.equal(calls.stopped, 1)
  })
  it('stops the SDK when the browser disconnects', async () => {
    const { c, calls } = await started()
    c.ws.terminate()
    await wait(100)
    assert.equal(calls.stopped, 1)
  })
})

describe('bad input and failures', () => {
  for (const [name, msg] of [
    ['too small', { width: 10, height: 10 }],
    ['too large', { width: 5000, height: 5000 }],
    ['not a number', { width: 'a', height: 'b' }],
    ['fractional', { width: 200.5, height: 200 }],
  ]) {
    it(`rejects a video size that is ${name}`, async () => {
      const { url, calls } = await run()
      const c = await connect(url)
      c.ws.send(JSON.stringify({ ...START, ...msg }))
      assert.equal((await c.next('error')).code, 'bad_size')
      assert.equal(calls.started, 0)
    })
  }
  it('rejects a frame of the wrong size', async () => {
    const { c } = await started()
    c.ws.send(frame(1, 200, 200))
    assert.equal((await c.next('error')).code, 'bad_frame')
  })
  it('rejects text that is not JSON, and a second start', async () => {
    const { url } = await run({ maxConcurrentScans: 2 })
    const c = await connect(url)
    c.ws.send('not json')
    assert.equal((await c.next('error')).code, 'bad_message')
    const d = await connect(url)
    d.ws.send(JSON.stringify(START))
    await d.next('ready')
    d.ws.send(JSON.stringify(START))
    assert.equal((await d.next('error')).code, 'already_started')
  })
  it('hides SDK internals when the SDK reports an error mid-scan', async () => {
    const { c, calls } = await started()
    calls.handlers.onError(5, 'secret url https://internal/x', true)
    const e = await c.next('error')
    assert.equal(e.code, 'sdk_error')
    assert.ok(!JSON.stringify(e).includes('internal'))
    assert.equal((await c.next('ended')).reason, 'error')
  })
})

describe('results', () => {
  it('stops the scan by itself once pulse and breathing are steady', async () => {
    const { c, calls } = await started()
    calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: STEADY_BREATH, hrv: null })
    assert.equal((await c.next('ended')).reason, 'complete')
    await c.closed
    assert.equal(calls.stopped, 1)
  })
  it('sends the readings before the scan ends', async () => {
    const { c, calls } = await started()
    calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: STEADY_BREATH, hrv: null })
    await c.next('ended')
    const order = c.messages.map((m) => m.type)
    assert.ok(order.indexOf('metrics') < order.indexOf('ended'), order.join(','))
  })
  it('does not stop while a reading is still settling', async () => {
    const { c, calls } = await started()
    calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: { value: 14, stable: false }, hrv: null })
    await c.next('metrics')
    await wait(50)
    assert.equal(c.messages.some((m) => m.type === 'ended'), false)
    calls.handlers.onMetrics({ pulse: null, breathing: STEADY_BREATH, hrv: null })
    assert.equal((await c.next('ended')).reason, 'complete')
  })
  it('prints the result to the console without any identity', async () => {
    const { c, calls } = await started()
    calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: STEADY_BREATH, hrv: { rmssd: 40, sdnn: 50, stable: true, confidence: 60 } })
    await c.next('ended')
    await c.closed
    const line = calls.logged.find((m) => m.startsWith('Scan result'))
    assert.ok(line)
    const result = JSON.parse(line.slice(line.indexOf('{')))
    assert.equal(result.reason, 'complete')
    assert.equal(result.complete, true)
    assert.equal(result.pulse.value, 72)
    assert.ok(!line.includes(KEY))
  })
  it('prints nothing for a scan that failed or had no readings', async () => {
    const a = await started()
    a.c.ws.send(JSON.stringify({ type: 'stop' }))
    await a.c.next('ended')
    assert.equal(a.calls.logged.some((m) => m.startsWith('Scan result')), false)
    await a.c.closed
    await wait(60)
    const b = await started()
    b.calls.handlers.onMetrics({ pulse: { value: 70, stable: false }, breathing: null, hrv: null })
    b.calls.handlers.onError(3, 'internal', false)
    await b.c.closed
    assert.equal(b.calls.logged.some((m) => m.startsWith('Scan result')), false)
  })
  it('ignores readings that arrive after the scan has ended', async () => {
    const { c, calls } = await started()
    calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: STEADY_BREATH, hrv: null })
    await c.next('ended')
    calls.handlers.onMetrics({ pulse: { value: 99, stable: true }, breathing: STEADY_BREATH, hrv: null })
    await wait(80)
    const line = calls.logged.find((m) => m.startsWith('Scan result'))
    assert.equal(JSON.parse(line.slice(line.indexOf('{'))).pulse.value, 72)
  })
})

describe('Presage LLM insight', () => {
  const reply = (analysis) => (h, id) => setTimeout(() => h.onInsight({ requestId: id, analysis, error: '' }), 10)
  const finishScan = async (s) => {
    s.calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: STEADY_BREATH, hrv: null })
    await s.c.closed
    await wait(30)
  }

  it('asks what the readings mean, sends the answer to the browser and prints it', async () => {
    const s = await started({ insight: reply('Your pulse looks typical for rest.') })
    await finishScan(s)
    assert.equal(s.calls.insightRequests.length, 1)
    assert.equal(s.calls.insightRequests[0], INSIGHT_PROMPT)
    const ok = s.c.messages.find((m) => m.type === 'insight' && m.status === 'ok')
    assert.equal(ok.text, 'Your pulse looks typical for rest.')
    assert.ok(s.calls.logged.some((m) => m.startsWith('Presage LLM insight') && m.includes('typical for rest')))
    assert.equal(s.calls.errors.length, 0)
  })
  it('sends ended, then pending, then the answer, and only then closes the socket', async () => {
    const s = await started({ insight: reply('ok') })
    await finishScan(s)
    const seq = s.c.messages.filter((m) => m.type === 'ended' || m.type === 'insight').map((m) => (m.type === 'ended' ? 'ended' : m.status))
    assert.deepEqual(seq, ['ended', 'pending', 'ok'])
  })
  it('asks while the session is still open, then stops it', async () => {
    const s = await started({ insight: reply('ok') })
    await finishScan(s)
    assert.deepEqual(s.calls.order, ['request', 'stop'])
  })
  it('keeps the slot until the session is fully stopped', async () => {
    const s = await started({ insight: () => {}, insightTimeoutMs: 300 })
    s.calls.handlers.onMetrics({ pulse: STEADY_PULSE, breathing: STEADY_BREATH, hrv: null })
    await s.c.next('ended')
    await wait(50)
    assert.equal(s.app.activeCount(), 1)
    assert.equal((await connect(s.url)).status, 503)
    await wait(450)
    assert.equal(s.app.activeCount(), 0)
  })
  it('keeps the prompt free of anything personal and tells the model not to diagnose', () => {
    assert.ok(!/@|google|email|account/i.test(INSIGHT_PROMPT))
    assert.ok(/do not diagnose/i.test(INSIGHT_PROMPT))
  })
  it('reports an error answer from Presage as unavailable', async () => {
    const s = await started({ insight: (h, id) => h.onInsight({ requestId: id, analysis: '', error: `service unavailable for ${KEY}` }) })
    await finishScan(s)
    assert.equal(s.c.messages.find((m) => m.type === 'insight' && m.status === 'unavailable')?.status, 'unavailable')
    assert.ok(s.calls.errors.some((m) => m.includes('service unavailable')))
    assert.ok(!s.calls.errors.some((m) => m.includes(KEY)))
    assert.equal(s.calls.stopped, 1)
  })
  it('gives up after the timeout and still stops the session', async () => {
    const s = await started({ insight: () => {}, insightTimeoutMs: 100 })
    await finishScan(s)
    assert.ok(s.c.messages.some((m) => m.type === 'insight' && m.status === 'unavailable'))
    assert.ok(s.calls.errors.some((m) => m.includes('no answer')))
    assert.equal(s.calls.stopped, 1)
  })
  it('falls back to an automatic insight if the requested one is late', async () => {
    const s = await started({ insight: () => {}, insightTimeoutMs: 150 })
    s.calls.handlers.onInsight({ requestId: 999, analysis: 'automatic text', error: '' })
    await finishScan(s)
    assert.equal(s.c.messages.find((m) => m.type === 'insight' && m.status === 'ok')?.text, 'automatic text')
  })
  it('skips a scan that was too short', async () => {
    const s = await started({ insight: reply('x'), insightMinSeconds: 15 })
    await finishScan(s)
    assert.equal(s.calls.insightRequests.length, 0)
    assert.equal(s.c.messages.find((m) => m.type === 'insight')?.status, 'skipped')
  })
  it('says so when there were no readings, and does not ask', async () => {
    const s = await started({ insight: reply('x') })
    s.c.ws.send(JSON.stringify({ type: 'stop' }))
    await s.c.closed
    assert.equal(s.calls.insightRequests.length, 0)
    assert.equal(s.c.messages.find((m) => m.type === 'insight')?.status, 'skipped')
  })
  it('does not ask after an error or when the browser has gone', async () => {
    const a = await started({ insight: reply('x') })
    a.calls.handlers.onMetrics({ pulse: { value: 70, stable: false }, breathing: null, hrv: null })
    a.calls.handlers.onError(3, 'internal', false)
    await a.c.closed
    assert.equal(a.calls.insightRequests.length, 0)
    await wait(60)
    const b = await started({ insight: reply('x') })
    b.calls.handlers.onMetrics({ pulse: { value: 70, stable: false }, breathing: null, hrv: null })
    b.c.ws.terminate()
    await wait(100)
    assert.equal(b.calls.insightRequests.length, 0)
    assert.equal(b.calls.stopped, 1)
  })
  it('works with a session that has no insight support', async () => {
    const s = await started()
    await finishScan(s)
    assert.equal(s.c.messages.find((m) => m.type === 'insight')?.status, 'skipped')
    assert.equal(s.calls.stopped, 1)
  })
  it('cuts a very long answer', async () => {
    const s = await started({ insight: reply('a'.repeat(9000)) })
    await finishScan(s)
    assert.equal(s.c.messages.find((m) => m.status === 'ok').text.length, 4000)
  })
  it('matches replies by request id and reports a request that throws', async () => {
    const t = createInsightTracker()
    const p = t.ask(() => 7, 500)
    t.receive({ requestId: 8, analysis: 'other', error: '' })
    t.receive({ requestId: 7, analysis: 'mine', error: '' })
    assert.deepEqual(await p, { analysis: 'mine' })
    assert.equal(t.latestAutomatic.analysis, 'other')
    assert.match((await t.ask(() => { throw new Error('not running') }, 100)).error, /not running/)
  })
})

describe('Insight decoding', () => {
  it('decodes analysis and error messages', () => {
    const a = decodeInsight(encodeInsight({ requestId: 5, processedAt: '2026-11-21T10:00:00Z', analysis: 'Looks fine.' }))
    assert.deepEqual(a, { requestId: 5, processedAt: '2026-11-21T10:00:00Z', analysis: 'Looks fine.', error: '' })
    const e = decodeInsight(encodeInsight({ requestId: 6, error: 'unavailable' }))
    assert.equal(e.error, 'unavailable')
    assert.equal(e.analysis, '')
  })
  it("uses the field numbers from Presage's schema", () => {
    assert.deepEqual(decodeInsight(Buffer.from([0x08, 0x05, 0x1a, 0x02, 0x68, 0x69])), { requestId: 5, processedAt: '', analysis: 'hi', error: '' })
    assert.equal(decodeInsight(Buffer.from([0x22, 0x02, 0x6e, 0x6f])).error, 'no')
  })
  it('accepts a Uint8Array and rejects garbage', () => {
    assert.equal(decodeInsight(new Uint8Array(encodeInsight({ requestId: 1, analysis: 'x' }))).analysis, 'x')
    assert.throws(() => decodeInsight(Buffer.from([0xff, 0xff, 0xff])))
  })
})

describe('result helpers', () => {
  it('keeps earlier readings when a batch leaves one out', () => {
    const merged = mergeReadings({ pulse: STEADY_PULSE, breathing: null, hrv: null }, { pulse: null, breathing: STEADY_BREATH, hrv: null })
    assert.equal(merged.pulse.value, 72)
    assert.equal(merged.breathing.value, 15)
  })
  it('is complete only when both are stable', () => {
    assert.equal(isComplete({ pulse: STEADY_PULSE, breathing: null }), false)
    assert.equal(isComplete({ pulse: STEADY_PULSE, breathing: { value: 1, stable: false } }), false)
    assert.equal(isComplete({ pulse: STEADY_PULSE, breathing: STEADY_BREATH }), true)
  })
  it('rounds the duration', () => {
    assert.equal(buildResult('stopped', { pulse: STEADY_PULSE }, 12.3456).duration_seconds, 12.3)
  })
})

describe('summarize', () => {
  it('takes the newest sample of each measurement', () => {
    const out = summarize({
      cardio: {
        pulseRate: [{ value: 70, stable: false }, { value: 73.5, stable: true, confidence: 88 }],
        hrv: [{ rmssd: 41, sdnn: 50, stable: true, confidence: 70 }],
      },
      breathing: { rate: [{ value: 14, stable: true }] },
    })
    assert.deepEqual(out.pulse, { value: 73.5, stable: true, confidence: 88 })
    assert.equal(out.breathing.value, 14)
    assert.equal(out.hrv.rmssd, 41)
  })
  it('copes with empty or missing data', () => {
    assert.deepEqual(summarize({}), { pulse: null, breathing: null, hrv: null })
    assert.deepEqual(summarize(Buffer.alloc(2)), { pulse: null, breathing: null, hrv: null })
    assert.equal(summarize({ cardio: { pulseRate: [{ value: NaN }] } }).pulse, null)
  })
})
