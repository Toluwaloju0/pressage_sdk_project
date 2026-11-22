// The wire format between the browser and this service (WebSocket).
//
// Browser -> service
//   text   {"type":"start","width":400,"height":300,"apiKey":"..."}   once, first.
//          The key is the person's own Presage API key. It is used for this scan only.
//   binary [8-byte little-endian float64: capture time in microseconds][width*height*3 RGB bytes]
//   text   {"type":"stop"}
//
// Service -> browser (all text JSON)
//   {"type":"ready","maxSeconds":60}
//   {"type":"status","status":"running"}
//   {"type":"validation","code":3,"hint":"..."}
//   {"type":"metrics","pulse":{...}|null,"breathing":{...}|null,"hrv":{...}|null}
//   {"type":"error","code":"...","message":"...","retryable":true}
//   {"type":"ended","reason":"stopped"|"complete"|"time_limit"|"error"}
//   {"type":"insight","status":"pending"}   the explanation is being fetched (the socket stays open)
//   {"type":"insight","status":"ok","text":"..."}
//   {"type":"insight","status":"unavailable"|"skipped","message":"..."}
//   after the last insight message the service closes the socket

export const WS_PATH = '/scan-ws'
export const FRAME_HEADER_BYTES = 8
export const MIN_SIDE = 160
export const MAX_SIDE = 1280
// More than this many frames per second is dropped, so a misbehaving client cannot flood the SDK.
export const MAX_FPS = 40

// A Presage API key is a short run of visible characters. Anything else is refused before it
// reaches the SDK. The key is never logged.
export const KEY_PATTERN = /^[\x21-\x7e]{8,256}$/
// Longest explanation passed on to the browser.
export const MAX_INSIGHT_CHARS = 4000
