// Hier sind die Layout-Bausteine wie Kopfbereich und Navigation.
// Autor: Wilfred Feyem
export function BackButton({ onClick, label = 'Zurück', className = 'back-link' }) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  )
}

// Dieser unsichtbare Platzhalter sorgt dafuer, dass der Kopfbereich
// auch ohne echten Zurueck-Button gleich aufgebaut bleibt.
function TopBarBackSlot({ onBack }) {
  if (onBack) {
    return <BackButton onClick={onBack} />
  }

  return <span className="back-link ghost-space" aria-hidden="true" />
}

export function TopBar({ title, subtitle, subtitleAction = null, action = null, onBack = null }) {
  return (
    <header className="top-bar">
      <div className="top-left">
        <TopBarBackSlot onBack={onBack} />
      </div>
      <div className="top-copy">
        {subtitleAction ? (
          <div className="top-meta">
            <p className="eyebrow">{subtitle}</p>
            <div className="top-meta-action">{subtitleAction}</div>
          </div>
        ) : (
          <p className="eyebrow">{subtitle}</p>
        )}
        <h2>{title}</h2>
      </div>
      <div className="top-right">{action}</div>
    </header>
  )
}

export function BottomNav({ active, items, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navigation">
      {items.map((item) => {
        const isActive = active === item.key

        return (
          // Icon und Text zusammen sind fuer Senioren schneller zu erkennen.
          <button
            type="button"
            key={item.key}
            className={isActive ? 'is-active' : ''}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate(item.path)}
          >
            {item.icon && <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
