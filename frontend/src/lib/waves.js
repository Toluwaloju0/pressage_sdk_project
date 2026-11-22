// Path generators for the decorative signal traces. Pure functions, no dependencies.
// These draw illustrative shapes only. They are not computed from any real measurement.

// One pulse beat is designed on a 240-unit-wide, 74-unit-tall grid and scaled to fit.
// `period` is the width of one beat, `base` the baseline y, `amp` the peak height.
export function pulsePath({ beats, period, base, amp }) {
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
export function breathPath({ periods, period, mid, amp }) {
  const half = period / 2
  const reach = amp * 1.25
  let d = `M0,${mid}`
  for (let i = 0; i < periods; i += 1) {
    const o = i * period
    const f = (n) => n.toFixed(1)
    d += ` C${f(o + half * 0.34)},${f(mid - reach)} ${f(o + half * 0.66)},${f(mid - reach)} ${f(o + half)},${mid}`
    d += ` C${f(o + half + half * 0.34)},${f(mid + reach)} ${f(o + half + half * 0.66)},${f(mid + reach)} ${f(o + period)},${mid}`
  }
  return d
}
