// Hier ist der Termin-Screen fuer Senioren.
// Autor: Wilfred Feyem
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav, ConfirmDialog, EmptyState } from '../../components/ui'
import { AppointmentForm } from '../../components/recordForms'
import { navigation } from '../../data/seedData'
import { useCollectionFeedback } from '../../hooks/useCollectionFeedback'
import { useDeleteGuard } from '../../hooks/useDeleteGuard'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { toGermanErrorMessage } from '../../lib/userMessages'
import { AppointmentList } from './appointments/AppointmentList'

export function AppointmentScreen() {
  const navigate = useNavigate()
  const { currentSenior, actions } = useSeniorCare()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const deleteGuard = useDeleteGuard()
  const formRef = useRef(null)
  const current = editId ? currentSenior.appointments.find((item) => item.id === editId) : null
  const feedback = useCollectionFeedback(
    currentSenior.appointments,
    // Die Signatur vergleicht die Felder, die auf dem Termin-Screen wichtig sind.
    (items) => items.map((appointment) => `${appointment.id}:${appointment.doctor}:${appointment.date}:${appointment.time}:${appointment.address}`).join('|'),
    { singular: 'Termin', plural: 'Termine' },
  )

  useEffect(() => {
    if (!showForm) return
    // Beim Bearbeiten wird automatisch zum Formular gescrollt.
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editId, showForm])

  return (
    <div className="screen senior-screen">
      <header className="mobile-header page-title-row">
        <span className="title-icon calendar-icon" aria-hidden="true">📅</span>
        <h1>Termine</h1>
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
          {showForm ? 'Schliessen' : 'Termine Hinzufügen'}
        </button>

        {showForm && (
          <div ref={formRef}>
            <AppointmentForm
              key={editId ?? 'new'}
              initialValue={current}
              onSave={async (form) => {
                try {
                  setError('')
                  await actions.addAppointment(form, editId)
                  setShowForm(false)
                  setEditId(null)
                  deleteGuard.resetDeleteGuard()
                } catch (saveError) {
                  setError(toGermanErrorMessage(saveError, 'Der Termin konnte nicht gespeichert werden.'))
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

        {!currentSenior.appointments.length && <EmptyState title="Keine Termine" />}
        {error && <p className="status-line danger">{error}</p>}

        {feedback.message && <p className="status-line sync">{feedback.message}</p>}

        <AppointmentList
          appointments={currentSenior.appointments}
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
      <BottomNav active="appointments" items={navigation} onNavigate={(path) => navigate(path)} />
    </div>
  )
}
