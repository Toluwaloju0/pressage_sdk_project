import test from 'node:test'
import assert from 'node:assert/strict'

// A tiny stand-in for localStorage.
const data = new Map()
globalThis.localStorage = {
  getItem: (k) => (data.has(k) ? data.get(k) : null),
  setItem: (k, v) => void data.set(k, String(v)),
  removeItem: (k) => void data.delete(k),
  key: (i) => [...data.keys()][i] ?? null,
  get length() { return data.size },
}
const { getApiKey, saveApiKey, clearApiKey, isValidKey, keyHint } = await import('../src/account/apiKey.js')
const { loadProfile, saveProfile, deleteProfile } = await import('../src/profile/storage.js')
const store = await import('../src/lib/store.js')

test('api key validation and storage', () => {
  assert.equal(isValidKey('short'), false)
  assert.equal(isValidKey('has space inside 12345'), false)
  assert.match(saveApiKey('abc'), /Presage API key/)
  assert.equal(saveApiKey('  abcd1234efgh5678  '), '')
  assert.equal(getApiKey(), 'abcd1234efgh5678')
  assert.equal(keyHint(getApiKey()), 'ending in 5678')
  clearApiKey()
  assert.equal(getApiKey(), '')
})

test('profile round trip', () => {
  assert.equal(loadProfile().profile, null)
  saveProfile({ age: 30 }, new Date('2026-11-21T10:00:00Z'))
  const { profile, updatedAt } = loadProfile()
  assert.deepEqual(profile, { age: 30 })
  assert.equal(updatedAt.toISOString(), '2026-11-21T10:00:00.000Z')
  deleteProfile()
  assert.equal(loadProfile().profile, null)
})

test('corrupt data is ignored, clearAll only removes Vitalis keys', () => {
  data.set('vitalis.profile.v1', '{not json')
  assert.equal(loadProfile().profile, null)
  data.set('other.site', 'keep')
  saveApiKey('abcd1234efgh5678')
  store.clearAll()
  assert.equal(data.get('other.site'), 'keep')
  assert.equal(getApiKey(), '')
})

test('falls back to memory when storage throws', () => {
  const real = globalThis.localStorage
  globalThis.localStorage = {
    getItem() { throw new Error('blocked') },
    setItem() { throw new Error('blocked') },
    removeItem() { throw new Error('blocked') },
    get length() { throw new Error('blocked') },
  }
  assert.equal(saveApiKey('abcd1234efgh5678'), '')
  assert.equal(getApiKey(), 'abcd1234efgh5678')
  clearApiKey()
  assert.equal(getApiKey(), '')
  globalThis.localStorage = real
})
