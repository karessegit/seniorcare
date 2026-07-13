// Diese Datei enthaelt Buttons fuer Formular-Aktionen.
// Autor: Wilfred Feyem
export function FormActions({
  onCancel,
  cancelLabel = 'Abbrechen',
  submitLabel = 'Speichern',
  submitPendingLabel = 'Wird gespeichert ...',
  isSubmitting = false,
  isSubmitDisabled = false,
}) {
  return (
    <div className="form-actions">
      <button type="button" className="button ghost" onClick={onCancel} disabled={isSubmitting}>
        {cancelLabel}
      </button>
      <button type="submit" className="button primary" disabled={isSubmitDisabled || isSubmitting}>
        {isSubmitting ? submitPendingLabel : submitLabel}
      </button>
    </div>
  )
}
