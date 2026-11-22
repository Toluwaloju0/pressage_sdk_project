// Decides when a scan has a usable result and builds the result object that is printed.

// A scan is "complete" once pulse and breathing have both steadied. The SDK marks each
// reading `stable` when it is confident in it, so we rely on that instead of our own rules.
export function isComplete(latest) {
  return Boolean(latest.pulse?.stable && latest.breathing?.stable)
}

export function hasAnyReading(latest) {
  return Boolean(latest.pulse || latest.breathing || latest.hrv)
}

// Merges a new batch into what we already know. A batch can leave a measurement out
// (null) without meaning the earlier reading vanished, so only non-null values replace.
export function mergeReadings(latest, batch) {
  return {
    pulse: batch.pulse ?? latest.pulse,
    breathing: batch.breathing ?? latest.breathing,
    hrv: batch.hrv ?? latest.hrv,
  }
}

export function buildResult(reason, latest, durationSeconds) {
  return {
    reason,
    complete: isComplete(latest),
    duration_seconds: Math.round(durationSeconds * 10) / 10,
    pulse: latest.pulse ?? null,
    breathing: latest.breathing ?? null,
    hrv: latest.hrv ?? null,
  }
}
