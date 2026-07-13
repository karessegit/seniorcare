// Hier ist das Formular fuer Termine.
// Autor: Karesse Tchoffo
import { useMemo, useState } from 'react'
import { FormActions } from '../ui'
import { isAppointmentFormValid } from './recordValidators'

export function AppointmentForm({ initialValue, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialValue || {
      doctor: '',
      date: '2026-06-15',
      time: '11:00',
      address: '',
    },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isValid = useMemo(() => isAppointmentFormValid(form), [form])

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
          <p className="eyebrow">Termin</p>
          <h3>{initialValue ? 'Bearbeiten' : 'Neuer Termin'}</h3>
        </div>
      </div>

      <label>
        <span>Arztpraxis / Ort</span>
        <input
          required
          value={form.doctor}
          onChange={(event) => setForm((current) => ({ ...current, doctor: event.target.value }))}
          placeholder="z. B. Dr. Schmidt"
          disabled={isSubmitting}
        />
      </label>
      <div className="split-form">
        <label>
          <span>Datum</span>
          <input
            type="date"
            required
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            disabled={isSubmitting}
          />
        </label>
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
      </div>
      <label>
        <span>Adresse</span>
        <input
          required
          value={form.address}
          onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
          placeholder="z. B. Berliner Str. 8, Darmstadt"
          disabled={isSubmitting}
        />
      </label>
      {/* Pflichtfelder bleiben sichtbar und verhindern falsches Absenden. */}
      {!isValid && <p className="form-helper">Bitte fuelle Arztpraxis, Datum, Uhrzeit und Adresse aus.</p>}
      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isSubmitDisabled={!isValid}
        submitPendingLabel="Termin wird gespeichert ..."
      />
    </form>
  )
}
