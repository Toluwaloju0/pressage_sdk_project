import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../config.js'
import { remindersPage as copy } from '../content.js'
import { MAX_EVENTS, buildIcs, icsEventCount } from '../reminders/ics.js'
import { describe, nextOccurrence } from '../reminders/model.js'
import { removeReminder, updateReminder, useReminders } from '../reminders/store.js'
import { canNotify } from '../reminders/useAlerts.js'

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const when = (d) =>
  d ? d.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : ''

function Notifications() {
  const [perm, setPerm] = useState(canNotify() ? Notification.permission : 'unsupported')
  const ask = async () => {
    try {
      setPerm(await Notification.requestPermission())
    } catch {
      setPerm(Notification.permission)
    }
  }
  return (
    <section className="account__block">
      <h2 className="h-item">{copy.notifyTitle}</h2>
      <p>{copy.notifyBody}</p>
      {perm === 'default' && (
        <button type="button" className="btn btn--ghost" onClick={ask}>
          {copy.notifyButton}
        </button>
      )}
      <p className="status" role="status">
        {perm === 'granted' ? copy.notifyOn : perm === 'denied' ? copy.notifyOff : perm === 'unsupported' ? copy.notifyNone : ''}
      </p>
    </section>
  )
}

export default function RemindersPage() {
  const reminders = useReminders()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    document.title = `${copy.title} | ${APP_NAME}`
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const total = icsEventCount(reminders)
  return (
    <main id="main" className="page">
      <div className="container account">
        <h1 className="h-section h-section--wide">{copy.title}</h1>
        <p className="lede lede--tight">{copy.lede}</p>

        {reminders.length === 0 ? (
          <p>
            {copy.empty}{' '}
            <Link className="step__link" to="/scan">
              {copy.emptyLink}
            </Link>
          </p>
        ) : (
          <ul className="habits__list">
            {reminders.map((r) => (
              <li className="habit" key={r.id}>
                <p className="habit__text">{r.text}</p>
                <p className="habit__set">
                  {describe(r)}
                  {r.enabled && <> · {copy.next(when(nextOccurrence(r, now)))}</>}
                </p>
                <div className="habit__action">
                  <label className="check">
                    <input type="checkbox" checked={r.enabled} onChange={(e) => updateReminder(r.id, { enabled: e.target.checked })} />
                    <span>{copy.enable}</span>
                  </label>
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => download('vitalis-reminder.ics', buildIcs([r]))}>
                    {copy.downloadOne}
                  </button>
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => removeReminder(r.id)}>
                    {copy.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {reminders.length > 0 && (
          <>
            <Notifications />
            <section className="account__block">
              <h2 className="h-item">{copy.calendarTitle}</h2>
              <p>{copy.calendarBody}</p>
              <button type="button" className="btn btn--primary" onClick={() => download('vitalis-reminders.ics', buildIcs(reminders))}>
                {copy.download}
              </button>
              {total >= MAX_EVENTS && <p className="note">{copy.limited(MAX_EVENTS)}</p>}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
