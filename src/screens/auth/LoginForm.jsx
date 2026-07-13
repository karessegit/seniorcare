// Hier ist das Login-Formular.
// Autor: Wilfred Feyem
import { PasswordField } from './PasswordField'

export function LoginForm({
  loginForm,
  setLoginForm,
  showPassword,
  setShowPassword,
  busy,
  onSubmit,
  onFieldChange,
}) {
  const handleEmailChange = (event) => {
    onFieldChange?.()
    setLoginForm((current) => ({ ...current, email: event.target.value }))
  }

  const handlePasswordChange = (event) => {
    onFieldChange?.()
    setLoginForm((current) => ({ ...current, password: event.target.value }))
  }

  return (
    <form className="form-stack" onSubmit={onSubmit}>
      <label>
        <span>Email adresse</span>
        <input
          type="email"
          required
          value={loginForm.email}
          onChange={handleEmailChange}
          placeholder="john.doe@example.com"
        />
      </label>
      <PasswordField
        label="Password"
        value={loginForm.password}
        onChange={handlePasswordChange}
        placeholder=""
        visible={showPassword}
        onToggle={() => setShowPassword((current) => !current)}
        required
      />
      {/* TODO: Spaeter noch Passwort-zuruecksetzen einbauen. */}
      <button type="submit" className="button primary full-width" disabled={busy}>
        {busy ? 'Pruefen ...' : 'Anmelden'}
      </button>
    </form>
  )
}
