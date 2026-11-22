import { pulsePath, breathPath } from '../lib/waves.js'

// Both traces scroll at the same speed (288px per second), so they share one time axis:
//   pulse:     240px per beat   -> 72 beats per minute
//   breathing: 1234px per cycle -> about 14 breaths per minute
// The sizes below must match the keyframes in styles.css.
const PULSE = { beats: 12, period: 240, base: 104, amp: 78 }
const BREATH = { periods: 3, period: 1234, mid: 65, amp: 40 }

const pulseD = pulsePath(PULSE)
const breathD = breathPath(BREATH)

export default function SignalRibbon({ note }) {
  return (
    <div className="container">
      <div
        className="ribbon"
        role="img"
        aria-label="Animated example of a pulse wave above a slower breathing wave. Illustrative only."
      >
        <div className="trace" aria-hidden="true">
          <div className="trace__scroll">
            <svg
              className="trace__svg trace__svg--pulse"
              viewBox="0 0 2880 130"
              height="130"
              focusable="false"
            >
              <path d={pulseD} fill="none" stroke="var(--pulse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="trace__label">
            <span className="chip">
              <span className="chip__dot chip__dot--pulse" />
              Pulse <span className="chip__value">72 bpm</span>
            </span>
          </div>
        </div>
        <div className="trace" aria-hidden="true">
          <div className="trace__scroll">
            <svg
              className="trace__svg trace__svg--breath"
              viewBox="0 0 3702 130"
              height="130"
              focusable="false"
            >
              <path d={breathD} fill="none" stroke="var(--breath)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="trace__label">
            <span className="chip">
              <span className="chip__dot chip__dot--breath" />
              Breathing <span className="chip__value">14 per min</span>
            </span>
          </div>
        </div>
      </div>
      <p className="ribbon__note">{note}</p>
    </div>
  )
}
