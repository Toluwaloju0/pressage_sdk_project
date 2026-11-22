import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearApiKey, getApiKey, keyHint, saveApiKey } from '../account/apiKey.js'
import { APP_NAME } from '../config.js'
import { accountPage as copy } from '../content.js'
import { clearAll, subscribe } from '../lib/store.js'

export const PRESAGE_REGISTER = 'https://physiology.presagetech.com/auth/register'
export const PRESAGE_LOGIN = 'https://physiology.presagetech.com/auth/login'

export default function AccountPage() {
  const [stored, setStored] = useState(getApiKey)
  const [value, setValue] = useState('')
  const [shown, setShown] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState(false)
  const id = useId()

  useEffect(() => {
    document.title = `${copy.title} | ${APP_NAME}`
  }, [])
  useEffect(() => subscribe(() => setStored(getApiKey())), [])

  const onSave = (e) => {
    e.preventDefault()
    const problem = saveApiKey(value)
    setError(problem)
    if (problem) {
      setMessage('')
      return
    }
    setValue('')
    setShown(false)
    setMessage(copy.saved)
  }

  const onRemove = () => {
    clearApiKey()
    setMessage(copy.removed)
  }

  const onClear = () => {
    clearAll()
    setConfirming(false)
    setValue('')
    setMessage(copy.cleared)
  }

  return (
    <main id="main" className="page">
      <div className="container account">
        <h1 className="h-section h-section--wide">{copy.title}</h1>
        <p className="lede lede--tight">{copy.lede}</p>

        <section aria-labelledby={`${id}-get`} className="account__block">
          <h2 className="h-item" id={`${id}-get`}>
            {copy.stepsTitle}
          </h2>
          <ol className="account__steps">
            {copy.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="hero__actions">
            <a className="btn btn--ghost" href={PRESAGE_REGISTER} target="_blank" rel="noopener noreferrer">
              {copy.register}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="btn btn--ghost" href={PRESAGE_LOGIN} target="_blank" rel="noopener noreferrer">
              {copy.login}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>

        <section aria-labelledby={`${id}-key`} className="account__block">
          <h2 className="h-item" id={`${id}-key`}>
            {copy.keyLabel}
          </h2>
          <p className="status" role="status">
            {stored ? copy.statusSet(keyHint(stored)) : copy.statusNone}
          </p>
          <form onSubmit={onSave} noValidate>
            <div className="field">
              <label htmlFor={`${id}-input`}>{stored ? copy.replace : copy.keyLabel}</label>
              <input
                id={`${id}-input`}
                type={shown ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={`${id}-help${error ? ` ${id}-err` : ''}`}
              />
              <p className="field__hint" id={`${id}-help`}>
                {copy.keyHelp}
              </p>
              {error && (
                <p className="field__error" id={`${id}-err`} role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="hero__actions">
              <button type="submit" className="btn btn--primary" disabled={!value.trim()}>
                {copy.save}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShown((s) => !s)} aria-pressed={shown}>
                {shown ? copy.hide : copy.show}
              </button>
              {stored && (
                <button type="button" className="btn btn--ghost" onClick={onRemove}>
                  {copy.remove}
                </button>
              )}
            </div>
          </form>
          <p className="status" role="status">
            {message}
          </p>
          {stored && (
            <Link className="step__link" to="/scan">
              {copy.next}
            </Link>
          )}
        </section>

        <section aria-labelledby={`${id}-safe`} className="account__block">
          <h2 className="h-item" id={`${id}-safe`}>
            {copy.safetyTitle}
          </h2>
          <ul className="account__list">
            {copy.safety.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${id}-data`} className="account__block">
          <h2 className="h-item" id={`${id}-data`}>
            {copy.dataTitle}
          </h2>
          <p>{copy.dataBody}</p>
          {confirming ? (
            <div role="alertdialog" aria-label={copy.clear} className="confirm">
              <p>{copy.clearSure}</p>
              <div className="hero__actions">
                <button type="button" className="btn btn--danger" onClick={onClear}>
                  {copy.clearConfirm}
                </button>
                <button type="button" className="btn btn--ghost" autoFocus onClick={() => setConfirming(false)}>
                  {copy.clearCancel}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn--ghost" onClick={() => setConfirming(true)}>
              {copy.clear}
            </button>
          )}
        </section>
      </div>
    </main>
  )
}
