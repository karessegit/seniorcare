// Diese Datei macht technische Fehler fuer Nutzer verstaendlich.
// Autor: Wilfred Feyem
export function toGermanErrorMessage(error, fallback = 'Ein unerwarteter Fehler ist aufgetreten.') {
  const message = error?.message || ''

  if (!message) return fallback
  if (/invalid login credentials/i.test(message)) return 'E-Mail oder Passwort ist falsch.'
  if (/user already registered|already registered|already exists/i.test(message)) return 'Diese E-Mail-Adresse wird bereits verwendet.'
  if (/password.*6|weak password|password should be at least/i.test(message)) return 'Das Passwort muss mindestens 6 Zeichen lang sein.'
  if (/invalid email|email address is invalid/i.test(message)) return 'Bitte gib eine gueltige E-Mail-Adresse ein.'
  if (/email not confirmed/i.test(message)) return 'Die E-Mail-Adresse wurde noch nicht bestaetigt.'
  if (/signups are disabled/i.test(message)) return 'Registrierungen sind derzeit deaktiviert.'
  if (/database error saving new user|error saving new user/i.test(message)) {
    return 'Das Konto konnte in der Datenbank nicht angelegt werden. Bitte fuehre das aktuelle Supabase-SQL erneut aus.'
  }
  if (/timed out/i.test(message)) return 'Die Anfrage hat zu lange gedauert. Bitte versuche es erneut.'
  if (/row-level security|permission denied|violates row-level security/i.test(message)) {
    return 'Fuer diese Aktion fehlen die noetigen Berechtigungen in Supabase.'
  }
  if (/not authenticated/i.test(message)) return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.'
  if (/current user is not a caregiver/i.test(message)) return 'Dieses Konto ist kein Caregiver-Konto.'
  if (/senior not found/i.test(message)) return 'Der Senior-Code wurde nicht gefunden.'
  if (/duplicate key/i.test(message)) return 'Dieser Eintrag existiert bereits.'

  return fallback
}
