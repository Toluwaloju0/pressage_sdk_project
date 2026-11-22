import { decodeInsight } from './insight.js'
import { summarize } from './metrics.js'

// The only file that touches the Presage SDK. The server talks to this small interface,
// which is also what the tests replace with a stand-in.
//
// createSession(handlers, { apiKey }) -> { start(), sendFrame(rgb, width, height, timestampUs), stop() }
// handlers: onStatus(name), onValidation(code, hint), onMetrics(summary), onError(code, message, retryable),
//           onInsight(decoded)   Presage's LLM insight: { requestId, analysis, error }
// session.requestInsight(text) -> request id; the answer arrives through onInsight

const STATUS_NAMES = ['uninitialized', 'idle', 'starting', 'running', 'stopping', 'error']

export function createSdkSessionFactory({ telemetry }) {
  let sdkModule
  // The key belongs to the person scanning. It is used for this session only.
  return async function createSession(handlers, { apiKey }) {
    // Loaded on first use: the package is large and loads a native runtime.
    sdkModule ??= {
      ...(await import('@smartspectra/node-sdk')),
      ...(await import('@smartspectra/node-sdk/messages')),
    }
    const { SmartSpectraSDK, FrameTransform, PixelFormat, breathingMetrics, cardioMetrics, decodeMetrics } = sdkModule

    const sdk = new SmartSpectraSDK({
      apiKey,
      requestedMetrics: [...breathingMetrics, ...cardioMetrics],
      enableTelemetry: telemetry,
    })
    sdk.on('processingStatus', (s) => handlers.onStatus(STATUS_NAMES[s] ?? String(s)))
    sdk.on('validationStatus', (code, _ts, hint) => handlers.onValidation(code, hint))
    sdk.on('metrics', (buf) => handlers.onMetrics(summarize(decodeMetrics(buf))))
    sdk.on('insight', (buf) => {
      try {
        handlers.onInsight?.(decodeInsight(buf))
      } catch {
        // Bytes we cannot read are ignored. The caller times out and carries on.
      }
    })
    sdk.on('error', (code, message, retryable) => handlers.onError(code, message, retryable))
    sdk.useCustomInput(FrameTransform.kNone)

    let stopped = false
    return {
      start: () => sdk.start(),
      requestInsight: (text) => sdk.requestInsight(text),
      sendFrame: (rgb, width, height, timestampUs) =>
        sdk.sendFrame(rgb, width, height, width * 3, PixelFormat.kRGB, timestampUs),
      async stop() {
        if (stopped) return
        stopped = true
        try {
          await sdk.stopAsync()
        } finally {
          await sdk.destroy()
        }
      },
    }
  }
}
