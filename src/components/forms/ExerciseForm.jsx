// Diese Datei zeigt das Formular fuer Uebungen.
// Autor: Karesse Tchoffo
import { useMemo, useState } from 'react'
import { FormActions } from '../ui'
import { isExerciseFormValid } from './recordValidators'

export function ExerciseForm({ initialValue, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialValue
      ? {
          emoji: initialValue.emoji || '↕',
          name: initialValue.name || '',
          duration: initialValue.duration || '',
          level: initialValue.level || '',
          description: initialValue.description || '',
          stepsText: (initialValue.steps || []).join('\n'),
        }
      : {
          emoji: '↕',
          name: '',
          duration: '5 Min',
          level: 'Leicht',
          description: '',
          stepsText: '',
        },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isValid = useMemo(() => isExerciseFormValid(form), [form])

  return (
    <form
      className="inline-form"
      onSubmit={async (event) => {
        event.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        try {
          await onSave({
            ...form,
            // Im Textfeld schreibt man einen Schritt pro Zeile.
            // Vor dem Speichern wird daraus ein Array ohne leere Zeilen.
            steps: form.stepsText
              .split('\n')
              .map((step) => step.trim())
              .filter(Boolean),
          })
        } finally {
          setIsSubmitting(false)
        }
      }}
    >
      <div className="form-head">
        <div>
          <p className="eyebrow">Uebung</p>
          <h3>{initialValue ? 'Bearbeiten' : 'Neue Uebung'}</h3>
        </div>
      </div>

      <div className="split-form">
        <label>
          <span>Symbol</span>
          <input
            value={form.emoji}
            onChange={(event) => setForm((current) => ({ ...current, emoji: event.target.value.slice(0, 3) }))}
            placeholder="z. B. ↕"
            disabled={isSubmitting}
          />
        </label>
        <label>
          <span>Name</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="z. B. Schulter kreisen"
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className="split-form">
        <label>
          <span>Dauer</span>
          <input
            required
            value={form.duration}
            onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
            placeholder="z. B. 5 Min"
            disabled={isSubmitting}
          />
        </label>
        <label>
          <span>Stufe</span>
          <input
            required
            value={form.level}
            onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}
            placeholder="z. B. Leicht"
            disabled={isSubmitting}
          />
        </label>
      </div>

      <label>
        <span>Beschreibung</span>
        <input
          required
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Kurze Beschreibung der Uebung"
          disabled={isSubmitting}
        />
      </label>

      <label>
        <span>Schritte</span>
        <textarea
          value={form.stepsText}
          onChange={(event) => setForm((current) => ({ ...current, stepsText: event.target.value }))}
          placeholder="Ein Schritt pro Zeile"
          rows={4}
          disabled={isSubmitting}
        />
      </label>

      {/* Eine Uebung kann erst gespeichert werden, wenn die Pflichtfelder passen. */}
      {!isValid && <p className="form-helper">Bitte fuelle Name, Dauer, Stufe und Beschreibung aus.</p>}
      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isSubmitDisabled={!isValid}
        submitPendingLabel="Uebung wird gespeichert ..."
      />
    </form>
  )
}
