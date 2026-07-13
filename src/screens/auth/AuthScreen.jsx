// Hier werden Login und Registrierung zusammengebaut.
// Autor: Wilfred Feyem
import { BackButton } from '../../components/ui'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { useAuthForm } from './useAuthForm'

export function AuthScreen() {
  const auth = useAuthForm()

  if (auth.isAuthenticated) {
    return null
  }

  const isCaregiver = auth.selectedRole === 'caregiver'
  const authThemeClass = isCaregiver ? 'caregiver-auth' : 'senior-auth'

  return (
    <div className={`app-shell ${authThemeClass}`}>
      <div className="auth-layout">
        <div className="auth-card">
          {/* In jedem Schritt gibt es sichtbar einen Weg zurueck. */}
          <BackButton onClick={auth.goBack} />

          <div className="auth-header">
            <span className="auth-role-icon" aria-hidden="true">{isCaregiver ? '👥' : '👤'}</span>
            <h2>{auth.mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</h2>
            {auth.signupBlocked && (
              <p className="status-line warning">
                Registrierungen sind derzeit deaktiviert. Wechsle zur Anmeldung oder aktiviere Sign-ups in Supabase.
              </p>
            )}
          </div>

          {/* Der Fortschritt zeigt, wo man in der Registrierung steht. */}



          {auth.error && <p className="status-line danger">{auth.error}</p>}

          {auth.mode === 'login' ? (
            <LoginForm
              loginForm={auth.loginForm}
              setLoginForm={auth.setLoginForm}
              showPassword={auth.showLoginPassword}
              setShowPassword={auth.setShowLoginPassword}
              busy={auth.busy}
              onSubmit={auth.submitLogin}
              onFieldChange={() => auth.setError('')}
            />
          ) : (
            auth.signupStep === 3 && (
              <SignupForm
                signupForm={auth.signupForm}
                setSignupForm={auth.setSignupForm}
                showPassword={auth.showSignupPassword}
                setShowPassword={auth.setShowSignupPassword}
                showConfirmPassword={auth.showSignupConfirmPassword}
                setShowConfirmPassword={auth.setShowSignupConfirmPassword}
                passwordTooShort={auth.passwordTooShort}
                passwordsMatch={auth.passwordsMatch}
                signupFormComplete={auth.signupFormComplete}
                selectedRole={auth.selectedRole}
                busy={auth.busy}
                onSubmit={auth.submitSignup}
                onFieldChange={() => auth.setError('')}
              />
            )
          )}

          {auth.mode === 'login' && (
            <div className="auth-footer-note">
              <span>Noch kein Konto?</span>
              <button
                type="button"
                className="text-link-button"
                onClick={() => {
                  auth.setError('')
                  auth.setSignupBlocked(false)
                  auth.selectMode('signup')
                }}
              >
                Jetzt registrieren
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
