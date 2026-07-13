// Diese Datei enthaelt die Tailwind Einstellungen.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        base: ['18px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.5' }],
        xl: ['26px', { lineHeight: '1.3', fontWeight: '700' }],
        sos: ['24px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.02em' }],
      },
    },
  },
}
