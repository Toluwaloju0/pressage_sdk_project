import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiKey } from '../account/apiKey.js'
import InsightView from '../components/InsightView.jsx'
import { subscribe } from '../lib/store.js'
import { clearExplanation, loadExplanation } from '../insight/explanation.js'
import { APP_NAME } from '../config.js'
import { scanPage as copy } from '../content.js'
import { useScan } from '../scan/useScan.js'

function Reading({ label, unit, reading }) {
  const has = reading && typeof reading.value === 'number'
  return (
    <div className="reading">
      <div className="reading__label">{label}</div>
      <div className="reading__value">
        {has ? Math.round(reading.value) : '--'}
        <span className="reading__unit"> {unit}</span>
      </div>
      <div className="reading__state">{has ? (reading.stable ? copy.steady : copy.settling) : copy.waiting}</div>
    </div>
  )
}

function Consent({ onStart, error, busy }) {
  const [agreed, setAgreed] = useState(false)
  const id = useId()
  return (
    <div className="consent">
      <h2 className="h-item">{copy.consentTitle}</h2>
      <ul className="consent__list">
        {copy.consentPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="consent__tips">{copy.tips}</p>

      <label className="check consent__check" htmlFor={id}>
        <input id={id} type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>{copy.agree}</span>
      </label>

      <button type="button" className="btn btn--primary" disabled={!agreed || busy} onClick={onStart}>
        {busy ? copy.requesting : copy.startButton}
      </button>
      {busy && <p className="status">{copy.requestingHelp}</p>}
      <p className="status status--error" role="alert">
        {error}
      </p>
    </div>
  )
}

function Live({ stream, phase, elapsed, maxSeconds, hint, readings, onStop }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream
  }, [stream])
  const running = phase === 'running'
  const percent = Math.min(100, Math.round((elapsed / maxSeconds) * 100))
  return (
    <div className="live">
      <div className="live__stage">
        {/* Mirrored like a mirror, for the person looking at it. What is measured is not mirrored. */}
        <video ref={ref} className="live__video" autoPlay muted playsInline aria-label={copy.previewLabel} />
        <div className="live__badge" role="status">
          <span className="live__dot" aria-hidden="true" />
          {copy.cameraOn}
        </div>
      </div>

      <div className="live__side">
        <p className="live__state" role="status">
          {running ? copy.measuring : copy.connecting}
        </p>
        {running && (
          <div
            className="progress"
            role="progressbar"
            aria-label={copy.progressLabel}
            aria-valuemin={0}
            aria-valuemax={maxSeconds}
            aria-valuenow={Math.min(elapsed, maxSeconds)}
          >
            <div className="progress__bar" style={{ width: `${percent}%` }} />
          </div>
        )}
        <p className="live__hint" aria-live="polite">
          {hint}
        </p>
        <div className="readings">
          <Reading label={copy.pulse} unit={copy.pulseUnit} reading={readings.pulse} />
          <Reading label={copy.breathing} unit={copy.breathingUnit} reading={readings.breathing} />
        </div>
        <button type="button" className="btn btn--ghost" onClick={onStop}>
          {copy.stopButton}
        </button>
      </div>
    </div>
  )
}

function NoKey() {
  return (
    <div className="consent">
      <h2 className="h-item">{copy.noKeyTitle}</h2>
      <p className="lede lede--tight">{copy.noKeyBody}</p>
      <div className="page__action">
        <Link className="btn btn--primary" to="/account">
          {copy.noKeyLink}
        </Link>
      </div>
    </div>
  )
}

function InsightPanel({ insight }) {
  if (insight.status === 'idle') return null
  return (
    <section className="insight-panel" aria-labelledby="insight-title">
      <h2 className="h-item" id="insight-title">
        {copy.insightTitle}
      </h2>
      {insight.status === 'pending' && (
        <p className="status" role="status">
          {copy.insightPending}
        </p>
      )}
      {insight.status === 'ok' && <InsightView text={insight.text} />}
      {insight.status === 'unavailable' && <p role="status">{insight.message || copy.insightUnavailable}</p>}
      {insight.status === 'skipped' && <p role="status">{insight.message || copy.insightSkipped}</p>}
    </section>
  )
}

function Latest() {
  const [saved, setSaved] = useState(loadExplanation)
  useEffect(() => subscribe(() => setSaved(loadExplanation())), [])
  if (!saved) return null
  return (
    <section className="insight-panel" aria-labelledby="latest-title">
      <h2 className="h-item" id="latest-title">
        {copy.latestTitle}
      </h2>
      <p className="note">
        {copy.latestWhen(saved.savedAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }))}
      </p>
      <InsightView text={saved.text} />
      <button type="button" className="btn btn--ghost btn--small" onClick={clearExplanation}>
        {copy.clearLatest}
      </button>
    </section>
  )
}

export default function ScanPage() {
  const scan = useScan()
  const [hasKey, setHasKey] = useState(() => Boolean(getApiKey()))
  useEffect(() => subscribe(() => setHasKey(Boolean(getApiKey()))), [])

  useEffect(() => {
    const previous = document.title
    document.title = `${copy.title} | ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [])

  const { phase } = scan
  let body
  if (phase === 'connecting' || phase === 'running') {
    body = <Live {...scan} onStop={scan.stop} />
  } else if (phase === 'ending') {
    body = <p className="status" role="status">{copy.ending}</p>
  } else if (phase === 'ended') {
    body = (
      <div className="result">
        <h2 className="h-item">{copy.endedTitle}</h2>
        {scan.endNote && <p>{scan.endNote}</p>}
        <div className="readings">
          <Reading label={copy.pulse} unit={copy.pulseUnit} reading={scan.readings.pulse} />
          <Reading label={copy.breathing} unit={copy.breathingUnit} reading={scan.readings.breathing} />
        </div>
        <InsightPanel insight={scan.insight} />
        <p className="note">{copy.disclaimer}</p>
        <button type="button" className="btn btn--primary" onClick={scan.reset}>
          {copy.again}
        </button>
      </div>
    )
  } else if (!hasKey) {
    body = <NoKey />
  } else {
    body = (
      <>
        <Consent onStart={scan.start} error={scan.error} busy={phase === 'requesting'} />
        {scan.errorCode === 'bad_key' || scan.errorCode === 'no_credit' ? (
          <p>
            <Link className="step__link" to="/account">
              {copy.noKeyLink}
            </Link>
          </p>
        ) : null}
      </>
    )
  }

  return (
    <main id="main" className="page">
      <div className="container">
        <div className="scan">
          <h1 className="h-section h-section--wide">{copy.title}</h1>
          {phase === 'idle' && hasKey && <p className="lede lede--tight">{copy.lede}</p>}
          {body}
          {phase === 'idle' && <Latest />}
        </div>
      </div>
    </main>
  )
}
