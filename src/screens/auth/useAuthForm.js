// Hier wird der Zustand vom Login- und Registrierungsformular verwaltet.
// Autor: Wilfred Feyem
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSeniorCare } from '../../context/SeniorCareContext'
import { toGermanErrorMessage } from '../../lib/userMessages'
import { doPasswordsMatch, isPasswordTooShort, isSignupDisabledError, isSignupFormComplete } from './authValidators'

export function useAuthForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, actions } = useSeniorCare()
  const hasRoleFromUrl = searchParams.get('role') === 'caregiver' || searchParams.get('role') === 'senior'
  const defaultRole = searchParams.get('role') === 'caregiver' ? 'caregiver' : 'senior'
  const defaultMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState(defaultMode)
  const [signupStep, setSignupStep] = useState(defaultMode === 'signup' && hasRoleFromUrl ? 3 : defaultMode === 'signup' ? 2 : 1)
  const [selectedRole, setSelectedRole] = useState(defaultRole)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [signupBlocked, setSignupBlocked] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false)

  const passwordTooShort = isPasswordTooShort(signupForm.password)
  const passwordsMatch = doPasswordsMatch(signupForm)
  const signupFormComplete = isSignupFormComplete(signupForm)

  const roleHint = useMemo(
    () =>
      selectedRole === 'senior'
        ? 'Meine Gesundheit verwalten'
        : 'Meine Senioren begleiten',
    [selectedRole],
  )

  const roleLabel = selectedRole === 'caregiver' ? 'Care giver' : 'Senior'

  const selectMode = (nextMode) => {
    setError('')
    setSignupBlocked(false)
    setMode(nextMode)
    setSignupStep(nextMode === 'signup' ? 3 : 1)
  }

  const goBack = () => {
    setError('')
    if (mode === 'signup' && signupStep === 3) {
      setMode('login')
      setSignupStep(1)
      return
    }

    navigate('/welcome')
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const bundle = await actions.signIn(loginForm.email, loginForm.password)
      navigate(bundle?.role === 'caregiver' ? '/caregiver/home' : '/senior/home')
    } catch (loginError) {
      setError(toGermanErrorMessage(loginError, 'Anmeldung fehlgeschlagen.'))
    } finally {
      setBusy(false)
    }
  }

  const submitSignup = async (event) => {
    event.preventDefault()
    if (!signupFormComplete || busy) return

    setBusy(true)
    setError('')
    setSignupBlocked(false)

    // Erst pruefe ich das Passwort, dann wird Supabase aufgerufen.
    if (passwordTooShort) {
      setBusy(false)
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.')
      return
    }

    if (!passwordsMatch) {
      setBusy(false)
      setError('Die Passwoerter stimmen nicht ueberein.')
      return
    }

    try {
      const bundle = await actions.signUp({
        role: selectedRole,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        email: signupForm.email,
        password: signupForm.password,
      })

      // TODO: Caregiver erst speichern, wenn ein gueltiger Senior-Code eingegeben wurde.
      if (!bundle) {
        setError('Das Konto wurde erstellt, aber es ist keine Sitzung verfuegbar. Deaktiviere die E-Mail-Bestaetigung in Supabase fuer den ersten Login.')
        return
      }

      navigate(selectedRole === 'caregiver' ? '/caregiver/home' : '/code')
    } catch (signupError) {
      if (isSignupDisabledError(signupError)) {
        setSignupBlocked(true)
        setError(
          'Registrierungen sind in Supabase deaktiviert. Aktiviere Authentication > Providers > Email > Allow new users to sign up oder nutze ein bestehendes Konto.',
        )
        setMode('login')
        return
      }
      setError(toGermanErrorMessage(signupError, 'Registrierung fehlgeschlagen.'))
    } finally {
      setBusy(false)
    }
  }

  return {
    isAuthenticated,
    mode,
    signupStep,
    selectedRole,
    setSelectedRole,
    setSignupStep,
    loginForm,
    setLoginForm,
    signupForm,
    setSignupForm,
    error,
    setError,
    busy,
    signupBlocked,
    setSignupBlocked,
    showLoginPassword,
    setShowLoginPassword,
    showSignupPassword,
    setShowSignupPassword,
    showSignupConfirmPassword,
    setShowSignupConfirmPassword,
    passwordTooShort,
    passwordsMatch,
    signupFormComplete,
    roleHint,
    roleLabel,
    selectMode,
    goBack,
    submitLogin,
    submitSignup,
  }
}
