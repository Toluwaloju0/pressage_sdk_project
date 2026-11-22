// LandingPage.jsx
// A single, self-contained React file: copy, styles, helpers and components all live here.
//
// Requirements: React 17+ with the automatic JSX runtime (Vite, Next.js, Create React App 5).
// No other dependencies. Fonts load from Google Fonts.
//
// Usage:
//   import LandingPage from './LandingPage.jsx'
//   <LandingPage />

/* ============================================================
   1. Settings: the things you are most likely to change
   ============================================================ */

// "Vitalis" is a working name.
const APP_NAME = 'Vitalis'

// Flip to true once the scan page exists. While false, the main button scrolls to
// "How it works" instead of linking to a page that does not exist yet.
const SCAN_ENABLED = false
const SCAN_PATH = '/scan'

/* ============================================================
   2. Copy
   ============================================================ */

const navLinks = [
  { label: 'How it works', href: '#how' },
  { label: 'Signals', href: '#signals' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'FAQ', href: '#faq' },
]

const hero = {
  title: 'Understand your vitals in plain language.',
  lede: 'Scan with your camera. We measure your pulse and breathing, then explain what the numbers can mean for everyday wellbeing. No wearable needed.',
  sampleNote: 'Illustrative sample, not a live reading.',
}

const steps = [
  {
    title: 'You turn on the camera',
    body: 'Nothing starts until you agree. Sit still in good light for a short scan, and stop whenever you like.',
  },
  {
    title: 'The scan measures your signals',
    body: 'Presage SmartSpectra reads subtle changes in your face on video to estimate your pulse, breathing and more.',
  },
  {
    title: 'We look up general guidance',
    body: 'Our server compares your numbers with published health information to find habits worth knowing about.',
  },
  {
    title: 'An AI model explains it simply',
    body: 'It rewrites the findings in everyday words with ideas to try. It never diagnoses, and it never suggests treatments or medicines.',
  },
]

const signals = [
  {
    id: 'pulse',
    name: 'Pulse',
    body: 'How many times your heart beats each minute. One of the most familiar wellness numbers.',
  },
  {
    id: 'breathing',
    name: 'Breathing',
    body: 'How many breaths you take each minute, and how steady they are.',
  },
  {
    id: 'hrv',
    name: 'Heart rate variability',
    body: 'The small differences in time between heartbeats. People often follow it as a general sign of recovery and stress.',
  },
  {
    id: 'expressions',
    name: 'Expressions',
    body: 'Facial expression cues the camera picks up during your scan.',
  },
]

const sample = {
  intro: [
    'Your numbers go in. A short report in plain words comes out.',
    'Every report follows the same shape: what we measured, what it can mean, and a few everyday habits worth trying.',
  ],
  readings: [
    { id: 'pulse', name: 'Pulse', value: '72', unit: 'beats per minute' },
    { id: 'breath', name: 'Breathing', value: '14', unit: 'breaths per minute' },
    { id: 'hrv', name: 'Variability', value: '48', unit: 'milliseconds' },
  ],
  meaning:
    'Your resting pulse and breathing sit in the range commonly seen in healthy adults at rest. Your heartbeat varied naturally from one beat to the next, which is expected.',
  habits: [
    'Keep a steady time for going to bed and waking up.',
    'Take a ten-minute walk after your biggest meal.',
    'When you feel tense, breathe slowly for two minutes.',
  ],
  foot: 'General wellness information. Not medical advice.',
}

const privacy = {
  title: 'You decide when the camera is on.',
  lede: 'A camera scan is personal. Here is exactly what happens, and what we will not do.',
  does: [
    'The camera stays off until you press start and confirm.',
    'A clear indicator shows while it is on, and you can stop at any moment.',
    'Camera frames go to Presage’s SmartSpectra service to calculate your vitals.',
    'Your numbers go to our server, which finds general guidance and asks an AI model to write your summary.',
  ],
  doesNot: [
    'Save your video.',
    'Scan anyone without their knowledge.',
    'Diagnose conditions, or recommend treatments or medicines.',
    'Sell your data.',
  ],
}

