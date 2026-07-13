// Diese Datei enthaelt einfache Anzeige-Komponenten.
// Autor: Wilfred Feyem
export function CardTitle({ title, subtitle }) {
  return (
    <div className="section-title">
      <p className="eyebrow">{title}</p>
      <h3>{subtitle}</h3>
    </div>
  )
}

export function SmallCard({ title, value, detail }) {
  return (
    <article className="small-card">
      <p>{title}</p>
      <strong>{value}</strong>
      {detail ? <span>{detail}</span> : null}
    </article>
  )
}

export function EmptyState({ title }) {
  return (
    <div className="empty-card" role="status">
      <p>{title}</p>
    </div>
  )
}

export function Typography({ as: Tag = 'p', variant = 'base', className = '', children, ...props }) {
  const classNames = ['typography', `typography-${variant}`, className].filter(Boolean).join(' ')

  return (
    <Tag className={classNames} {...props}>
      {children}
    </Tag>
  )
}
