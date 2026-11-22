import http from 'node:http'
import { WebSocketServer } from 'ws'
import { INSIGHT_PROMPT, createInsightTracker } from './insight.js'
import { FRAME_HEADER_BYTES, KEY_PATTERN, MAX_FPS, MAX_INSIGHT_CHARS, MAX_SIDE, MIN_SIDE, WS_PATH } from './protocol.js'
import { buildResult, hasAnyReading, isComplete, mergeReadings } from './results.js'

const send = (ws, message) => {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message))
}

// SmartSpectraErrorCode values from the SDK (js/constants.js).
const AUTH_FAILED = 2
const CREDIT_EXHAUSTED = 4

const KEY_MESSAGES = {
  [AUTH_FAILED]: ['bad_key', 'Presage did not accept your API key. Check it on the Account page.'],
  [CREDIT_EXHAUSTED]: ['no_credit', 'Your Presage account has no credit left. Check your account on Presage.'],
}

// createSession: async (handlers, { apiKey }) => session   (see sdkSession.js)
//
// There is no sign-in here. Each person brings their own Presage API key, sent in the first
// message of the scan and used for that scan only. The key is never logged or stored.
export function createScanServer({ config, createSession, log = console }) {
  let active = 0

  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', busy: active >= config.maxConcurrentScans }))
      return
    }
    res.writeHead(404).end()
  })

  // Frames are width*height*3 bytes at most, plus the timestamp.
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: FRAME_HEADER_BYTES + MAX_SIDE * MAX_SIDE * 3,
  })

  const reject = (socket, status, text) => {
    socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`)
    socket.destroy()
  }

  server.on('upgrade', (req, socket, head) => {
    socket.on('error', () => {})
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname !== WS_PATH) return reject(socket, 404, 'Not Found')

    // A browser always sends Origin on a WebSocket; refuse pages we do not serve.
    const origin = req.headers.origin
    if (!origin || !config.allowedOrigins.includes(origin)) return reject(socket, 403, 'Forbidden')

    // The native SDK keeps process-wide state, so only so many scans run at once.
    if (active >= config.maxConcurrentScans) return reject(socket, 503, 'Service Unavailable')

    active++
    let released = false
    const release = () => {
      if (!released) {
        released = true
        active--
      }
    }
    let handled = false
    wss.handleUpgrade(req, socket, head, (ws) => {
      handled = true
      handleConnection(ws, release)
    })
    // handleUpgrade can fail if the socket died meanwhile; make sure the slot is freed.
    // Once a connection is handled, finish() frees the slot after the SDK is fully stopped.
    socket.once('close', () => {
      if (!handled) release()
    })
  })

  function handleConnection(ws, release) {
    let session = null
    let starting = false
    let apiKey = ''
    let width = 0
    let height = 0
    let frameBytes = 0
    let lastTs = -Infinity
    let windowStart = 0
    let windowCount = 0
    let timer = null
    let ended = false
    let latest = { pulse: null, breathing: null, hrv: null }
    let startedAt = 0
    const insights = createInsightTracker()

    // Anything that could contain the key is cleaned before it is logged.
    const clean = (value) => {
      const text = String(value ?? '')
      return apiKey ? text.split(apiKey).join('[key]') : text
    }

    const finish = async (reason, closeCode = 1000) => {
      if (ended) return
      ended = true
      clearTimeout(timer)
      const s = session
      session = null
      // Tell the browser first, so the screen updates straight away.
      send(ws, { type: 'ended', reason })
      const seconds = startedAt ? (Date.now() - startedAt) / 1000 : 0
      if (reason !== 'error' && hasAnyReading(latest)) {
        const result = buildResult(reason, latest, seconds)
        log.info(`Scan result:\n${JSON.stringify(result, null, 2)}`)
      }
      try {
        // Ask Presage's LLM what the readings mean while the SDK session is still open, because
        // the answer can only arrive then. The browser keeps its socket open to receive it.
        if (reason !== 'error' && reason !== 'disconnected') await explainReadings(s, reason, seconds)
      } catch (err) {
        log.error('Could not get an insight:', clean(err?.message ?? err))
        send(ws, { type: 'insight', status: 'unavailable', message: 'The explanation could not be fetched right now.' })
      }
      if (ws.readyState === ws.OPEN) ws.close(closeCode)
      try {
        await s?.stop()
      } catch (err) {
        log.error('Could not stop the SDK cleanly:', err?.code ?? err?.name)
      }
      // The next scan may start only now: the native SDK keeps process-wide state.
      release()
    }

    // Asks Presage's LLM insight what the readings mean, prints the answer to this service's
    // console and sends it to the browser. Presage forwards a summary of the measured numbers
    // (never video) and our prompt to its language model.
    async function explainReadings(s, reason, seconds) {
      if (!s || typeof s.requestInsight !== 'function' || !hasAnyReading(latest)) {
        send(ws, { type: 'insight', status: 'skipped', message: 'There were no readings to explain.' })
        return
      }
      if (seconds < config.insightMinSeconds) {
        log.info(`Presage insight skipped: the scan lasted ${seconds.toFixed(0)} s, under ${config.insightMinSeconds} s.`)
        send(ws, { type: 'insight', status: 'skipped', message: 'The scan was too short to explain. Try a scan of at least 15 seconds.' })
        return
      }
      send(ws, { type: 'insight', status: 'pending' })
      const outcome = await insights.ask(() => s.requestInsight(INSIGHT_PROMPT), config.insightTimeoutMs)
      let text = outcome.analysis
      let note = ''
      if (!text && !outcome.error && insights.latestAutomatic?.analysis) {
        text = insights.latestAutomatic.analysis
        note = ' (automatic, because the requested one did not arrive in time)'
      }
      if (text) {
        text = text.slice(0, MAX_INSIGHT_CHARS)
        log.info(`Presage LLM insight (scan ended: ${reason})${note}:\n${text}`)
        send(ws, { type: 'insight', status: 'ok', text })
      } else {
        log.error(`Presage LLM insight failed: ${clean(outcome.error) || `no answer within ${config.insightTimeoutMs / 1000} s`}`)
        send(ws, { type: 'insight', status: 'unavailable', message: 'The explanation could not be fetched right now. Your readings are still shown.' })
      }
    }

    const fail = (code, message, retryable = false) => {
      send(ws, { type: 'error', code, message, retryable })
      return finish('error', 1011)
    }

    // Turns an SDK error code into a plain message, without leaking SDK internals.
    const sdkFailure = (code, retryable, fallbackCode, fallbackMessage) => {
      const known = KEY_MESSAGES[code]
      return known ? fail(known[0], known[1], false) : fail(fallbackCode, fallbackMessage, retryable)
    }

    async function start(msg) {
      if (starting || session) return fail('already_started', 'The scan has already started.')
      const key = typeof msg.apiKey === 'string' ? msg.apiKey.trim() : ''
      if (!KEY_PATTERN.test(key)) {
        return fail('no_key', 'Add your Presage API key on the Account page, then try again.')
      }
      apiKey = key
      const w = Number(msg.width)
      const h = Number(msg.height)
      const ok = (n) => Number.isInteger(n) && n >= MIN_SIDE && n <= MAX_SIDE
      if (!ok(w) || !ok(h)) return fail('bad_size', 'The video size is not supported.')
      width = w
      height = h
      frameBytes = w * h * 3

      starting = true
      try {
        const created = await createSession(
          {
            onStatus: (status) => send(ws, { type: 'status', status }),
            onValidation: (code, hint) => send(ws, { type: 'validation', code, hint: String(hint ?? '') }),
            onMetrics: (summary) => {
              if (ended) return
              latest = mergeReadings(latest, summary)
              send(ws, { type: 'metrics', ...latest })
              // A result has arrived: stop the scan by itself.
              if (isComplete(latest)) finish('complete')
            },
            onInsight: (decoded) => insights.receive(decoded),
            onError: (code, message, retryable) => {
              // The SDK's own messages can mention internals; log them and send a plain one.
              log.error('SDK error', code, clean(message))
              sdkFailure(code, retryable, 'sdk_error', 'The scan stopped because of a problem with the measuring service.')
            },
          },
          { apiKey },
        )
        if (ended) {
          await created.stop().catch(() => {})
          return
        }
        created.start()
        session = created
      } catch (err) {
        log.error('Could not start the SDK:', err?.code, clean(err?.message))
        return sdkFailure(err?.code, Boolean(err?.retryable), 'start_failed', 'We could not start the measurement. Please try again.')
      } finally {
        starting = false
      }
      startedAt = Date.now()
      timer = setTimeout(() => finish('time_limit'), config.maxSeconds * 1000)
      send(ws, { type: 'ready', maxSeconds: config.maxSeconds })
    }

    ws.on('message', (data, isBinary) => {
      if (ended) return
      if (!isBinary) {
        let msg
        try {
          msg = JSON.parse(data.toString())
        } catch {
          return fail('bad_message', 'The message was not understood.')
        }
        if (msg?.type === 'start') start(msg)
        else if (msg?.type === 'stop') finish('stopped')
        return
      }

      if (!session) return // frames before "ready" are ignored
      if (data.length !== FRAME_HEADER_BYTES + frameBytes) {
        return fail('bad_frame', 'A video frame had the wrong size.')
      }

      const now = Date.now()
      if (now - windowStart >= 1000) {
        windowStart = now
        windowCount = 0
      }
      if (++windowCount > MAX_FPS) return

      const ts = data.readDoubleLE(0)
      // The SDK needs timestamps that always increase.
      if (!Number.isFinite(ts) || ts <= lastTs) return
      lastTs = ts
      try {
        session.sendFrame(data.subarray(FRAME_HEADER_BYTES), width, height, ts)
      } catch (err) {
        log.error('sendFrame failed:', err?.code, clean(err?.message))
        fail('frame_failed', 'The scan stopped because a frame could not be processed.')
      }
    })

    ws.on('close', () => {
      finish('disconnected')
    })
    ws.on('error', () => {})
  }

  return {
    server,
    activeCount: () => active,
    close: () =>
      new Promise((resolve) => {
        for (const c of wss.clients) c.terminate()
        server.close(() => resolve())
      }),
  }
}
