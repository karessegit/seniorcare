// Diese Datei enthaelt Hilfen fuer SOS-Texte.
// Autor: Wilfred Feyem
export const DEFAULT_SOS_MESSAGE = 'Notfallhilfe angefordert. Keine weiteren Details angegeben.'

export function isDefaultSosMessage(value) {
  return value?.trim() === DEFAULT_SOS_MESSAGE
}
