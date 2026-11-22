import { useId, useState } from 'react'

// Small, accessible form controls. Each one wires its own label, hint and error message.

function describedBy(...ids) {
  const list = ids.filter(Boolean).join(' ')
  return list || undefined
}

export function TextField({ label, hint, value, onChange, error, maxLength, ...rest }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : null
  const errorId = error ? `${id}-error` : null
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      <input
        id={id}
        className="input"
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(hintId, errorId)}
        {...rest}
      />
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export function NumberField({ label, hint, value, onChange, error, min, max, step = 1, unit }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : null
  const errorId = error ? `${id}-error` : null
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      <div className="field__unit">
        <input
          id={id}
          className="input input--short"
          type="number"
          inputMode={step < 1 ? 'decimal' : 'numeric'}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(hintId, errorId)}
        />
        {unit && <span className="field__unit-label">{unit}</span>}
      </div>
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectField({ label, hint, value, onChange, options, placeholder = 'Choose one' }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : null
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      <select
        id={id}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedBy(hintId)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CheckGroup({ legend, hint, options, value, onChange }) {
  const toggle = (optionValue, checked) =>
    onChange(checked ? [...value, optionValue] : value.filter((v) => v !== optionValue))
  return (
    <fieldset className="checks">
      <legend>{legend}</legend>
      {hint && <p className="field__hint">{hint}</p>}
      <div className="checks__grid">
        {options.map((o) => (
          <label className="check" key={o.value}>
            <input
              type="checkbox"
              checked={value.includes(o.value)}
              onChange={(e) => toggle(o.value, e.target.checked)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

// A list of short free-text items (hobbies, allergies...). Press Enter or comma, or choose Add.
export function TagInput({ label, hint, note, error, required = false, value, onChange, placeholder, max = 20, disabled = false }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : null
  const noteId = note ? `${id}-note` : null
  const [draft, setDraft] = useState('')
  const full = value.length >= max
  const errorId = error ? `${id}-error` : null

  const add = () => {
    const text = draft.trim().slice(0, 60)
    if (!text) return
    const exists = value.some((v) => v.toLowerCase() === text.toLowerCase())
    if (exists) {
      setDraft('')
      return
    }
    if (full) return
    onChange([...value, text])
    setDraft('')
  }

  const onKeyDown = (e) => {
    // Enter must not submit the whole profile form.
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="field__required"> (required)</span>}
      </label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {note && (
        <p className="field__note" id={noteId}>
          {note}
        </p>
      )}
      <div className="tagrow">
        <input
          id={id}
          className="input"
          type="text"
          value={draft}
          maxLength={60}
          placeholder={placeholder}
          disabled={disabled || full}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(hintId, noteId, errorId)}
        />
        <button type="button" className="btn btn--ghost btn--small" onClick={add} disabled={disabled || full || !draft.trim()}>
          Add
        </button>
      </div>
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
      {full && <p className="field__hint">You have added the most you can ({max}).</p>}
      {value.length > 0 && (
        <ul className="chips" aria-label={`${label}: added`}>
          {value.map((item) => (
            <li className="chip-tag" key={item}>
              <span>{item}</span>
              <button
                type="button"
                className="chip-tag__remove"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(value.filter((v) => v !== item))}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
