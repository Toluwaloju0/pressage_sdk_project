import { useEffect, useRef, useState } from 'react'
import { APP_NAME } from '../config.js'
import { profilePage as copy } from '../content.js'
import { Checkbox, CheckGroup, NumberField, SelectField, TagInput, TextField } from '../profile/fields.jsx'
import { emptyForm, fromProfile, toPayload, validate } from '../profile/form.js'
import * as opt from '../profile/options.js'
import { deleteProfile, loadProfile, saveProfile } from '../profile/storage.js'

function formatSaved(date) {
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function Group({ title, intro, children, wide = false }) {
  return (
    <section className="group">
      <h2 className="group__title">{title}</h2>
      {intro && <p className="group__intro">{intro}</p>}
      <div className={`group__fields${wide ? '' : ' group__fields--two'}`}>{children}</div>
    </section>
  )
}

export default function ProfilePage() {
  // The profile lives in this browser only, so it is read straight away.
  const [initial] = useState(loadProfile)
  const [form, setForm] = useState(() => fromProfile(initial.profile))
  const [errors, setErrors] = useState({})
  const [hasProfile, setHasProfile] = useState(Boolean(initial.profile))
  const [savedAt, setSavedAt] = useState(initial.updatedAt)
  const [message, setMessage] = useState(null) // { type: 'ok' | 'error', text }
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    const previous = document.title
    document.title = `${copy.title} | ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [])

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    // A "saved" notice stops being true as soon as something changes.
    setMessage((m) => (m?.type === 'ok' ? null : m))
    setErrors((e) => {
      if (!(key in e)) return e
      const { [key]: _removed, ...rest } = e
      return rest
    })
  }

  const setNoKnownAllergies = (checked) => {
    // Ticking "no known allergies" clears the list, so the two can never contradict each other.
    setForm((f) => ({ ...f, no_known_allergies: checked, allergies: checked ? [] : f.allergies }))
    setMessage((m) => (m?.type === 'ok' ? null : m))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setMessage({ type: 'error', text: copy.fixErrors })
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    const saved = saveProfile(toPayload(form))
    setForm(fromProfile(saved.profile))
    setHasProfile(true)
    setSavedAt(saved.updatedAt)
    setMessage({ type: 'ok', text: copy.saved })
  }

  const onDelete = () => {
    deleteProfile()
    setForm({ ...emptyForm })
    setHasProfile(false)
    setSavedAt(null)
    setErrors({})
    setConfirmingDelete(false)
    setMessage({ type: 'ok', text: copy.deleted })
    window.scrollTo({ top: 0 })
  }

  // ---------- The profile form ----------

  return (
    <main id="main" className="page">
      <div className="container">
        <div className="profile">
          <h1 className="h-section h-section--wide">{copy.title}</h1>
          <p className="lede lede--tight">{copy.lede}</p>
          <p className="note">{copy.privacy}</p>

          {(
            <>
              {savedAt && <p className="saved-at">{copy.lastSaved(formatSaved(savedAt))}</p>}

              <form ref={formRef} onSubmit={onSubmit} noValidate>
                <Group title="About you">
                  <NumberField label="Age" hint="Used to check your readings against your age." unit="years" min={0} max={120} value={form.age} onChange={set('age')} error={errors.age} />
                  <SelectField
                    label="Gender"
                    hint="Female or male. You can leave it blank."
                    value={form.gender}
                    onChange={set('gender')}
                    options={opt.GENDER}
                  />
                </Group>

                <Group title="Where you are from and where you live">
                  <TextField
                    label="Where are you from?"
                    hint="Your home town, region or country."
                    value={form.origin}
                    onChange={set('origin')}
                    maxLength={120}
                  />
                  <TextField
                    label="Where do you live now?"
                    hint="City and country."
                    value={form.location}
                    onChange={set('location')}
                    maxLength={120}
                  />
                  <SelectField label="What kind of area is it?" value={form.location_type} onChange={set('location_type')} options={opt.LOCATION_TYPE} />
                  <SelectField label="What kind of home do you live in?" value={form.housing_type} onChange={set('housing_type')} options={opt.HOUSING_TYPE} />
                  <NumberField
                    label="How many people live in your home?"
                    hint="Count yourself."
                    unit="people"
                    min={1}
                    max={30}
                    value={form.household_size}
                    onChange={set('household_size')}
                    error={errors.household_size}
                  />
                  <SelectField label="What is the weather usually like?" value={form.climate} onChange={set('climate')} options={opt.CLIMATE} />
                  <SelectField label="How is the air where you live?" value={form.air_quality} onChange={set('air_quality')} options={opt.AIR_QUALITY} />
                  <SelectField label="Can you easily get safe drinking water?" value={form.safe_water} onChange={set('safe_water')} options={opt.SAFE_WATER} />
                </Group>

                <Group title="Your daily life">
                  <div className="span-2">
                    <CheckGroup
                      legend="Who do you spend most of your time with?"
                      hint="Choose all that apply."
                      options={opt.ASSOCIATES}
                      value={form.associates}
                      onChange={set('associates')}
                    />
                  </div>
                  <div className="span-2">
                    <TextField
                      label="Anything to add about the people around you?"
                      value={form.associates_note}
                      onChange={set('associates_note')}
                      maxLength={300}
                    />
                  </div>
                  <SelectField label="How much support do you have when things get hard?" value={form.social_support} onChange={set('social_support')} options={opt.SOCIAL_SUPPORT} />
                  <SelectField label="How quickly do you get used to change?" value={form.adaptability} onChange={set('adaptability')} options={opt.ADAPTABILITY} />
                  <div className="span-2">
                    <TagInput
                      label="Hobbies"
                      hint="Things you enjoy in your free time."
                      placeholder="For example football, cooking, reading"
                      value={form.hobbies}
                      onChange={set('hobbies')}
                    />
                  </div>
                  <SelectField label="What is your work like?" value={form.work_type} onChange={set('work_type')} options={opt.WORK_TYPE} />
                  <NumberField
                    label="Screen time on a typical day"
                    unit="hours"
                    min={0}
                    max={24}
                    step={0.5}
                    value={form.screen_hours}
                    onChange={set('screen_hours')}
                    error={errors.screen_hours}
                  />
                  <SelectField label="How stressed have you felt lately?" value={form.stress_level} onChange={set('stress_level')} options={opt.STRESS} />
                </Group>

                <Group title="Food and habits">
                  <div className="span-2">
                    <CheckGroup
                      legend="What best describes the food you eat?"
                      hint="Choose all that apply."
                      options={opt.DIET}
                      value={form.diet}
                      onChange={set('diet')}
                    />
                  </div>
                  <div className="span-2">
                    <TextField
                      label="What do you usually eat?"
                      hint="A few staples or favourite meals."
                      value={form.food_notes}
                      onChange={set('food_notes')}
                      maxLength={300}
                    />
                  </div>
                  <NumberField
                    label="Sleep on a typical night"
                    unit="hours"
                    min={0}
                    max={24}
                    step={0.5}
                    value={form.sleep_hours}
                    onChange={set('sleep_hours')}
                    error={errors.sleep_hours}
                  />
                  <SelectField label="Do you use tobacco?" value={form.tobacco_use} onChange={set('tobacco_use')} options={opt.TOBACCO} />
                  <SelectField label="How often do you drink alcohol?" value={form.alcohol_use} onChange={set('alcohol_use')} options={opt.ALCOHOL} />
                </Group>

                <Group title="Health background" intro={copy.healthNote} wide>
                  <div>
                    <Checkbox label="I have no known allergies" checked={form.no_known_allergies} onChange={setNoKnownAllergies} />
                  </div>
                  <TagInput
                    label="Allergies"
                    hint="Foods, medicines, pollen, anything that affects you."
                    placeholder="For example peanuts"
                    value={form.allergies}
                    onChange={set('allergies')}
                    disabled={form.no_known_allergies}
                  />
                  <TagInput
                    label="Health conditions and recent discomfort"
                    required
                    hint={copy.conditionsHint}
                    note={copy.conditionsNote}
                    error={errors.health_conditions}
                    value={form.health_conditions}
                    onChange={set('health_conditions')}
                    placeholder="For example high blood pressure, headache"
                  />
                  <TagInput
                    label="Family health history"
                    hint="Conditions that run in your family."
                    value={form.family_history}
                    onChange={set('family_history')}
                  />
                </Group>

                <div className="actions">
                  <button type="submit" className="btn btn--primary" >
                    {copy.save}
                  </button>
                  <p className="status status--ok" role="status">
                    {message?.type === 'ok' ? message.text : ''}
                  </p>
                  <p className="status status--error" role="alert">
                    {message?.type === 'error' ? message.text : ''}
                  </p>
                </div>
              </form>

              {hasProfile && (
                <section className="danger" aria-labelledby="delete-title">
                  <h2 className="h-item" id="delete-title">
                    {copy.deleteTitle}
                  </h2>
                  <p>{copy.deleteBody}</p>
                  {!confirmingDelete ? (
                    <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmingDelete(true)}>
                      {copy.deleteStart}
                    </button>
                  ) : (
                    <div className="danger__confirm">
                      <p>
                        <strong>{copy.deleteSure}</strong>
                      </p>
                      <div className="danger__buttons">
                        <button type="button" className="btn btn--danger btn--small" onClick={onDelete} >
                          {copy.deleteConfirm}
                        </button>
                        <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirmingDelete(false)}>
                          {copy.deleteCancel}
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
