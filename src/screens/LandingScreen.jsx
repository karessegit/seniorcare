// Hier ist der erste Screen fuer neue Nutzer.
// Autor: Wilfred Feyem
import { useNavigate } from 'react-router-dom'
import { roleCards } from '../data/seedData'
import { useSeniorCare } from '../context/SeniorCareContext'

export function LandingScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useSeniorCare()
  const homePath = role === 'caregiver' ? '/caregiver/home' : '/senior/home'

  return (
    <div className="app-shell">
      <div className="landing">
        <div className="hero-panel">
          <div className="brand-heart" aria-hidden="true">
            ♡
          </div>
          <h1 className="brand-title">Senior<span>Care</span>+</h1>
          <h2 className="role-question">Wer sind Sie ?</h2>

          <div className="role-grid">
            {roleCards.map((card) => (
              <button
                type="button"
                key={card.key}
                className={`role-card ${card.key === 'caregiver' ? 'caregiver-role' : 'senior-role'} ${role === card.key ? 'is-active' : ''}`}
                onClick={() => navigate(`/auth?mode=login&role=${card.key}`)}
                style={{ '--card-accent': card.accent }}
              >
                <span className="role-icon" aria-hidden="true">{card.key === 'caregiver' ? '👥' : '👤'}</span>
                <span className="role-chip">{card.title}</span>
                <span className="role-desc">{card.description}</span>
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <div className="landing-actions">
              <button type="button" className="button secondary" onClick={() => navigate(homePath)}>
                Zur App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
