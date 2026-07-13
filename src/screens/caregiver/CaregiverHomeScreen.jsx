// Hier ist die Startseite fuer Caregiver.
// Autor: Karesse Tchoffo
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { toGermanErrorMessage } from '../../lib/userMessages'

function getSeniorStatusTone(senior) {
  if (senior.latestSos) return 'danger'
  if (senior.status === 'good') return 'good'
  if (senior.status === 'ok') return 'neutral'
  return 'danger'
}

export function CaregiverHomeScreen() {
  const navigate = useNavigate()
  const { currentCaregiver, actions } = useSeniorCare()
  const [code, setCode] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [linkStatus, setLinkStatus] = useState(null)
  const [isLinking, setIsLinking] = useState(false)
  const [isCodeShaking, setIsCodeShaking] = useState(false)
  const codeState = code.length === 0 ? 'idle' : code.length === 6 ? 'valid' : 'invalid'
  const activeAlerts = useMemo(
    () => currentCaregiver.seniors.filter((senior) => senior.latestSos),
    [currentCaregiver.seniors],
  )

  const triggerCodeShake = () => {
    setIsCodeShaking(false)
    window.setTimeout(() => setIsCodeShaking(true), 10)
    window.setTimeout(() => setIsCodeShaking(false), 420)
  }

  return (
    <div className="caregiver-screen">
      <header className="caregiver-header">
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
        <div>
          <h1>Guten Morgen,{currentCaregiver.name}</h1>
        </div>
      </header>

      <main className="caregiver-body">
        <section className="invite-card">
          <button
            type="button"
            className="button primary add-pill caregiver-add"
            onClick={() => setShowInviteForm((current) => !current)}
          >
            <span aria-hidden="true">＋</span>
            SeniorIn Hinzufügen
          </button>
          {showInviteForm && (
          <div className={`code-input-row invite-code-row ${codeState !== 'idle' ? `is-${codeState}` : ''} ${isCodeShaking ? 'is-shaking' : ''}`}>
            <input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, '').slice(0, 12))
                setLinkStatus(null)
              }}
              aria-invalid={codeState === 'invalid'}
              placeholder="z. B. 123456"
              inputMode="numeric"
            />
            <button
              type="button"
              className="button primary"
              disabled={isLinking}
              onClick={async () => {
                if (code.length !== 6) {
                  setLinkStatus({ tone: 'danger', text: 'Der Einladungscode muss genau 6 Ziffern enthalten.' })
                  triggerCodeShake()
                  return
                }

                setIsLinking(true)
                setLinkStatus(null)

                try {
                  const seniorId = await actions.addSeniorByCode(code)
                  setCode('')
                  setLinkStatus({ tone: 'success', text: 'Senior wurde erfolgreich verbunden.' })
                  if (seniorId) {
                    navigate(`/caregiver/seniors/${seniorId}`)
                  }
                } catch (error) {
                  setLinkStatus({ tone: 'danger', text: toGermanErrorMessage(error, 'Dieser Senior konnte nicht verbunden werden.') })
                } finally {
                  setIsLinking(false)
                }
              }}
            >
              {isLinking ? 'Verbinden ...' : 'Hinzufügen'}
            </button>
          </div>
          )}
          {linkStatus && <p className={`status-line ${linkStatus.tone}`}>{linkStatus.text}</p>}
        </section>

        {!!activeAlerts.length && (
          <section className="caregiver-alerts-section">
            {/* Wichtige Alarme stehen oben in einem eigenen Bereich. */}
            <h2 className="section-heading">Aktive Alarme</h2>
            <div className="stack-list">
              {activeAlerts.map((senior) => (
                <article key={`${senior.id}-${senior.latestSos?.id || 'alert'}`} className="list-card alert-card">
                  <div className="list-row">
                    <div>
                      <p className="item-title">
                        <span className="alert-icon" aria-hidden="true">⚠️</span>
                        SOS von {senior.firstName} {senior.lastName}
                      </p>
                      <p className="item-subtitle">{senior.latestSos?.time || 'Gerade eben'}</p>
                    </div>
                  </div>
                  <p className="item-note">{senior.latestSos?.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="caregiver-senior-section">
          {/* Die normale Senior-Liste ist klar von Alarmen getrennt. */}
          {/* Die Ueberschrift sagt direkt, was man hier auswaehlen soll. */}
          <div className="section-title">
            <h3>Wähle einen Senior</h3>
          </div>
          <div className="senior-list">
            {currentCaregiver.seniors.map((senior) => (
              <button
                type="button"
                className="senior-card"
                key={senior.code}
                onClick={async () => {
                  await actions.setSelectedSeniorId(senior.id)
                  navigate(`/caregiver/seniors/${senior.id}`)
                }}
              >
                <div className="avatar" aria-hidden="true">👤</div>
                <div className="senior-copy">
                  <strong>
                    {senior.firstName} {senior.lastName}
                  </strong>
                  <p className="senior-last-active">Zuletzt aktiv: {senior.lastActive || 'Gerade eben'}</p>
                </div>
                {/* Der farbige Punkt zeigt den Status schneller als nur Text. */}
                <div className="senior-meta">
                  <span className={`senior-status-dot ${getSeniorStatusTone(senior)}`} aria-hidden="true" />
                  <span className="senior-arrow" aria-hidden="true">&gt;</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
