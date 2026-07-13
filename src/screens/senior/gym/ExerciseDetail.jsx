// Hier sieht man Details und Aktionen fuer eine Uebung.
// Autor: Wilfred Feyem
import { toGermanErrorMessage } from '../../../lib/userMessages'

export function ExerciseDetail({ current, actions, currentSenior, deleteGuard, setActiveExercise, setError, onEdit }) {
  if (!current) return null

  return (
    <section className="detail-panel">
      <div className="detail-head">
        <div>
          <div className="detail-emoji">{current.emoji}</div>
          <h3>{current.name}</h3>
          <p>
            {current.duration} · {current.level}
          </p>
        </div>
        <button
          type="button"
          className="button ghost edit-action"
          onClick={async () => {
            try {
              setError('')
              await actions.toggleExerciseDone(current.id)
            } catch (toggleError) {
              setError(toGermanErrorMessage(toggleError, 'Die Uebung konnte nicht aktualisiert werden.'))
            }
          }}
        >
          {current.done ? 'Rueckgaengig' : 'Erledigt'}
        </button>
      </div>
      <p className="item-note">{current.description}</p>
      <ul className="steps-list">
        {current.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      <div className="card-actions">
        <button
          type="button"
          className="button ghost"
          onClick={() => {
            onEdit(current.id)
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
                id: `exercise:${current.id}`,
                message: 'Moechtest du diese Uebung wirklich loeschen?',
                confirmLabel: 'Uebung loeschen',
                onConfirm: async () => {
                  await actions.deleteExercise(current.id)
                  const nextExercise = currentSenior.exercises.find((exercise) => exercise.id !== current.id)
                  setActiveExercise(nextExercise?.id || 1)
                },
                onError: (deleteError) => {
                  setError(toGermanErrorMessage(deleteError, 'Die Uebung konnte nicht geloescht werden.'))
                },
              })
            } catch (deleteError) {
              setError(toGermanErrorMessage(deleteError, 'Die Loeschanfrage konnte nicht gestartet werden.'))
            }
          }}
        >
          <span aria-hidden="true">🗑</span>
          {deleteGuard.isDeletePending(`exercise:${current.id}`) ? 'Nochmals klicken' : 'Loeschen'}
        </button>
      </div>
    </section>
  )
}
