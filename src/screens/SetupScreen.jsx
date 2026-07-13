// Diese Datei zeigt Hinweise, wenn Supabase nicht eingerichtet ist.
// Autor: Wilfred Feyem
export function SetupScreen() {
  return (
    <div className="app-shell">
      <div className="hero-panel setup-panel">
        <p className="eyebrow">SeniorCare+</p>
        <h2>Supabase ist noch nicht konfiguriert</h2>
        <p className="lead">
          Erstelle zuerst dein Supabase-Projekt und trage dann die Umgebungsvariablen in `.env.local` ein.
        </p>
        <div className="setup-block">
          <code>VITE_SUPABASE_URL=...</code>
          <code>VITE_SUPABASE_PUBLISHABLE_KEY=...</code>
        </div>
        <p className="lead compact">
          Fuehre danach das SQL aus `supabase/schema.sql` aus und melde dich mit deinem Konto an.
        </p>
      </div>
    </div>
  )
}
