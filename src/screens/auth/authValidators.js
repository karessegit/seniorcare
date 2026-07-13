// Hier werden die Eingaben von Login und Registrierung geprueft.
// Autor: Wilfred Feyem
export function isPasswordTooShort(password) {
  return password.length > 0 && password.length < 6
}

export function doPasswordsMatch(form) {
  if (!form.confirmPassword) return true
  return form.password === form.confirmPassword
}

export function isEmailFormatValid(email) {
  if (!email.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isSignupFormComplete(form) {
  return (
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    isEmailFormatValid(form.email) &&
    form.password.length >= 6 &&
    doPasswordsMatch(form)
  )
}

export function isSignupDisabledError(error) {
  return /signups are disabled/i.test(error?.message || '')
}
