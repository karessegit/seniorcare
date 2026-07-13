// Hier kann der Caregiver Uebungen vom Senior ansehen und bearbeiten.
// Autor: Karesse Tchoffo
import { ExerciseForm } from '../../../components/recordForms'
import { toGermanErrorMessage } from '../../../lib/userMessages'

export function ExercisePanel({
  exercises,
  currentExercise,
  exerciseEditId,
  setExerciseEditId,
  showExerciseForm,
  setShowExerciseForm,
  exerciseFormRef,
  exerciseFeedback,
  actions,
  deleteGuard,
  setError,
}) {
  return (
    <section className="caregiver-panel">
      <div className="action-row">
        <button
          type="button"
          className="button primary add-pill"
          onClick={() => {
            setShowExerciseForm((current) => !current)
            setExerciseEditId(null)
            setError('')
            deleteGuard.resetDeleteGuard()
          }}
        >
          <span aria-hidden="true">＋</span>
          {showExerciseForm ? 'Schliessen' : 'Uebung hinzufuegen'}
        </button>
      </div>
      {showExerciseForm && (
        <div ref={exerciseFormRef}>
          <ExerciseForm
            key={exerciseEditId ?? 'caregiver-new-exercise'}
            initialValue={currentExercise}
            onSave={async (form) => {
              try {
                setError('')
                await actions.addExercise(form, exerciseEditId)
                setShowExerciseForm(false)
                setExerciseEditId(null)
                deleteGuard.resetDeleteGuard()
              } catch (saveError) {
                setError(toGermanErrorMessage(saveError, 'Die Uebung konnte nicht gespeichert werden.'))
              }
            }}
            onCancel={() => {
              setShowExerciseForm(false)
              setExerciseEditId(null)
              setError('')
              deleteGuard.resetDeleteGuard()
            }}
          />
        </div>
      )}
      {exerciseFeedback.message && <p className="status-line sync">{exerciseFeedback.message}</p>}
      <div className={`stack-list ${exerciseFeedback.active ? 'is-updated' : ''}`}>
        {exercises.map((exercise) => (
          <article className={`list-card caregiver-record-card ${exercise.done ? 'is-done' : ''}`} key={exercise.id}>
            <div className="list-row">
              <div>
                <p className="item-title">{exercise.name}</p>
                <p className="item-subtitle">
                  {exercise.duration} · {exercise.level}
                </p>
              </div>
              <div className="time-badge">{exercise.done ? 'Erledigt' : 'Offen'}</div>
            </div>
            <p className="item-note">{exercise.description}</p>
            <div className="card-actions">
              <button
                type="button"
                className="button ghost edit-action"
                onClick={() => {
                  setExerciseEditId(exercise.id)
                  setShowExerciseForm(true)
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
                      title: 'Uebung loeschen',
                      message: 'Moechtest du diese Uebung wirklich loeschen?',
                      confirmLabel: 'Uebung loeschen',
                      onConfirm: async () => {
                        await actions.deleteExercise(exercise.id)
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
                Loeschen
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
