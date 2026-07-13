// Diese Datei erzeugt einfache Antworten fuer den Assistenten.
// Autor: Wilfred Feyem
import { formatDate } from './format'

export function getAssistantReply(text, senior) {
  const normalized = text.toLowerCase()
  if (normalized.includes('medikament') || normalized.includes('medication')) {
    const next = senior.meds[0]
    return `Dein nächstes Medikament:\n\n${next.name}\nHeute um ${next.time} Uhr\n${next.notes}.`
  }
  if (normalized.includes('termin') || normalized.includes('appointment')) {
    const next = senior.appointments[0]
    return `Dein nächster Termin:\n\n${next.doctor}\n${formatDate(next.date)} um ${next.time} Uhr\n${next.address}.`
  }
  if (normalized.includes('sos') || normalized.includes('hilfe') || normalized.includes('help')) {
    return '🚨 SOS wurde aktiviert. Der Caregiver und die Notfallkontakte wurden informiert.'
  }
  return 'Nachricht erhalten. Wobei kann ich dir noch helfen?'
}
