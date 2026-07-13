// Diese Datei enthaelt den Bestaetigungsdialog.
// Autor: Wilfred Feyem
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Bestaetigen',
  cancelLabel = 'Abbrechen',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog-copy">
          <p className="eyebrow">Bestaetigung</p>
          <h3 id="confirm-dialog-title">{title}</h3>
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button type="button" className="button ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="button red" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
