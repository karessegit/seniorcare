// Diese Datei zeigt kurze Rueckmeldungen bei Listen-Aenderungen.
// Autor: Wilfred Feyem
import { useEffect, useMemo, useRef, useState } from 'react'

export function useCollectionFeedback(items, buildSignature, labels) {
  const [feedback, setFeedback] = useState({ active: false, message: '' })
  const previousRef = useRef(null)

  // Die Signatur ist ein kurzer Vergleichswert fuer die Liste.
  // So merkt der Hook auch Aenderungen, wenn die Anzahl gleich bleibt.
  const signature = useMemo(() => buildSignature(items), [buildSignature, items])

  useEffect(() => {
    const previous = previousRef.current
    previousRef.current = { signature, count: items.length }

    // Beim ersten Render soll noch keine Meldung erscheinen.
    if (!previous || previous.signature === signature) {
      return undefined
    }

    const message =
      items.length > previous.count
        ? `${labels.singular} added.`
        : items.length < previous.count
          ? `${labels.singular} removed.`
          : `${labels.plural} updated.`

    setFeedback({ active: true, message })

    // Die Meldung soll nur kurz sichtbar sein und dann wieder verschwinden.
    const timeoutId = window.setTimeout(() => {
      setFeedback({ active: false, message: '' })
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [items.length, labels.plural, labels.singular, signature])

  return feedback
}
