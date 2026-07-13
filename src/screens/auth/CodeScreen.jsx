// Hier wird nach der Registrierung der persoenliche Senior-Code angezeigt.
// Autor: Wilfred Feyem
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSeniorCare } from '../../context/SeniorCareContext'

export function CodeScreen() {
  const navigate = useNavigate()
  const { currentSenior } = useSeniorCare()
  const [copyState, setCopyState] = useState('idle')
  const code = currentSenior.profile.code

  const copyCode = async () => {
    await navigator.clipboard?.writeText(code)
    setCopyState('copied')
    window.setTimeout(() => setCopyState('idle'), 1600)
  }

  return (
    <div className="app-shell senior-auth">
      <div className="auth-layout">
        <div className="auth-card code-card">
          <div className="success-icon" aria-hidden="true">✓</div>
          <h2>erfolgreich erstellt!</h2>
          <h3>Dein persönlicher Code</h3>
          <div className={`code-display ${copyState === 'copied' ? 'is-copied' : ''}`}>
            <strong>{code}</strong>
            <button
              type="button"
              className="copy-code-button"
              onClick={copyCode}
              aria-live="polite"
            >
              {copyState === 'copied' ? '✓ kopiert!' : '⧉ kopieren'}
            </button>
          </div>
          <p className="share-note">💡 Teilen Sie diesen Code mit Ihrer Pflegeperson, damit sie Zugang zu Ihrer Akte erhält.</p>
          <button type="button" className="button primary full-width" onClick={() => navigate('/senior/home')}>
            Zum Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
