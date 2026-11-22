const last = (list) => (Array.isArray(list) && list.length > 0 ? list[list.length - 1] : null)

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

function reading(item) {
  if (!item) return null
  const value = num(item.value)
  if (value === null) return null
  return { value, stable: Boolean(item.stable), confidence: num(item.confidence) }
}

// Turns the SDK's decoded protobuf into the small object the browser needs.
// The SDK sends batches, so the newest sample in each list is the current reading.
export function summarize(decoded) {
  const pulse = reading(last(decoded?.cardio?.pulseRate))
  const breathing = reading(last(decoded?.breathing?.rate))
  const h = last(decoded?.cardio?.hrv)
  const hrv =
    h && num(h.rmssd) !== null
      ? { rmssd: num(h.rmssd), sdnn: num(h.sdnn), stable: Boolean(h.stable), confidence: num(h.confidence) }
      : null
  return { pulse, breathing, hrv }
}
