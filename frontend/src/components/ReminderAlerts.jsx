import { reminderCopy as copy } from '../content.js'
import { useAlerts } from '../reminders/useAlerts.js'

export default function ReminderAlerts() {
  const { alerts, dismiss } = useAlerts()
  if (!alerts.length) return null
  return (
    <div className="toasts">
      {alerts.map((a) => (
        <div className="toast" role="alert" key={a.id}>
          <p className="toast__text">
            <strong>{copy.toastTitle}</strong> {a.text}
          </p>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => dismiss(a.id)}>
            {copy.dismiss}
          </button>
        </div>
      ))}
    </div>
  )
}
