// Turns the profile from the server into form state, and form state back into what the
// server accepts. In the form, text, choices and numbers are all strings ('' means blank).

import { profilePage } from '../content.js'

const TEXT = ['origin', 'location', 'associates_note', 'food_notes']
const CHOICE = [
  'gender',
  'location_type',
  'housing_type',
  'climate',
  'air_quality',
  'safe_water',
  'social_support',
  'work_type',
  'adaptability',
  'stress_level',
  'tobacco_use',
  'alcohol_use',
]
const NUMBER = ['age', 'household_size', 'sleep_hours', 'screen_hours']
// adaptability and stress_level are picked from a list in the form but are numbers on the server.
const CHOICE_NUMBERS = ['adaptability', 'stress_level']
const LIST = ['associates', 'hobbies', 'diet', 'allergies', 'health_conditions', 'family_history']

export const emptyForm = Object.freeze({
  ...Object.fromEntries([...TEXT, ...CHOICE, ...NUMBER].map((k) => [k, ''])),
  ...Object.fromEntries(LIST.map((k) => [k, []])),
  no_known_allergies: false,
})

export function fromProfile(profile) {
  if (!profile) return { ...emptyForm }
  const form = { ...emptyForm }
  for (const k of [...TEXT, ...CHOICE, ...NUMBER]) {
    form[k] = profile[k] === null || profile[k] === undefined ? '' : String(profile[k])
  }
  for (const k of LIST) form[k] = [...(profile[k] ?? [])]
  form.no_known_allergies = Boolean(profile.no_known_allergies)
  return form
}

export function toPayload(form) {
  const out = {}
  for (const k of [...TEXT, ...CHOICE]) {
    const value = form[k].trim()
    out[k] = value === '' ? null : CHOICE_NUMBERS.includes(k) ? Number(value) : value
  }
  for (const k of NUMBER) out[k] = form[k] === '' ? null : Number(form[k])
  for (const k of LIST) out[k] = [...form[k]]
  out.no_known_allergies = Boolean(form.no_known_allergies)
  return out
}

// Same limits as the server, so most mistakes are caught before sending.
const RULES = {
  age: { min: 0, max: 120, integer: true },
  household_size: { min: 1, max: 30, integer: true },
  sleep_hours: { min: 0, max: 24, integer: false },
  screen_hours: { min: 0, max: 24, integer: false },
}

const REQUIRED_CONDITIONS_MESSAGE = profilePage.conditionsRequired

export function validate(form) {
  const errors = {}
  // The health check needs at least one entry here (see content.js, profilePage.conditionsRequired).
  if (form.health_conditions.length === 0) errors.health_conditions = REQUIRED_CONDITIONS_MESSAGE
  for (const [key, rule] of Object.entries(RULES)) {
    if (form[key] === '') continue
    const n = Number(form[key])
    const bad = !Number.isFinite(n) || n < rule.min || n > rule.max || (rule.integer && !Number.isInteger(n))
    if (bad) {
      errors[key] = rule.integer
        ? `Enter a whole number from ${rule.min} to ${rule.max}.`
        : `Enter a number from ${rule.min} to ${rule.max}.`
    }
  }
  return errors
}
