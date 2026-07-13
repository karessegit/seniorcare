// Hier werden die Details zu einem betreuten Senior gezeigt.
// Autor: Karesse Tchoffo
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, ConfirmDialog } from '../../components/ui'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { useCollectionFeedback } from '../../hooks/useCollectionFeedback'
import { useDeleteGuard } from '../../hooks/useDeleteGuard'
import { toGermanErrorMessage } from '../../lib/userMessages'
import { AppointmentPanel, ExercisePanel, MedicationPanel, OverviewPanel } from './CaregiverRecordPanels'

export function CaregiverDetailScreen() {
  const navigate = useNavigate()
  const params = useParams()
  const { currentSenior, currentCaregiver, actions } = useSeniorCare()
  const [activePanel, setActivePanel] = useState('overview')
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [medicationEditId, setMedicationEditId] = useState(null)
  const [appointmentEditId, setAppointmentEditId] = useState(null)
  const [exerciseEditId, setExerciseEditId] = useState(null)
  const [error, setError] = useState('')
  const deleteGuard = useDeleteGuard()
  const medicationFormRef = useRef(null)
  const appointmentFormRef = useRef(null)
  const exerciseFormRef = useRef(null)
  const senior = currentCaregiver.seniors.find((entry) => entry.id === params.seniorId) || currentCaregiver.seniors[0]
  const statusMap = {
    good: { label: 'gut', tone: 'positive' },
    ok: { label: 'okay', tone: 'neutral' },
    bad: { label: 'kritisch', tone: 'negative' },
  }

  useEffect(() => {
    // Die URL entscheidet hier, welcher Senior gerade ausgewaehlt ist.
    if (!params.seniorId || params.seniorId === currentSenior?.seniorRow?.id) return
    void actions.setSelectedSeniorId(params.seniorId)
  }, [actions, currentSenior?.seniorRow?.id, params.seniorId])

  const statusInfo = statusMap[senior?.status || currentSenior.mood || 'good'] || statusMap.good
  const meds = currentSenior.meds || []
  const appointments = currentSenior.appointments || []
  const exercises = currentSenior.exercises || []
  const latestSos = currentSenior.latestSos || senior?.latestSos || null
  const currentMedication = medicationEditId ? meds.find((item) => item.id === medicationEditId) : null
  const currentAppointment = appointmentEditId ? appointments.find((item) => item.id === appointmentEditId) : null
  const currentExercise = exerciseEditId ? exercises.find((item) => item.id === exerciseEditId) : null
  const medicationFeedback = useCollectionFeedback(
    meds,
    // Diese Signatur merkt, ob Medikamente hinzugefuegt, geloescht oder geaendert wurden.
    (items) => items.map((med) => `${med.id}:${med.name}:${med.time}:${med.notes}:${med.taken}`).join('|'),
    { singular: 'Medikament', plural: 'Medikamente' },
  )
  const appointmentFeedback = useCollectionFeedback(
    appointments,
    // Bei Terminen werden die sichtbaren Hauptfelder verglichen.
    (items) => items.map((appointment) => `${appointment.id}:${appointment.doctor}:${appointment.date}:${appointment.time}:${appointment.address}`).join('|'),
    { singular: 'Termin', plural: 'Termine' },
  )
  const exerciseFeedback = useCollectionFeedback(
    exercises,
    // Fuer die Uebersicht ist vor allem wichtig, ob eine Uebung erledigt ist.
    (items) => items.map((exercise) => `${exercise.id}:${exercise.done}`).join('|'),
    { singular: 'Uebung', plural: 'Uebungen' },
  )
  const panels = [
    { key: 'overview', label: 'Ueberblick' },
    { key: 'medications', label: 'Medikamente' },
    { key: 'appointments', label: 'Termine' },
    { key: 'exercises', label: 'Uebungen' },
  ]
  const seniorName = [senior?.firstName, senior?.lastName].filter(Boolean).join(' ')

  useEffect(() => {
    if (!showMedicationForm) return
    // Das geoeffnete Formular soll nicht unterhalb des sichtbaren Bereichs bleiben.
    medicationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [medicationEditId, showMedicationForm])

  useEffect(() => {
    if (!showAppointmentForm) return
    // Gleiche Scroll-Hilfe fuer Termine.
    appointmentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [appointmentEditId, showAppointmentForm])

  useEffect(() => {
    if (!showExerciseForm) return
    // Gleiche Scroll-Hilfe fuer Uebungen.
    exerciseFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [exerciseEditId, showExerciseForm])

  return (
    <div className="caregiver-screen">
      <header className="caregiver-header detail-header">
        <div className="detail-header-actions">
          <BackButton label="↩ Zurück" onClick={() => navigate('/caregiver/home')} />
          {activePanel !== 'overview' && (
            <button type="button" className="button ghost detail-overview-button" onClick={() => setActivePanel('overview')}>
              Zurück zum Überblick
            </button>
          )}
        </div>
      </header>

      <main className="caregiver-body">
        {latestSos && (
          <section className="detail-summary sos-summary">
            <div className="status-banner negative">SOS aktiv</div>
            <p className="item-note">{latestSos.text}</p>
            <p className="item-subtitle">Gesendet um {latestSos.time}</p>
          </section>
        )}

        <section className="caregiver-profile-card">
          <div className="avatar large-avatar" aria-hidden="true">👤</div>
          <div>
            <h1>{senior?.firstName}</h1>
            <p>Zuletzt aktiv: {senior?.lastActive}</p>
            <p className={`caregiver-status-dot ${statusInfo.tone}`}>
              <span aria-hidden="true" />
              als {statusInfo.label} gemeldet
            </p>
          </div>
        </section>

        <section className="caregiver-menu">
          {panels
            .filter((panel) => panel.key === 'medications' || panel.key === 'appointments' || panel.key === 'exercises')
            .map((panel) => (
            <button
              key={panel.key}
              type="button"
              className={`button secondary caregiver-menu-button ${activePanel === panel.key ? 'is-active' : ''}`}
              onClick={() => setActivePanel(panel.key)}
            >
              {panel.label}
            </button>
            ))}
        </section>

        {error && <p className="status-line danger">{error}</p>}

        {activePanel === 'overview' && (
          <>
            <h2 className="section-heading">Überblick</h2>
            <OverviewPanel appointments={appointments} meds={meds} />
          </>
        )}

        {activePanel === 'medications' && (
          <MedicationPanel
            meds={meds}
            currentMedication={currentMedication}
            medicationEditId={medicationEditId}
            setMedicationEditId={setMedicationEditId}
            showMedicationForm={showMedicationForm}
            setShowMedicationForm={setShowMedicationForm}
            medicationFormRef={medicationFormRef}
            medicationFeedback={medicationFeedback}
            actions={actions}
            deleteGuard={deleteGuard}
            setError={setError}
          />
        )}

        {activePanel === 'appointments' && (
          <AppointmentPanel
            appointments={appointments}
            currentAppointment={currentAppointment}
            appointmentEditId={appointmentEditId}
            setAppointmentEditId={setAppointmentEditId}
            showAppointmentForm={showAppointmentForm}
            setShowAppointmentForm={setShowAppointmentForm}
            appointmentFormRef={appointmentFormRef}
            appointmentFeedback={appointmentFeedback}
            actions={actions}
            deleteGuard={deleteGuard}
            setError={setError}
          />
        )}

        {activePanel === 'exercises' && (
          <ExercisePanel
            exercises={exercises}
            currentExercise={currentExercise}
            exerciseEditId={exerciseEditId}
            setExerciseEditId={setExerciseEditId}
            showExerciseForm={showExerciseForm}
            setShowExerciseForm={setShowExerciseForm}
            exerciseFormRef={exerciseFormRef}
            exerciseFeedback={exerciseFeedback}
            actions={actions}
            deleteGuard={deleteGuard}
            setError={setError}
          />
        )}
        {activePanel === 'overview' && (
          <div className="caregiver-danger-zone">
            <button
              type="button"
              className="button ghost danger"
              onClick={async () => {
                try {
                  setError('')
                  await deleteGuard.requestDelete({
                    title: 'Verbindung trennen',
                    message: `Moechtest du die Verbindung mit ${seniorName || 'diesem Senior'} wirklich trennen?`,
                    confirmLabel: `Verbindung mit ${seniorName || 'Senior'} trennen`,
                    onConfirm: async () => {
                      const nextSeniorId = await actions.disconnectSenior(senior.id)
                      navigate(nextSeniorId ? `/caregiver/seniors/${nextSeniorId}` : '/caregiver/home', { replace: true })
                    },
                    onError: (disconnectError) => {
                      setError(toGermanErrorMessage(disconnectError, 'Die Verbindung konnte nicht getrennt werden.'))
                    },
                  })
                } catch (disconnectError) {
                  setError(toGermanErrorMessage(disconnectError, 'Die Anfrage konnte nicht gestartet werden.'))
                }
              }}
            >
              Verbindung trennen
            </button>
          </div>
        )}
      </main>

      <ConfirmDialog {...deleteGuard.dialogProps} />
    </div>
  )
}
