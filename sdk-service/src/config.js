import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// One .env at the project root serves the frontend, the backend and this service.
// Real environment variables win over the file.
export function loadRootEnv() {
  const path = fileURLToPath(new URL('../../.env', import.meta.url))
  if (existsSync(path)) process.loadEnvFile(path)
}

const num = (value, fallback, min, max) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

export function readConfig(env = process.env) {
  return {
    port: num(env.SDK_SERVICE_PORT, 8787, 1, 65535),
    host: env.SDK_SERVICE_HOST || '127.0.0.1',
    allowedOrigins: (env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    // Presage's usage telemetry is off unless you turn it on, so the privacy copy stays simple.
    telemetry: String(env.SMARTSPECTRA_TELEMETRY || '').toLowerCase() === 'true',
    // The native SDK keeps process-wide state, so scans run one at a time by default.
    maxConcurrentScans: num(env.MAX_CONCURRENT_SCANS, 1, 1, 10),
    maxSeconds: num(env.SCAN_MAX_SECONDS, 60, 10, 300),
    // How long to wait for Presage's LLM insight after a scan before giving up (milliseconds).
    // Presage advises at least 15 s of valid measurement before an on-demand insight.
    insightMinSeconds: num(env.INSIGHT_MIN_SECONDS, 15, 0, 60),
    insightTimeoutMs: num(env.INSIGHT_TIMEOUT_MS, 20000, 1000, 60000),
  }
}
