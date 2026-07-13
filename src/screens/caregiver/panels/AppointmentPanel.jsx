// Hier kann der Caregiver Termine vom Senior ansehen und bearbeiten.
// Autor: Karesse Tchoffo
import { AppointmentForm } from '../../../components/recordForms'
import { formatDateBadge } from '../../../lib/format'
import { toGermanErrorMessage } from '../../../lib/userMessages'

export function AppointmentPanel({
  appointments,
  currentAppointment,
  appointmentEditId,
  setAppointmentEditId,
  showAppointmentForm,
  setShowAppointmentForm,
  appointmentFormRef,
  appointmentFeedback,
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
            setShowAppointmentForm((current) => !current)
            setAppointmentEditId(null)
            setError('')
            deleteGuard.resetDeleteGuard()
          }}
        >
          <span aria-hidden="true">＋</span>
          {showAppointmentForm ? 'Schliessen' : 'Termine Hinzufügen'}
        </button>
      </div>
      {showAppointmentForm && (
        <div ref={appointmentFormRef}>
          <AppointmentForm
            key={appointmentEditId ?? 'caregiver-new-appointment'}
            initialValue={currentAppointment}
            onSave={async (form) => {
              try {
                setError('')
                await actions.addAppointment(form, appointmentEditId)
                setShowAppointmentForm(false)
                setAppointmentEditId(null)
                deleteGuard.resetDeleteGuard()
              } catch (saveError) {
                setError(toGermanErrorMessage(saveError, 'Der Termin konnte nicht gespeichert werden.'))
              }
            }}
            onCancel={() => {
              setShowAppointmentForm(false)
              setAppointmentEditId(null)
              setError('')
              deleteGuard.resetDeleteGuard()
            }}
          />
        </div>
      )}
      {appointmentFeedback.message && <p className="status-line sync">{appointmentFeedback.message}</p>}
      <div className={`stack-list ${appointmentFeedback.active ? 'is-updated' : ''}`}>
        {appointments.map((termin) => (
          <article className="list-card appointment-card caregiver-record-card" key={termin.id}>
            <div className="list-row">
              <DateBadge date={termin.date} />
              <div className="record-main">
                <p className="item-title">{termin.doctor}</p>
                <p className="item-note">⌖ {termin.address}</p>
              </div>
              <div className="record-side">
                <div className="time-badge"><span aria-hidden="true">◷</span>{termin.time}</div>
              </div>
            </div>
            <div className="card-actions">
              <button
                type="button"
                className="button ghost edit-action"
                onClick={() => {
                  setAppointmentEditId(termin.id)
                  setShowAppointmentForm(true)
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
                      title: 'Termin loeschen',
                      message: 'Moechtest du diesen Termin wirklich loeschen?',
                      confirmLabel: 'Termin loeschen',
                      onConfirm: async () => {
                        await actions.deleteAppointment(termin.id)
                      },
                      onError: (deleteError) => {
                        setError(toGermanErrorMessage(deleteError, 'Der Termin konnte nicht geloescht werden.'))
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

function DateBadge({ date }) {
  const parts = formatDateBadge(date)

  return (
    <div className="date-badge caregiver-date-badge" aria-label={date}>
      <strong>{parts.day}</strong>
      <span>{parts.month}</span>
    </div>
  )
}
