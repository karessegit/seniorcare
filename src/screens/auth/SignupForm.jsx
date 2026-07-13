// Hier ist das Formular zum Registrieren.
// Autor: Wilfred Feyem
import { PasswordField } from './PasswordField'

export function SignupForm({
  signupForm,
  setSignupForm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordTooShort,
  passwordsMatch,
  signupFormComplete,
  selectedRole,
  busy,
  onSubmit,
  onFieldChange,
}) {
  const isCaregiver = selectedRole === 'caregiver'
  const hasStartedSignup = Boolean(
    signupForm.firstName.trim() ||
      signupForm.lastName.trim() ||
      signupForm.email.trim() ||
      signupForm.password ||
      signupForm.confirmPassword,
  )

  return (
    <form className="form-stack" onSubmit={onSubmit}>
      {/* Der Account kann erst erstellt werden, wenn die Pflichtfelder passen. */}
      <label>
        <span>Vorname</span>
        <input
          required
          value={signupForm.firstName}
          onChange={(event) => {
            onFieldChange?.()
            setSignupForm((current) => ({ ...current, firstName: event.target.value }))
          }}
          placeholder={isCaregiver ? 'Lili' : 'Marie'}
        />
      </label>
      <label>
        <span>Nachname</span>
        <input
          required
          value={signupForm.lastName}
          onChange={(event) => {
            onFieldChange?.()
            setSignupForm((current) => ({ ...current, lastName: event.target.value }))
          }}
          placeholder="Carter"
        />
      </label>
      <label>
        <span>Email adresse</span>
        <input
          type="email"
          required
          value={signupForm.email}
          onChange={(event) => {
            onFieldChange?.()
            setSignupForm((current) => ({ ...current, email: event.target.value }))
          }}
          placeholder="john.doe@example.com"
        />
      </label>
      <PasswordField
        label="Password"
        value={signupForm.password}
        onChange={(event) => {
          onFieldChange?.()
          setSignupForm((current) => ({ ...current, password: event.target.value }))
        }}
        placeholder=""
        visible={showPassword}
        onToggle={() => setShowPassword((current) => !current)}
        minLength={6}
        required
      />

      <PasswordField
        label="Confirm password"
        value={signupForm.confirmPassword}
        onChange={(event) => {
          onFieldChange?.()
          setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))
        }}
        placeholder=""
        visible={showConfirmPassword}
        onToggle={() => setShowConfirmPassword((current) => !current)}
        required
      />

      {/* Zu kurze Passwoerter werden vorher erklaert, nicht erst nach dem Absenden. */}
      {passwordTooShort && <p className="form-helper danger">Das Passwort muss mindestens 6 Zeichen lang sein.</p>}
      {!passwordTooShort && !passwordsMatch && signupForm.confirmPassword && (
        <p className="form-helper danger">Die Passwoerter stimmen nicht ueberein.</p>
      )}
      {!signupFormComplete && !passwordTooShort && hasStartedSignup && (
        <p className="form-helper danger">Bitte fuelle alle Felder aus.</p>
      )}
      <button type="submit" className="button primary full-width" disabled={busy || !signupFormComplete}>
        {busy ? 'Erstellen ...' : isCaregiver ? 'Konto Erstellen' : 'erstellen'}
      </button>
    </form>
  )
}
