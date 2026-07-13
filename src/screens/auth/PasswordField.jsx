// Hier ist ein Passwortfeld mit Anzeigen-Button.
// Autor: Wilfred Feyem
export function PasswordField({ label, value, onChange, placeholder, visible, onToggle, ...inputProps }) {
  return (
    <label className="password-field">
      <span>{label}</span>
      <div className="password-input-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...inputProps}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onToggle}
          aria-label={visible ? 'Passwort ausblenden' : 'Passwort anzeigen'}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>
    </label>
  )
}
