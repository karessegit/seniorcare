// Hier sieht der Caregiver die heutige Uebersicht von einem Senior.
// Autor: Karesse Tchoffo
import { formatDateBadge } from '../../../lib/format'

export function OverviewPanel({ appointments, meds }) {
  return (
    <section className="caregiver-panel">
      <div className="stack-list">
        {appointments.map((termin) => (
          <article className="list-card appointment-card caregiver-record-card" key={termin.id}>
            <div className="list-row">
              <DateBadge date={termin.date} />
              <div className="record-main">
                <p className="item-title">{termin.doctor}</p>
                <p className="item-note">⌖ {termin.address}</p>
              </div>
              <div className="time-badge"><span aria-hidden="true">◷</span>{termin.time}</div>
            </div>
          </article>
        ))}
        {meds.map((med) => (
          <article className="list-card medication-card caregiver-record-card" key={med.id}>
            <div className="list-row">
              <span className="record-icon pill-icon" aria-hidden="true">💊</span>
              <div className="record-main">
                <p className="item-title">{med.name}</p>
                <p className="item-note">{med.taken ? 'eingenommen' : 'noch nicht eingenommen'}</p>
              </div>
              <div className="time-badge"><span aria-hidden="true">◷</span>{med.time}</div>
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
