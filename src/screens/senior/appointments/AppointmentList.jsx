// Hier ist die Terminliste fuer Senioren.
// Autor: Wilfred Feyem
import { formatDateBadge } from '../../../lib/format'
import { toGermanErrorMessage } from '../../../lib/userMessages'

export function AppointmentList({ appointments, feedbackActive, actions, deleteGuard, setError, onEdit }) {
  return (
    <div className={`stack-list ${feedbackActive ? 'is-updated' : ''}`}>
      {appointments.map((termin) => (
        <article key={termin.id} className="list-card appointment-card">
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
                onEdit(termin.id)
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
                    id: termin.id,
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
              {deleteGuard.isDeletePending(termin.id) ? 'Nochmals klicken' : 'Loeschen'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function DateBadge({ date }) {
  const parts = formatDateBadge(date)

  return (
    <div className="date-badge" aria-label={date}>
      <strong>{parts.day}</strong>
      <span>{parts.month}</span>
    </div>
  )
}
