import { signals } from '../content.js'
import { pulsePath, breathPath } from '../lib/waves.js'

const pulseGlyph = pulsePath({ beats: 2, period: 70, base: 54, amp: 44 })
const breathGlyph = breathPath({ periods: 2, period: 70, mid: 32, amp: 20 })
const hrvTicks = [10, 32, 60, 76, 106, 126]

// Each glyph is a tiny drawing of the signal itself. Colour carries meaning on this page:
// crimson is pulse-related, aqua is breathing, ink is everything else.
function Glyph({ id }) {
  const common = { className: 'signal__glyph', viewBox: '0 0 140 64', 'aria-hidden': true, focusable: 'false' }
  const stroke = { fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (id === 'pulse') {
    return (
      <svg {...common}>
        <path d={pulseGlyph} stroke="var(--pulse)" {...stroke} />
      </svg>
    )
  }
  if (id === 'breathing') {
    return (
      <svg {...common}>
        <path d={breathGlyph} stroke="var(--breath)" {...stroke} />
      </svg>
    )
  }
  if (id === 'hrv') {
    return (
      <svg {...common}>
        {hrvTicks.map((x) => (
          <line key={x} x1={x} x2={x} y1="14" y2="50" stroke="var(--pulse)" {...stroke} />
        ))}
      </svg>
    )
  }
  return (
    <svg {...common}>
      <ellipse cx="70" cy="32" rx="26" ry="28" stroke="var(--ink)" {...stroke} strokeWidth="2.5" />
      <circle cx="60" cy="26" r="2.6" fill="var(--ink)" />
      <circle cx="80" cy="26" r="2.6" fill="var(--ink)" />
      <path d="M58 40 Q70 50 82 40" stroke="var(--ink)" {...stroke} strokeWidth="2.5" />
    </svg>
  )
}

export default function Signals() {
  return (
    <section className="section" id="signals" aria-labelledby="signals-title">
      <div className="container">
        <h2 className="h-section h-section--wide" id="signals-title">
          What the camera can read
        </h2>
        <ul className="signals">
          {signals.map((s) => (
            <li className="signal" key={s.id}>
              <Glyph id={s.id} />
              <h3 className="h-item">{s.name}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
