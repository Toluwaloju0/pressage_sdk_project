import { useEffect, useState } from 'react'
import { dueSlot, markFired } from './model.js'
import { listReminders, readFired, writeFired } from './store.js'

export const canNotify = () => typeof Notification !== 'undefined'

// Checks every ~20 seconds (and when the tab becomes visible again) whether a reminder is due.
// Works only while a Vitalis tab is open. The calendar file is what rings when it is closed.
export function useAlerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const check = () => {
      const now = new Date()
      let fired = readFired()
      const fresh = []
      for (const r of listReminders()) {
        const slot = dueSlot(r, now, fired)
        if (slot === null) continue
        fired = markFired(fired, r, now, slot)
        fresh.push({ id: `${r.id}-${slot}-${now.getTime()}`, text: r.text })
      }
      if (!fresh.length) return
      writeFired(fired)
      setAlerts((cur) => [...cur, ...fresh].slice(-5))
      if (canNotify() && Notification.permission === 'granted') {
        for (const a of fresh) {
          try {
            new Notification('Vitalis reminder', { body: a.text, tag: a.id })
          } catch {
            /* some browsers only allow this from a service worker */
          }
        }
      }
    }
    check()
    const timer = setInterval(check, 20000)
    const onVisible = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [])

  const dismiss = (id) => setAlerts((cur) => cur.filter((a) => a.id !== id))
  return { alerts, dismiss }
}