const faqs = [
  {
    q: 'Is this medical advice?',
    a: 'No. Vitalis gives general wellness information. It does not diagnose conditions or recommend treatments or medicines, and it is not a medical device. If you are worried about your health, talk to a doctor or another qualified professional. In an emergency, call your local emergency number.',
  },
  {
    q: 'Do you save my video?',
    a: 'No. Your camera frames are sent to Presage’s SmartSpectra service to measure your vitals, and we do not keep a copy of your video. Presage handles that data under its own policy, which we will link before you start a scan.',
  },
  {
    q: 'What do I need?',
    a: 'A device with a front-facing camera, a modern browser and a well-lit space. You sit still for a short scan.',
  },
  {
    q: 'How accurate are the numbers?',
    a: 'Camera-based readings are estimates. Lighting, movement and camera quality all affect them, so treat them as a wellness snapshot rather than a clinical measurement.',
  },
  {
    q: 'Where does the advice come from?',
    a: 'Your numbers are compared with published general health information, then an AI model rewrites the result in plain language. It is instructed not to diagnose or prescribe, and each report lists the sources it used.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Your report is shown to you and is not stored on our servers.',
  },
]

const footerFine =
  'Vitalis provides general wellness information. It is not a medical device and does not diagnose, treat or prevent any condition. If you have a health concern, talk to a qualified professional. In an emergency, contact your local emergency services.'

/* ============================================================
   3. Wave helpers
   Pure functions that draw the decorative signal traces.
   They are illustrative shapes, not computed from any real measurement.
   ============================================================ */

// One pulse beat is designed on a 240-unit-wide, 74-unit-tall grid and scaled to fit.
// `period` is the width of one beat, `base` the baseline y, `amp` the peak height.
function pulsePath({ beats, period, base, amp }) {
  const k = period / 240
  const y = (h) => (base - (h * amp) / 74).toFixed(1)
  let d = `M0,${base}`
  for (let i = 0; i < beats; i += 1) {
    const x = (v) => (i * period + v * k).toFixed(1)
    d += ` C${x(22)},${y(0)} ${x(28)},${y(74)} ${x(54)},${y(74)}`
    d += ` C${x(78)},${y(74)} ${x(86)},${y(30)} ${x(108)},${y(28)}`
    d += ` C${x(120)},${y(27)} ${x(128)},${y(42)} ${x(146)},${y(40)}`
    d += ` C${x(180)},${y(36)} ${x(205)},${y(0)} ${x(240)},${y(0)}`
  }
  return d
}

// A smooth wave made of one hump up and one hump down per period.
function breathPath({ periods, period, mid, amp }) {
  const half = period / 2
  const reach = amp * 1.25
  const f = (n) => n.toFixed(1)
  let d = `M0,${mid}`
  for (let i = 0; i < periods; i += 1) {
    const o = i * period
    d += ` C${f(o + half * 0.34)},${f(mid - reach)} ${f(o + half * 0.66)},${f(mid - reach)} ${f(o + half)},${mid}`
    d += ` C${f(o + half + half * 0.34)},${f(mid + reach)} ${f(o + half + half * 0.66)},${f(mid + reach)} ${f(o + period)},${mid}`
  }
  return d
}

// Both hero traces scroll at the same speed (288px per second), so they share one time axis:
//   pulse:     240px per beat   -> 72 beats per minute
//   breathing: 1234px per cycle -> about 14 breaths per minute
// These sizes must match the keyframes in the CSS below.
const PULSE = { beats: 12, period: 240, base: 104, amp: 78 }
const BREATH = { periods: 3, period: 1234, mid: 65, amp: 40 }
const heroPulseD = pulsePath(PULSE)
const heroBreathD = breathPath(BREATH)

const glyphPulseD = pulsePath({ beats: 2, period: 70, base: 54, amp: 44 })
const glyphBreathD = breathPath({ periods: 2, period: 70, mid: 32, amp: 20 })
const hrvTicks = [10, 32, 60, 76, 106, 126]

/* ============================================================
   4. Styles
   Colour carries meaning on this page: crimson is pulse, aqua is breathing.
   Ink and paper do everything else, so the two signal colours stay readable as signals.
   ============================================================ */

const css = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..600&display=swap');

:root {
  --paper: #f2f5f7;
  --surface: #ffffff;
  --tint: #e4ebf0;
  --line: #cbd6dd;
  --ink: #14232e;
  --muted: #51626d;
  --pulse: #c21f47;
  --breath: #2e8fa3;
  --breath-ink: #1d6677;
  --focus: #1d6677;

  --font-display: 'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Source Serif 4', Georgia, 'Times New Roman', serif;

  --gutter: clamp(20px, 4vw, 40px);
  --maxw: 1180px;
}

/* Base */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4,
p,
ul,
ol,
dl,
dd {
  margin: 0;
}

ul,
ol {
  padding: 0;
  list-style: none;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
  border-radius: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: var(--gutter);
  top: -100px;
  z-index: 10;
  padding: 0.6rem 1rem;
  background: var(--ink);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 600;
}

