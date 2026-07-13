// Hier ist die Medikamentenliste fuer Senioren.
// Autor: Wilfred Feyem
import { toGermanErrorMessage } from '../../../lib/userMessages'

export function MedicationList({
  meds,
  feedbackActive,
  actions,
  deleteGuard,
  setError,
  onEdit,
}) {
  return (
    <div className={`stack-list ${feedbackActive ? 'is-updated' : ''}`}>
      {meds.map((med) => (
        <article key={med.id} className={`list-card medication-card ${med.taken ? 'is-done' : ''}`}>
          <div className="list-row">
            <span className="record-icon pill-icon" aria-hidden="true">💊</span>
            <div className="record-main">
              <p className="item-title">{med.name}</p>
              <p className="item-note">{med.notes}</p>
            </div>
            <div className="record-side">
              <div className="time-badge"><span aria-hidden="true">◷</span>{med.time}</div>
            </div>
          </div>
          <div className="card-actions">
            <button
              type="button"
              className="button ghost edit-action"
              onClick={() => {
                onEdit(med.id)
                deleteGuard.resetDeleteGuard()
              }}
            >
              <span aria-hidden="true">✎</span>
              Bearbeiten
            </button>
            <button type="button" className="button ghost success-action" onClick={() => actions.toggleMedicationTaken(med.id)}>
              {med.taken ? 'Zuruecksetzen' : 'Als genommen markieren'}
            </button>
            <button
              type="button"
              className="button ghost danger delete-action"
              onClick={async () => {
                try {
                  setError('')
                  await deleteGuard.requestDelete({
                    id: med.id,
                    title: 'Medikament loeschen',
                    message: 'Moechtest du dieses Medikament wirklich loeschen?',
                    confirmLabel: 'Medikament loeschen',
                    onConfirm: async () => {
                      await actions.deleteMedication(med.id)
                    },
                    onError: (deleteError) => {
                      setError(toGermanErrorMessage(deleteError, 'Das Medikament konnte nicht geloescht werden.'))
                    },
                  })
                } catch (deleteError) {
                  setError(toGermanErrorMessage(deleteError, 'Die Loeschanfrage konnte nicht gestartet werden.'))
                }
              }}
            >
              <span aria-hidden="true">🗑</span>
              {deleteGuard.isDeletePending(med.id) ? 'bestaetigen' : 'Loeschen'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
