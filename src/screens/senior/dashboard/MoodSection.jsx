// Diese Datei zeigt die Stimmungsauswahl und das Textfeld fuer Hinweise.
// Autor: Wilfred Feyem
import { moodOptions } from '../../../data/seedData'

export function MoodSection({
  currentSenior,
  actions,
  complaint,
  setComplaint,
  saveComplaint,
  isSavingComplaint,
  sosFeedback,
}) {
  const selectedMood = currentSenior.mood

  return (
    <>
      {/* Die Stimmungsbuttons gehoeren sichtbar zusammen. */}
      <section className="hero-summary mood-panel">
        <h2>wie geht’s dir heute ?</h2>
        <div className="mood-row">
          {moodOptions.map((mood) => (
            <button
              type="button"
              key={mood.key}
              className={`mood-chip ${selectedMood === mood.key ? `is-${mood.tone}` : ''}`}
              aria-pressed={selectedMood === mood.key}
              onClick={() => {
                void actions.setMood(mood.key)
              }}
            >
              <span aria-hidden="true">{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="complaint-panel">
        {/* Der SOS-Standardtext bleibt nur Platzhalter, damit man im Stress nichts loeschen muss. */}
        <label className="field-group complaint-field">
          <textarea
            className="complaint-box"
            placeholder="Beschwerde beschreiben...."
            value={complaint}
            onChange={(event) => setComplaint(event.target.value)}
            onBlur={() => {
              void saveComplaint()
            }}
            rows={4}
          />
        </label>

        {isSavingComplaint && <p className="status-line success">Hinweis wird gespeichert ...</p>}
        {sosFeedback && <p className={`status-line ${sosFeedback.tone}`}>{sosFeedback.text}</p>}
      </section>
    </>
  )
}
