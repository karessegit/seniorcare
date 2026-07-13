// Hier kann der Caregiver Medikamente vom Senior ansehen und bearbeiten.
// Autor: Karesse Tchoffo
import { CardTitle } from '../../../components/ui'
import { MedicationForm } from '../../../components/recordForms'
import { toGermanErrorMessage } from '../../../lib/userMessages'

export function MedicationPanel({
  meds,
  currentMedication,
  medicationEditId,
  setMedicationEditId,
  showMedicationForm,
  setShowMedicationForm,
  medicationFormRef,
  medicationFeedback,
  actions,
  deleteGuard,
  setError,
}) {
  return (
    <section className="caregiver-panel">
      <CardTitle  subtitle="Aktueller Medikamentenplan fuer diesen Senior." />
      <div className="action-row">
        <button
          type="button"
          className="button primary add-pill"
          onClick={() => {
            setShowMedicationForm((current) => !current)
            setMedicationEditId(null)
            setError('')
            deleteGuard.resetDeleteGuard()
          }}
        >
          <span aria-hidden="true">＋</span>
          {showMedicationForm ? 'Schliessen' : 'Medikamente Hinzufügen'}
        </button>
      </div>
      {showMedicationForm && (
        <div ref={medicationFormRef}>
          {/* Der Caregiver benutzt hier das gleiche Formular wie der Senior. */}
          <MedicationForm
            key={medicationEditId ?? 'caregiver-new-medication'}
            initialValue={currentMedication}
            onSave={async (form) => {
              try {
                setError('')
                await actions.addMedication(form, medicationEditId)
                setShowMedicationForm(false)
                setMedicationEditId(null)
                deleteGuard.resetDeleteGuard()
              } catch (saveError) {
                setError(toGermanErrorMessage(saveError, 'Das Medikament konnte nicht gespeichert werden.'))
              }
            }}
            onCancel={() => {
              setShowMedicationForm(false)
              setMedicationEditId(null)
              setError('')
              deleteGuard.resetDeleteGuard()
            }}
          />
        </div>
      )}
      {medicationFeedback.message && <p className="status-line sync">{medicationFeedback.message}</p>}
      <div className={`stack-list ${medicationFeedback.active ? 'is-updated' : ''}`}>
        {meds.map((med) => (
          <article className="list-card medication-card caregiver-record-card" key={med.id}>
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
                  setMedicationEditId(med.id)
                  setShowMedicationForm(true)
                  setError('')
                  deleteGuard.resetDeleteGuard()
                }}
              >
                <span aria-hidden="true">✎</span>
                Bearbeiten
              </button>
              <button
                type="button"
                className="button ghost danger delete-action"
                onClick={async () => {
                  try {
                    setError('')
                    await deleteGuard.requestDelete({
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
                Loeschen
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
