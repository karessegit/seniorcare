// Hier ist der Gym-Screen fuer Senioren.
// Autor: Wilfred Feyem
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav, ConfirmDialog } from '../../components/ui'
import { ExerciseForm } from '../../components/recordForms'
import { navigation } from '../../data/seedData'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { useCollectionFeedback } from '../../hooks/useCollectionFeedback'
import { useDeleteGuard } from '../../hooks/useDeleteGuard'
import { toGermanErrorMessage } from '../../lib/userMessages'
import { ExerciseDetail } from './gym/ExerciseDetail'
import { ExerciseGrid } from './gym/ExerciseGrid'
import { useExerciseEdit } from './gym/useExerciseEdit'

export function GymScreen() {
  const navigate = useNavigate()
  const { currentSenior, actions } = useSeniorCare()
  const [activeExercise, setActiveExercise] = useState(currentSenior.exercises[0]?.id || 1)
  const [error, setError] = useState('')
  const deleteGuard = useDeleteGuard()
  const { showForm, editId, formRef, toggleNewForm, startEdit, closeForm } = useExerciseEdit()
  const current = currentSenior.exercises.find((exercise) => exercise.id === activeExercise) || currentSenior.exercises[0]
  const currentEditExercise = editId ? currentSenior.exercises.find((exercise) => exercise.id === editId) : null
  const feedback = useCollectionFeedback(
    currentSenior.exercises,
    // Bei Uebungen reicht hier id + erledigt-Status fuer die kurze Sync-Meldung.
    (items) => items.map((exercise) => `${exercise.id}:${exercise.done}`).join('|'),
    { singular: 'Uebung', plural: 'Uebungen' },
  )

  return (
    <div className="screen senior-screen">
      <header className="mobile-header page-title-row">
        <span className="title-icon gym-icon" aria-hidden="true">🏋️</span>
        <h1>GYM</h1>
      </header>

      <main className="screen-body">
        {showForm && (
          <div ref={formRef}>
            <ExerciseForm
              key={editId ?? 'new-exercise'}
              initialValue={currentEditExercise}
              onSave={async (form) => {
                try {
                  setError('')
                  await actions.addExercise(form, editId)
                  closeForm()
                } catch (saveError) {
                  setError(toGermanErrorMessage(saveError, 'Die Uebung konnte nicht gespeichert werden.'))
                }
              }}
              onCancel={closeForm}
            />
          </div>
        )}

        {feedback.message && <p className="status-line sync">{feedback.message}</p>}
        {error && <p className="status-line danger">{error}</p>}

        <ExerciseGrid
          exercises={currentSenior.exercises}
          activeExercise={activeExercise}
          setActiveExercise={setActiveExercise}
          feedbackActive={feedback.active}
          onSelect={deleteGuard.resetDeleteGuard}
        />

        <ExerciseDetail
          current={current}
          actions={actions}
          currentSenior={currentSenior}
          deleteGuard={deleteGuard}
          setActiveExercise={setActiveExercise}
          setError={setError}
          onEdit={startEdit}
        />
        <button
          type="button"
          className="button ghost subtle-add"
          onClick={() => {
            toggleNewForm()
            deleteGuard.resetDeleteGuard()
          }}
        >
          {showForm ? 'Schliessen' : 'Uebung hinzufügen'}
        </button>
      </main>

      <ConfirmDialog {...deleteGuard.dialogProps} />
      <BottomNav active="gym" items={navigation} onNavigate={(path) => navigate(path)} />
    </div>
  )
}
