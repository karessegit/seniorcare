// Hier ist der Medikamenten-Screen fuer Senioren.
// Autor: Wilfred Feyem
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav, ConfirmDialog, EmptyState } from '../../components/ui'
import { MedicationForm } from '../../components/recordForms'
import { navigation } from '../../data/seedData'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { useCollectionFeedback } from '../../hooks/useCollectionFeedback'
import { useDeleteGuard } from '../../hooks/useDeleteGuard'
import { toGermanErrorMessage } from '../../lib/userMessages'
import { MedicationList } from './medications/MedicationList'

export function MedicationScreen() {
  const navigate = useNavigate()
  const { currentSenior, actions } = useSeniorCare()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const deleteGuard = useDeleteGuard()
  const formRef = useRef(null)
  const current = editId ? currentSenior.meds.find((med) => med.id === editId) : null
  const feedback = useCollectionFeedback(
    currentSenior.meds,
    // Diese Werte reichen, um echte Aenderungen in der Medikamentenliste zu erkennen.
    (items) => items.map((med) => `${med.id}:${med.name}:${med.time}:${med.notes}:${med.taken}`).join('|'),
    { singular: 'Medikament', plural: 'Medikamente' },
  )

  useEffect(() => {
    if (!showForm) return
    // Nach Klick auf Bearbeiten soll der Nutzer das Formular sofort sehen.
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editId, showForm])

  return (
    <div className="screen senior-screen">
      <header className="mobile-header page-title-row">
        <span className="title-icon pill-icon" aria-hidden="true">💊</span>
        <h1>Medikamente</h1>
      </header>

      <main className="screen-body">
        <button
          type="button"
          className="button primary add-pill"
          onClick={() => {
            setShowForm((value) => !value)
            setEditId(null)
            deleteGuard.resetDeleteGuard()
          }}
        >
          <span aria-hidden="true">＋</span>
          {showForm ? 'Schliessen' : 'Medikamente Hinzufügen'}
        </button>

        {showForm && (
          <div ref={formRef}>
            <MedicationForm
              key={editId ?? 'new'}
              initialValue={current}
              onSave={async (form) => {
                try {
                  setError('')
                  await actions.addMedication(form, editId)
                  setShowForm(false)
                  setEditId(null)
                  deleteGuard.resetDeleteGuard()
                } catch (saveError) {
                  setError(toGermanErrorMessage(saveError, 'Das Medikament konnte nicht gespeichert werden.'))
                }
              }}
              onCancel={() => {
                setShowForm(false)
                setEditId(null)
                deleteGuard.resetDeleteGuard()
              }}
            />
          </div>
        )}

        {!currentSenior.meds.length && <EmptyState title="keine Medikamente" />}
        {error && <p className="status-line danger">{error}</p>}

        {feedback.message && <p className="status-line sync">{feedback.message}</p>}

        <MedicationList
          meds={currentSenior.meds}
          feedbackActive={feedback.active}
          actions={actions}
          deleteGuard={deleteGuard}
          setError={setError}
          onEdit={(id) => {
            setEditId(id)
            setShowForm(true)
          }}
        />
      </main>

      <ConfirmDialog {...deleteGuard.dialogProps} />
      <BottomNav active="meds" items={navigation} onNavigate={(path) => navigate(path)} />
    </div>
  )
}
