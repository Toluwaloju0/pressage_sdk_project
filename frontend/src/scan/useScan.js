import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiKey } from '../account/apiKey.js'
import { scanPage as copy } from '../content.js'
import { saveExplanation } from '../insight/explanation.js'

// Frames are cropped to 4:3 and shrunk before they are sent, to keep the upload small.
export const FRAME = { width: 400, height: 300, fps: 30 }
const HEADER_BYTES = 8

const emptyReadings = { pulse: null, breathing: null, hrv: null }

function cameraMessage(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return copy.cameraBlocked
    case 'NotFoundError':
    case 'OverconstrainedError':
      return copy.cameraMissing
    case 'NotReadableError':
    case 'AbortError':
      return copy.cameraBusy
    default:
      return copy.cameraFailed
  }
}

function socketUrl() {
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${window.location.host}/scan-ws`
}

// Owns the whole scan: the camera, the connection to our scan service, and what comes back.
// Nothing is requested until start() is called, and start() is only called from a button.
//
// phase: idle -> requesting (browser is asking for the camera) -> connecting -> running
//        -> ending (camera off, waiting for the service to finish) -> ended
// After 'ended' the connection stays open a little longer for the AI explanation (insight).
// insight: { status: 'idle' | 'pending' | 'ok' | 'unavailable' | 'skipped', text, message }
const noInsight = { status: 'idle', text: '', message: '' }

export function useScan() {
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [readings, setReadings] = useState(emptyReadings)
  const [hint, setHint] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [maxSeconds, setMaxSeconds] = useState(60)
  const [stream, setStream] = useState(null)
  const [endNote, setEndNote] = useState('')
  const [insight, setInsight] = useState(noInsight)
  const run = useRef(null)
  const busy = useRef(false)

  // Turns the camera off and stops sending pictures. The connection is kept if `keepSocket`.
  const stopCamera = useCallback((r) => {
    clearInterval(r.frameTimer)
    clearInterval(r.clock)
    r.frameTimer = null
    r.clock = null
    r.stream?.getTracks().forEach((t) => t.stop())
    r.stream = null
    setStream(null)
  }, [])

  // Turns everything off. Safe to call more than once.
  const release = useCallback(
    (sendStop) => {
      const r = run.current
      run.current = null
      if (!r) return
      stopCamera(r)
      if (r.ws && r.ws.readyState <= WebSocket.OPEN) {
        try {
          if (sendStop && !r.ended && r.ws.readyState === WebSocket.OPEN) r.ws.send(JSON.stringify({ type: 'stop' }))
          r.ws.close()
        } catch {
          /* already closed */
        }
      }
    },
    [stopCamera],
  )

  const fail = useCallback(
    (message, code = '') => {
      release(false)
      setError(message)
      setErrorCode(code)
      setPhase('idle')
    },
    [release],
  )

  // The person (or a hidden tab) ends the scan: camera off now, then wait for the service's answer.
  const beginEnding = useCallback(
    (note = '') => {
      const r = run.current
      if (!r) return
      stopCamera(r)
      setEndNote(note)
      if (r.ws && r.ws.readyState === WebSocket.OPEN && !r.stopSent) {
        r.stopSent = true
        r.ws.send(JSON.stringify({ type: 'stop' }))
        setPhase('ending')
      } else {
        release(false)
        setPhase('ended')
      }
    },
    [release, stopCamera],
  )

  const start = useCallback(async () => {
    if (busy.current || run.current) return
    const apiKey = getApiKey()
    if (!apiKey) {
      setError(copy.noKeyError)
      setErrorCode('no_key')
      return
    }
    busy.current = true
    setError('')
    setErrorCode('')
    setEndNote('')
    setReadings(emptyReadings)
    setInsight(noInsight)
    setHint('')
    setElapsed(0)
    setPhase('requesting')

    let media
    try {
      // This is the call that makes the browser ask the person for camera permission.
      media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        audio: false,
      })
    } catch (err) {
      busy.current = false
      setError(cameraMessage(err))
      setPhase('idle')
      return
    }

    const r = { stream: media, ws: null, frameTimer: null, clock: null, ready: false, ended: false, stopSent: false }
    run.current = r
    setStream(media)
    setPhase('connecting')

    // If the camera is taken away (unplugged, or turned off from the browser), end the scan.
    media.getVideoTracks()[0]?.addEventListener('ended', () => {
      if (run.current === r && !r.ended) fail(copy.cameraLost)
    })

    const ws = new WebSocket(socketUrl())
    ws.binaryType = 'arraybuffer'
    r.ws = ws

    // The key is sent once, to start this scan, and is never written to a server by us.
    ws.onopen = () => ws.send(JSON.stringify({ type: 'start', width: FRAME.width, height: FRAME.height, apiKey }))

    ws.onmessage = (event) => {
      if (run.current !== r || typeof event.data !== 'string') return
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }
      if (msg.type === 'ready') {
        r.ready = true
        setMaxSeconds(msg.maxSeconds)
        setPhase('running')
        const began = performance.now()
        r.clock = setInterval(() => setElapsed(Math.floor((performance.now() - began) / 1000)), 500)
        r.frameTimer = setInterval(() => sendFrame(r), 1000 / FRAME.fps)
      } else if (msg.type === 'metrics') {
        r.latest = { pulse: msg.pulse, breathing: msg.breathing, hrv: msg.hrv }
        setReadings(r.latest)
      } else if (msg.type === 'validation') {
        setHint(msg.hint || '')
      } else if (msg.type === 'error') {
        fail(msg.message || copy.serviceFailed, msg.code || '')
      } else if (msg.type === 'ended') {
        if (msg.reason === 'error') return
        r.ended = true
        stopCamera(r)
        setPhase('ended')
        setEndNote((note) =>
          note || (msg.reason === 'complete' ? copy.complete : msg.reason === 'time_limit' ? copy.timeLimit : ''),
        )
        r.endReason = msg.reason
      } else if (msg.type === 'insight') {
        const next = {
          status: msg.status,
          text: typeof msg.text === 'string' ? msg.text : '',
          message: typeof msg.message === 'string' ? msg.message : '',
        }
        setInsight(next)
        if (next.status === 'ok' && next.text) {
          saveExplanation({ text: next.text, readings: r.latest ?? null, reason: r.endReason ?? '' })
        }
      }
    }

    ws.onclose = () => {
      if (run.current !== r) return
      if (r.ended) {
        // The service closes the connection once it has said all it will say.
        run.current = null
        setInsight((cur) => (cur.status === 'pending' ? { status: 'unavailable', text: '', message: copy.insightLost } : cur))
        return
      }
      fail(r.ready ? copy.connectionLost : copy.cannotConnect)
    }
    busy.current = false
  }, [fail, stopCamera])

  const stop = useCallback(() => beginEnding(''), [beginEnding])

  // Leaving the page, or hiding the tab, always turns the camera off.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && run.current && !run.current.ended) beginEnding(copy.tabHidden)
    }
    const onLeave = () => release(true)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onLeave)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onLeave)
      release(true)
    }
  }, [beginEnding, release])

  const reset = useCallback(() => {
    release(true)
    setPhase('idle')
    setError('')
    setErrorCode('')
    setEndNote('')
    setInsight(noInsight)
  }, [release])

  return { phase, error, errorCode, readings, hint, elapsed, maxSeconds, stream, endNote, insight, start, stop, reset }
}

// Draws the current camera picture, shrinks it, and sends it as plain RGB.
// Each message is: 8 bytes of capture time (microseconds), then the pixels.
const canvas = document.createElement('canvas')
canvas.width = FRAME.width
canvas.height = FRAME.height
const ctx = canvas.getContext('2d', { willReadFrequently: true })
const message = new ArrayBuffer(HEADER_BYTES + FRAME.width * FRAME.height * 3)
const view = new DataView(message)
const rgb = new Uint8Array(message, HEADER_BYTES)
const video = document.createElement('video')
video.muted = true
video.playsInline = true

function sendFrame(r) {
  const ws = r.ws
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  // If the connection is behind, skip this picture rather than queue it up.
  if (ws.bufferedAmount > message.byteLength * 2) return
  if (video.srcObject !== r.stream) {
    video.srcObject = r.stream
    video.play().catch(() => {})
  }
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh || video.readyState < 2) return

  // Crop the middle of the picture to 4:3 so faces are not stretched.
  const target = FRAME.width / FRAME.height
  let sw = vw
  let sh = vh
  if (vw / vh > target) sw = vh * target
  else sh = vw / target
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, FRAME.width, FRAME.height)
  const rgba = ctx.getImageData(0, 0, FRAME.width, FRAME.height).data

  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i]
    rgb[j + 1] = rgba[i + 1]
    rgb[j + 2] = rgba[i + 2]
  }
  view.setFloat64(0, performance.now() * 1000, true)
  ws.send(message)
}
