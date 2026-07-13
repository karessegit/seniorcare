// Diese Datei zeigt die wichtigsten naechsten Schritte.
// Autor: Wilfred Feyem
import { CardTitle, SmallCard } from '../../../components/ui'

export function FocusSummary({ currentSenior }) {
  const nextMedication = currentSenior.meds.find((med) => !med.taken) || currentSenior.meds[0]

  return (
    <section className="focus-grid">
      <CardTitle title="Ueberblick" subtitle="Die wichtigsten naechsten Schritte auf einen Blick." />
      <div className="focus-list">
        <SmallCard
          title="Naechstes Medikament"
          value={nextMedication ? `${nextMedication.name} · ${nextMedication.time}` : 'Kein Medikament'}
          detail={nextMedication?.notes || 'Alles erledigt'}
        />
        <SmallCard
          title="Naechster Termin"
          value={currentSenior.appointments[0] ? `${currentSenior.appointments[0].doctor} · ${currentSenior.appointments[0].time}` : 'Kein Termin'}
          detail={currentSenior.appointments[0] ? currentSenior.appointments[0].address : 'Heute frei'}
        />
      </div>
    </section>
  )
}
