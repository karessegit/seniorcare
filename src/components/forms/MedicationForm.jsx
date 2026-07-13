// Hier ist das Formular fuer Medikamente.
// Autor: Karesse Tchoffo
import { useMemo, useState } from 'react'
import { isMedicationFormValid } from './recordValidators'

export function MedicationForm({ initialValue, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialValue || {
      name: '',
      amount: 1,
      unit: 'Tablette',
      time: '20:00',
      notes: '',
    },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isValid = useMemo(() => isMedicationFormValid(form), [form])

  return (
    <form
      className="inline-form"
      onSubmit={async (event) => {
        event.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        try {
          await onSave(form)
        } finally {
          setIsSubmitting(false)
        }
      }}
    >
      <div className="form-head">
        <div>
          <h3>{initialValue ? 'Medikament bearbeiten' : 'Name des Medikaments:'}</h3>
        </div>
        <button type="button" className="form-close" onClick={onCancel} disabled={isSubmitting} aria-label="Formular schließen">
          x
        </button>
      </div>

      <label>
        <span>{initialValue ? 'Name des Medikaments:' : ''}</span>
        <input
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Aspirine"
          disabled={isSubmitting}
        />
      </label>
      <div className="split-form">
        <label>
          <span>Menge</span>
          <input
            type="number"
            min="1"
            required
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            disabled={isSubmitting}
          />
        </label>
        <label>
          <span>&nbsp;</span>
          <input
            required
            value={form.unit}
            onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
            placeholder="Tablette"
            disabled={isSubmitting}
          />
        </label>
      </div>
      <div className="split-form">
        <label>
          <span>Uhrzeit</span>
          <input
            type="time"
            required
            value={form.time}
            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            disabled={isSubmitting}
          />
        </label>
        <label>
          <span>Notizen</span>
          <input
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            placeholder="mit einem Glas Wasser"
            disabled={isSubmitting}
          />
        </label>
      </div>
      {/* Speichern ist erst moeglich, wenn die wichtigen Felder ausgefuellt sind. */}
      {!isValid && <p className="form-helper">Bitte fuelle Name, Menge, Einheit und Uhrzeit aus.</p>}
      <button type="submit" className="button primary form-submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'wird gespeichert ...' : initialValue ? 'speichern' : 'hinzufügen'}
      </button>
    </form>
  )
}
