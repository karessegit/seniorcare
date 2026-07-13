// Hier waehlt man bei der Registrierung die Rolle aus.
// Autor: Wilfred Feyem
import { roleCards } from '../../data/seedData'

export function RoleSelectionStep({ selectedRole, setSelectedRole, roleHint, roleLabel, onNext }) {
  return (
    <div className="auth-role-section">
      <div className="auth-section-copy">
        <p className="auth-section-label">Wer sind Sie ?</p>
        <p className="helper-copy">{roleHint}</p>
      </div>

      <div className="auth-role-grid">
        {roleCards.map((card) => (
          // Die gewaehlte Rolle sieht deutlich aktiv aus.
          <button
            type="button"
            key={card.key}
            className={`auth-role-card ${selectedRole === card.key ? 'is-active' : ''}`}
            onClick={() => setSelectedRole(card.key)}
            style={{ '--card-accent': card.accent }}
          >
            <span className="role-check" aria-hidden="true">{selectedRole === card.key ? '✓' : ''}</span>
            <span className="role-chip">{card.title}</span>
            <span className="role-desc">{card.description}</span>
          </button>
        ))}
      </div>

      <p className="status-line">
        Gewählter Bereich: <strong>{roleLabel}</strong>
      </p>
      <button type="button" className="button primary full-width" onClick={onNext}>
        Weiter
      </button>
    </div>
  )
}
