// Diese Datei zeigt das Dashboard fuer Senioren.
// Autor: Wilfred Feyem
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/ui'
import { navigation } from '../../data/seedData'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { MoodSection } from './dashboard/MoodSection'
import { SosSection } from './dashboard/SosSection'
import { useSosState } from './dashboard/useSosState'

export function SeniorDashboardScreen() {
  const navigate = useNavigate()
  const { currentSenior, actions } = useSeniorCare()
  const [showCode, setShowCode] = useState(false)
  const sos = useSosState(currentSenior, actions)
  const code = currentSenior.profile.code

  const toggleCode = () => {
    setShowCode((current) => !current)
  }

  return (
    <div className="screen senior-screen">
      <header className="mobile-header dashboard-header">
        <span className="weather-mark" aria-hidden="true">🌤️</span>
        <h1>Hallo, {currentSenior.profile.firstName}</h1>
        <button
          type="button"
          className="mini-action logout-action"
          onClick={async () => {
            await actions.signOut()
            navigate('/auth', { replace: true })
          }}
        >
          Abmelden
        </button>
      </header>

      <main className="screen-body">
        <section className="share-code-card">
          <span className="share-icon" aria-hidden="true">↗</span>
          <div>
            <h2>Mein Code</h2>
            <p>Teile diesen Code mit deiner Pflegeperson</p>
          </div>
          <button
            type="button"
            className={`code-mini-card code-inline-card ${showCode ? 'is-revealed' : ''}`}
            onClick={toggleCode}
            aria-pressed={showCode}
            aria-label={showCode ? 'Senior-Code ausblenden' : 'Senior-Code anzeigen'}
          >
            <span className="code-mini-face code-mini-front">
              <strong>Code</strong>
            </span>
            <span className="code-mini-face code-mini-back">
              <strong>{code}</strong>
            </span>
          </button>
        </section>

        <MoodSection
          currentSenior={currentSenior}
          actions={actions}
          complaint={sos.complaint}
          setComplaint={sos.setComplaint}
          saveComplaint={sos.saveComplaint}
          isSavingComplaint={sos.isSavingComplaint}
          sosFeedback={sos.sosFeedback}
        />

        <SosSection
          sosState={sos.sosState}
          sosSecondsLeft={sos.sosSecondsLeft}
          startSosCountdown={sos.startSosCountdown}
          cancelSosCountdown={sos.cancelSosCountdown}
        />
      </main>

      <BottomNav active="home" items={navigation} onNavigate={(path) => navigate(path)} />
    </div>
  )
}