.skip-link:focus {
  top: 12px;
}

.container {
  width: 100%;
  max-width: var(--maxw);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

/* Layout */
.section {
  padding-block: clamp(72px, 10vw, 128px);
}

.section--tint {
  background: var(--tint);
}

.section--last {
  padding-bottom: clamp(88px, 11vw, 144px);
}

.split {
  display: grid;
  gap: 40px;
}

@media (min-width: 900px) {
  .split {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 72px;
  }
}

/* Type */
.h-display {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.6rem, 6.4vw, 5.25rem);
  line-height: 1;
  letter-spacing: -0.035em;
  font-variation-settings: 'opsz' 96;
}

.h-section {
  font-family: var(--font-display);
  font-weight: 650;
  font-size: clamp(1.9rem, 3.8vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  max-width: 16ch;
  font-variation-settings: 'opsz' 72;
}

.h-section--wide {
  max-width: 24ch;
}

.h-item {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.lede {
  max-width: 52ch;
  color: var(--muted);
  font-size: clamp(1.1rem, 1.6vw, 1.3rem);
  line-height: 1.6;
}

.lede--tight {
  margin-top: 20px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.5rem;
  border: 2px solid var(--ink);
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.btn--primary {
  background: var(--ink);
  color: var(--paper);
}

.btn--primary:hover {
  background: #243b4a;
}

.btn--ghost {
  background: transparent;
  color: var(--ink);
}

.btn--ghost:hover {
  background: var(--tint);
}

.btn--small {
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
}

/* Nav */
.nav {
  padding-block: 20px;
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.nav__links {
  display: none;
  gap: 28px;
  font-family: var(--font-display);
  font-weight: 500;
}

.nav__links a {
  color: var(--muted);
  text-decoration: none;
}

.nav__links a:hover {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 6px;
}

@media (min-width: 820px) {
  .nav__links {
    display: flex;
  }
}

/* Hero */
.hero {
  padding-top: clamp(40px, 7vw, 88px);
}

.hero__grid {
  display: grid;
  gap: 28px;
  align-items: end;
}

.hero__title {
  max-width: 12ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

@media (min-width: 900px) {
  .hero__grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 56px;
  }
}

/* Signal ribbon, the hero's one big idea.
   Pulse scrolls 960px (4 beats) every 3.3333s and breathing scrolls 1234px every 4.2847s.
   That is 288px per second for both, so they share one time axis.
   Keep these numbers in sync with PULSE and BREATH in the script above. */
.ribbon {
  margin-top: clamp(48px, 7vw, 88px);
  background: var(--surface);
  border-block: 1px solid var(--line);
}

.trace {
  position: relative;
  height: 130px;
  overflow: hidden;
}

.trace + .trace {
  border-top: 1px solid var(--line);
}

.trace__scroll {
  position: absolute;
  inset: 0;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
}

.trace__svg {
  display: block;
  will-change: transform;
}

.trace__svg--pulse {
  width: 2880px;
  animation: slide-pulse 3.3333s linear infinite;
}

.trace__svg--breath {
  width: 3702px;
  animation: slide-breath 4.2847s linear infinite;
}

@keyframes slide-pulse {
  to {
    transform: translateX(-960px);
  }
}

@keyframes slide-breath {
  to {
    transform: translateX(-1234px);
  }
}

.trace__label {
  position: absolute;
  inset: 0 0 auto 0;
  max-width: var(--maxw);
  margin-inline: auto;
  padding: 14px var(--gutter) 0;
  pointer-events: none;
}

.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 0.35rem 0.8rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
}

.chip__dot {
  width: 10px;
  height: 10px;
  align-self: center;
  border-radius: 50%;
}

.chip__dot--pulse {
  background: var(--pulse);
}

.chip__dot--breath {
  background: var(--breath);
}

.chip__value {
  font-variant-numeric: tabular-nums;
}

.ribbon__note {
  padding-block: 14px 0;
  color: var(--muted);
  font-size: 0.9rem;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .trace__svg {
    animation: none;
  }
}

/* How it works */
.step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px 28px;
  padding-block: 28px;
  border-top: 1px solid var(--line);
}

.step:last-child {
  border-bottom: 1px solid var(--line);
}

.step__num {
  min-width: 1.4ch;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2.6rem;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.step__body {
  max-width: 56ch;
}

.step__body p {
  margin-top: 6px;
  color: var(--muted);
}

/* Signals */
.signals {
  display: grid;
  gap: 48px 56px;
  margin-top: 56px;
}

@media (min-width: 700px) {
  .signals {
    grid-template-columns: 1fr 1fr;
  }
}

.signal__glyph {
  display: block;
  width: 140px;
  height: 64px;
  margin-bottom: 16px;
}

.signal p {
  max-width: 44ch;
  margin-top: 8px;
  color: var(--muted);
}

/* Sample report */
.sheet {
  padding: clamp(22px, 3vw, 36px);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 18px 40px -24px rgba(20, 35, 46, 0.35);
}

.sheet__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.tag {
  padding: 0.25rem 0.65rem;
  background: var(--tint);
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
}

.readings {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding-block: 22px;
}

.reading__name {
  margin-bottom: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.95rem;
}

.reading__value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1;
  letter-spacing: -0.03em;
}

.reading__unit {
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.reading--pulse .reading__value,
.reading--hrv .reading__value {
  color: var(--pulse);
}

.reading--breath .reading__value {
  color: var(--breath-ink);
}

.sheet__h {
  margin-top: 22px;
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 1.05rem;
  line-height: 1.3;
}

.sheet p {
  margin-top: 6px;
}

.sheet__list {
  margin-top: 8px;
  padding-left: 1.1rem;
  list-style: disc;
}

.sheet__list li + li {
  margin-top: 4px;
}

.sheet__foot {
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.9rem;
}

/* Privacy */
.panel {
  display: grid;
  gap: 40px;
  margin-top: 48px;
  padding: clamp(24px, 4vw, 48px);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
}

@media (min-width: 800px) {
  .panel {
    grid-template-columns: 1fr 1fr;
    gap: 56px;
  }
}

.panel__list {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

.panel__list li {
  position: relative;
  padding-left: 1.6rem;
}

.panel__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.8em;
  width: 0.7rem;
  height: 2px;
  background: var(--ink);
}

/* FAQ */
.faq {
  max-width: 760px;
  margin-top: 40px;
  border-top: 1px solid var(--line);
}

.faq details {
  border-bottom: 1px solid var(--line);
}

.faq summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  cursor: pointer;
  list-style: none;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.15rem;
}

.faq summary::-webkit-details-marker {
  display: none;
}

.faq summary::after {
  content: '+';
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1;
}

.faq details[open] summary::after {
  content: '\2212';
}

.faq__answer {
  max-width: 62ch;
  padding-bottom: 22px;
  color: var(--muted);
}

/* Footer */
.footer {
  padding-block: 56px;
  background: var(--ink);
  color: #dce5eb;
}

.footer__grid {
  display: grid;
  gap: 28px;
}

@media (min-width: 800px) {
  .footer__grid {
    grid-template-columns: 1fr 2fr;
    gap: 56px;
  }
}

.footer__name {
  margin-bottom: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}

.footer__fine {
  max-width: 70ch;
  color: #b9c7d0;
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer a {
  color: #fff;
}

/* Small screens */
@media (max-width: 520px) {
  .readings {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .step {
    gap: 14px 18px;
  }

  .step__num {
    font-size: 2.1rem;
  }
}
`

/* ============================================================
   5. Components
   ============================================================ */

// One place decides where the primary button goes, so flipping SCAN_ENABLED updates every button.
function Cta({ small = false }) {
  const href = SCAN_ENABLED ? SCAN_PATH : '#how'
  const label = SCAN_ENABLED ? 'Start a scan' : 'See how it works'
  return (
    <a className={`btn btn--primary${small ? ' btn--small' : ''}`} href={href}>
      {label}
    </a>
  )
}

function Logo() {
  return (
    <a className="logo" href="#top" aria-label={`${APP_NAME} home`}>
      <svg width="30" height="28" viewBox="0 0 30 28" aria-hidden="true">
        <path
          d="M2 15h6l3-9 5 17 3-8h9"
          fill="none"
          stroke="var(--pulse)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {APP_NAME}
    </a>
  )
}

function Nav() {
  return (
    <header className="nav" id="top">
      <div className="container nav__inner">
        <Logo />
        <nav aria-label="Main">
          <ul className="nav__links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        {SCAN_ENABLED && <Cta small />}
      </div>
    </header>
  )
}

function SignalRibbon({ note }) {
  const line = { fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <div className="container">
      <div
        className="ribbon"
        role="img"
        aria-label="Animated example of a pulse wave above a slower breathing wave. Illustrative only."
      >
        <div className="trace" aria-hidden="true">
          <div className="trace__scroll">
            <svg className="trace__svg trace__svg--pulse" viewBox="0 0 2880 130" height="130" focusable="false">
              <path d={heroPulseD} stroke="var(--pulse)" {...line} />
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
            <svg className="trace__svg trace__svg--breath" viewBox="0 0 3702 130" height="130" focusable="false">
              <path d={heroBreathD} stroke="var(--breath)" {...line} />
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

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <h1 className="h-display hero__title" id="hero-title">
          {hero.title}
        </h1>
        <div>
          <p className="lede">{hero.lede}</p>
          <div className="hero__actions">
            <Cta />
            <a className="btn btn--ghost" href="#privacy">
              Read our privacy promises
            </a>
          </div>
        </div>
      </div>
      <SignalRibbon note={hero.sampleNote} />
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="section" id="how" aria-labelledby="how-title">
      <div className="container split">
        <div>
          <h2 className="h-section" id="how-title">
            From a short scan to a plain-language report
          </h2>
          <p className="lede lede--tight">Four steps, and you are in control of the first one.</p>
        </div>
        <ol className="steps">
          {steps.map((step, i) => (
            <li className="step" key={step.title}>
              <span className="step__num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="step__body">
                <h3 className="h-item">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// Each glyph is a tiny drawing of the signal itself. Colour carries meaning on this page:
// crimson is pulse-related, aqua is breathing, ink is everything else.
function Glyph({ id }) {
  const common = { className: 'signal__glyph', viewBox: '0 0 140 64', 'aria-hidden': true, focusable: 'false' }
  const stroke = { fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (id === 'pulse') {
    return (
      <svg {...common}>
        <path d={glyphPulseD} stroke="var(--pulse)" {...stroke} />
      </svg>
    )
  }
  if (id === 'breathing') {
    return (
      <svg {...common}>
        <path d={glyphBreathD} stroke="var(--breath)" {...stroke} />
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

function Signals() {
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

function SampleReport() {
  return (
    <section className="section section--tint" id="report" aria-labelledby="report-title">
      <div className="container split">
        <div>
          <h2 className="h-section" id="report-title">
            What you get back
          </h2>
          {sample.intro.map((p) => (
            <p className="lede lede--tight" key={p}>
              {p}
            </p>
          ))}
        </div>

        <article className="sheet" aria-label="Example report">
          <header className="sheet__head">
            <h3 className="h-item">Your scan report</h3>
            <span className="tag">Sample data</span>
          </header>

          <dl className="readings">
            {sample.readings.map((r) => (
              <div className={`reading reading--${r.id}`} key={r.id}>
                <dt className="reading__name">{r.name}</dt>
                <dd className="reading__value">{r.value}</dd>
                <dd className="reading__unit">{r.unit}</dd>
              </div>
            ))}
          </dl>

          <h4 className="sheet__h">In plain words</h4>
          <p>{sample.meaning}</p>

          <h4 className="sheet__h">Habits worth trying this week</h4>
          <ul className="sheet__list">
            {sample.habits.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <p className="sheet__foot">{sample.foot}</p>
        </article>
      </div>
    </section>
  )
}

function Privacy() {
  return (
    <section className="section" id="privacy" aria-labelledby="privacy-title">
      <div className="container">
        <h2 className="h-section h-section--wide" id="privacy-title">
          {privacy.title}
        </h2>
        <p className="lede lede--tight">{privacy.lede}</p>

        <div className="panel">
          <div>
            <h3 className="h-item">What happens</h3>
            <ul className="panel__list">
              {privacy.does.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h-item">What we will not do</h3>
            <ul className="panel__list">
              {privacy.doesNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// Native <details> keeps this keyboard and screen-reader accessible with no extra code.
function Faq() {
  return (
    <section className="section section--last" id="faq" aria-labelledby="faq-title">
      <div className="container">
        <h2 className="h-section" id="faq-title">
          Questions people ask
        </h2>
        <div className="faq">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p className="faq__answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__name">{APP_NAME}</p>
          <p className="footer__fine">
            Built for the <a href="https://dev.to/challenges/presage-2026-11-04">Presage SmartSpectra SDK Challenge</a>{' '}
            on DEV. “{APP_NAME}” is a working name.
          </p>
        </div>
        <p className="footer__fine">{footerFine}</p>
      </div>
    </footer>
  )
}

/* ============================================================
   6. The page
   ============================================================ */

export default function LandingPage() {
  return (
    <>
      <style>{css}</style>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Signals />
        <SampleReport />
        <Privacy />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
