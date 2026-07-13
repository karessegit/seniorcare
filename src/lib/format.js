// Hier werden Namen, Daten, Codes und Uhrzeiten formatiert.
// Autor: Wilfred Feyem
export function formatDate(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDateBadge(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return { day: '', month: dateString }
  }

  return {
    day: new Intl.DateTimeFormat('de-DE', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(date).toLowerCase(),
  }
}

export function formatCodeLabel(code) {
  return code.split('').join(' ')
}

export function initials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function currentTime() {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function currentLastActiveLabel() {
  return `Heute ${currentTime()}`
}
