// Diese Datei zeigt den SOS-Knopf mit dem Countdown direkt im Knopf.
// Autor: Wilfred Feyem
import { SOS_COUNTDOWN_SECONDS } from './useSosState'

export function SosSection({ sosState, sosSecondsLeft, startSosCountdown, cancelSosCountdown }) {
  const isCountingDown = sosState === 'countdown'
  const isSending = sosState === 'sending'
  const progress = ((SOS_COUNTDOWN_SECONDS - sosSecondsLeft) / SOS_COUNTDOWN_SECONDS) * 100
  const buttonLabel = isCountingDown
    ? `Abbrechen ${sosSecondsLeft}s`
    : isSending
      ? 'SOS wird gesendet ...'
      : 'SOS-Notruf'

  return (
    <section className="sos-card">
      <div className="sos-panel">
        <button
          type="button"
          className={`button red sos-main-button ${isCountingDown ? 'is-counting' : ''}`}
          disabled={isSending}
          style={{ '--sos-progress': `${progress}%` }}
          onClick={() => {
            if (isCountingDown) {
              cancelSosCountdown()
              return
            }

            void startSosCountdown()
          }}
        >
          <span>{buttonLabel}</span>
        </button>
      </div>
    </section>
  )
}
