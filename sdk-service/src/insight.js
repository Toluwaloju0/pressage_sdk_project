import protobuf from 'protobufjs'

// Presage's LLM insights (https://smartspectra.presagetech.com/docs/nodejs/llm-insights/).
//
// The Node SDK gives us the raw bytes of an Insight message and ships no decoder, so the
// message is described here from Presage's published schema (Data Types -> Insight):
//   request_id (1), processed_at (2), analysis (3) or error (4) in a "result" oneof, type (5).
const root = protobuf.parse(`
  syntax = "proto3";
  enum InsightType {
    INSIGHT_TYPE_VITALS = 0;
    INSIGHT_TYPE_SPEECH = 1;
    INSIGHT_TYPE_COMBINED = 2;
  }
  message Insight {
    int32 request_id = 1;
    string processed_at = 2;
    oneof result {
      string analysis = 3;
      string error = 4;
    }
    InsightType type = 5;
  }
`).root
const Insight = root.lookupType('Insight')

// Bytes from the SDK's 'insight' event -> { requestId, processedAt, analysis, error }.
// Throws if the bytes are not an Insight message.
export function decodeInsight(buf) {
  const m = Insight.decode(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
  return { requestId: m.requestId, processedAt: m.processedAt, analysis: m.analysis, error: m.error }
}

// Encodes an Insight. Used by the tests to stand in for the SDK.
export function encodeInsight({ requestId = 0, processedAt = '', analysis, error }) {
  const payload = { requestId, processedAt }
  if (analysis !== undefined) payload.analysis = analysis
  else if (error !== undefined) payload.error = error
  return Buffer.from(Insight.encode(Insight.create(payload)).finish())
}

// What we ask the LLM. It carries no profile answers and nothing that identifies anyone:
// Presage adds the measured pulse, breathing and HRV series itself.
export const INSIGHT_PROMPT =
  'These are my pulse, breathing rate and heart rate variability from a short camera scan. ' +
  'In plain, simple language, explain what the readings mean for general wellness, say whether ' +
  'anything looks unusual compared with typical resting ranges, and suggest a few simple everyday ' +
  'habits that may help. Do not diagnose any condition and do not recommend medicines or treatment. ' +
  'Say that this is general wellness information, not medical advice. Keep it under 150 words.'

// Keeps track of insight requests and the replies that come back from the SDK.
//   tracker.ask(requestFn, timeoutMs) -> Promise<{ analysis } | { error } | { timedOut }>
//   tracker.receive(decoded)   called for every 'insight' event
// Insights that arrive by themselves (Presage sends one about every 60 seconds) are kept as
// `latestAutomatic`, in case the on-demand request gets no answer.
export function createInsightTracker() {
  const waiting = new Map()
  let latestAutomatic = null
  // Replies that arrive while a request is still being made (before its id is known).
  let early = null

  return {
    get latestAutomatic() {
      return latestAutomatic
    },
    receive(decoded) {
      if (early) {
        early.push(decoded)
        return
      }
      const entry = waiting.get(decoded.requestId)
      const outcome = decoded.error ? { error: decoded.error } : { analysis: decoded.analysis }
      if (entry) {
        waiting.delete(decoded.requestId)
        clearTimeout(entry.timer)
        entry.resolve(outcome)
      } else if (outcome.analysis) {
        latestAutomatic = outcome
      }
    },
    ask(requestFn, timeoutMs) {
      return new Promise((resolve) => {
        let id
        early = []
        try {
          id = requestFn()
        } catch (err) {
          early = null
          resolve({ error: `The insight could not be requested (${err?.message ?? 'unknown error'}).` })
          return
        }
        const arrived = early
        early = null
        const timer = setTimeout(() => {
          waiting.delete(id)
          resolve({ timedOut: true })
        }, timeoutMs)
        waiting.set(id, { resolve, timer })
        for (const d of arrived) this.receive(d)
      })
    },
  }
}
