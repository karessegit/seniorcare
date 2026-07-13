// Diese Datei prueft, ob Eintrags-Formulare gueltig sind.
// Autor: Karesse Tchoffo
export function isMedicationFormValid(form) {
  return form.name.trim() && String(form.amount).trim() && Number(form.amount) > 0 && form.unit.trim() && form.time.trim()
}

export function isAppointmentFormValid(form) {
  return form.doctor.trim() && form.date.trim() && form.time.trim() && form.address.trim()
}

export function isExerciseFormValid(form) {
  return form.name.trim() && form.duration.trim() && form.level.trim() && form.description.trim()
}
