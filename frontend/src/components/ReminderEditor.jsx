import { useId, useState } from 'react'
import { reminderCopy as copy } from '../content.js'
import {
  DEFAULTS,
  INTERVAL_CHOICES,
  classifyHabit,
  describe,
  everyLabel,
} from '../reminders/model.js'
import { addReminder, removeReminder, updateReminder, useReminders } from '../reminders/store.js'

// One habit, with a way to be reminded about it. A habit that is usually done through the day
// (water, movement) starts on "repeat"; one done once a day (sleep) starts on "each day".
export default function ReminderEditor({ habit }) {
  const reminders = useReminders()
  const existing = reminders.find((r) => r.habitKey === habit.key)
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState(() => classifyHabit(habit.text))
  const [time, setTime] = useState(DEFAULTS.time)
  const [every, setEvery] = useState(DEFAULTS.every)
  const [from, setFrom] = useState(DEFAULTS.from)
  const [to, setTo] = useState(DEFAULTS.to)
  const [error, setError] = useState('')
  const id = useId()

  const begin = () => {
    if (existing) {
      setKind(existing.kind)
      setTime(existing.time)
      setEvery(existing.every)
      setFrom(existing.from)
      setTo(existing.to)
    }
    setError('')
    setOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    const fields = { habitKey: habit.key, text: habit.text, kind, time, every: Number(every), from, to }
    const message = existing ? updateReminder(existing.id, fields) : addReminder(fields)
    if (message) setError(message)
    else setOpen(false)
  }

  if (!open) {
    return (
      <div className="habit__action">
        {existing && (
          <p className="habit__set" role="status">
            {copy.set}: {describe(existing)}
            {!existing.enabled && ` (${copy.paused})`}
          </p>
        )}
        <button type="button" className="btn btn--ghost btn--small" onClick={begin}>
          {existing ? copy.change : copy.add}
        </button>
        {existing && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => removeReminder(existing.id)}>
            {copy.remove}
          </button>
        )}
      </div>
    )
  }

  return (
    <form className="remind" onSubmit={save} noValidate>
      <fieldset className="remind__kind">
        <legend>{copy.how}</legend>
        <label className="check">
          <input type="radio" name={`${id}-kind`} checked={kind === 'daily'} onChange={() => setKind('daily')} />
          <span>{copy.daily}</span>
        </label>
        <label className="check">
          <input type="radio" name={`${id}-kind`} checked={kind === 'interval'} onChange={() => setKind('interval')} />
          <span>{copy.interval}</span>
        </label>
      </fieldset>

      {kind === 'daily' ? (
        <div className="field">
          <label htmlFor={`${id}-time`}>{copy.time}</label>
          <input id={`${id}-time`} type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      ) : (
        <div className="remind__row">
          <div className="field">
            <label htmlFor={`${id}-every`}>{copy.every}</label>
            <select id={`${id}-every`} value={every} onChange={(e) => setEvery(Number(e.target.value))}>
              {INTERVAL_CHOICES.map((m) => (
                <option key={m} value={m}>
                  {everyLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${id}-from`}>{copy.from}</label>
            <input id={`${id}-from`} type="time" value={from} onChange={(e) => setFrom(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor={`${id}-to`}>{copy.to}</label>
            <input id={`${id}-to`} type="time" value={to} onChange={(e) => setTo(e.target.value)} required />
          </div>
        </div>
      )}

      <p className="status status--error" role="alert">
        {error}
      </p>
      <div className="habit__action">
        <button type="submit" className="btn btn--primary btn--small">
          {copy.save}
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setOpen(false)}>
          {copy.cancel}
        </button>
      </div>
    </form>
  )
}
