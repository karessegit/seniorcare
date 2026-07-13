// Hier ist der einfache Assistenten-Chat.
// Autor: Wilfred Feyem
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../../components/ui'
import { navigation } from '../../data/seedData'
import { useSeniorCare } from '../../context/SeniorCareContext'

const fakeVoicePrompts = [
  'Bitte Medikamente fuer heute anzeigen.',
  'Bitte Hilfe anzeigen.',
  'Bitte naechsten Termin erinnern.',
]

export function AssistantScreen() {
  const navigate = useNavigate()
  const { currentSenior, actions } = useSeniorCare()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingHint, setRecordingHint] = useState('Tippe auf das Mikrofon fuer eine Sprachsimulation.')
  const recordingTimerRef = useRef(null)
  const recordingPromptIndexRef = useRef(0)
  const messageListRef = useRef(null)

  useEffect(() => () => {
    if (recordingTimerRef.current) {
      // Timer beim Verlassen des Screens stoppen, sonst laeuft er im Hintergrund weiter.
      window.clearInterval(recordingTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const list = messageListRef.current
    if (!list) return
    // Neue Nachrichten sollen direkt sichtbar sein.
    list.scrollTop = list.scrollHeight
  }, [currentSenior.assistantMessages])

  const sendMessage = async () => {
    const cleanText = input.trim()
    if (!cleanText || isSending) return

    setIsSending(true)

    try {
      await actions.addAssistantMessage(cleanText)
      setInput('')
    } finally {
      setIsSending(false)
    }
  }

  const toggleFakeRecording = () => {
    if (isRecording) {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current)
      }
      recordingTimerRef.current = null
      setIsRecording(false)
      setRecordingHint('Sprachaufnahme gestoppt.')
      return
    }

    const prompt = fakeVoicePrompts[recordingPromptIndexRef.current % fakeVoicePrompts.length]
    recordingPromptIndexRef.current += 1
    let visibleLength = 0

    setInput('')
    setIsRecording(true)
    setRecordingHint('Aufnahme laeuft...')

    recordingTimerRef.current = window.setInterval(() => {
      visibleLength += 1
      // Die Spracheingabe ist hier nur simuliert und schreibt den Text schrittweise ins Feld.
      setInput(prompt.slice(0, visibleLength))

      if (visibleLength >= prompt.length) {
        window.clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
        setIsRecording(false)
        setRecordingHint('Sprachaufnahme abgeschlossen. Du kannst jetzt senden.')
      }
    }, 45)
  }

  return (
    <div className="screen senior-screen">
      <header className="mobile-header page-title-row">
        <span className="title-icon chat-icon" aria-hidden="true">💬</span>
        <h1>Assistant</h1>
      </header>

      <main className="screen-body">
        <section className="assistant-panel">
          <div ref={messageListRef} className="message-list" aria-live="polite">
            {currentSenior.assistantMessages.map((message) => (
              <div key={message.id} className={`message-bubble ${message.isMe ? 'me' : 'bot'}`}>
                <p>{message.text}</p>
                <span>{message.time}</span>
              </div>
            ))}
          </div>

          <p className={`assistant-hint ${isRecording ? 'is-live' : ''}`}>{recordingHint}</p>

          <div className={`assistant-input-row ${isRecording ? 'is-recording' : ''} ${isSending ? 'is-sending' : ''}`}>
            <button
              type="button"
              className={`mic-button ${isRecording ? 'is-recording' : ''}`}
              aria-label={isRecording ? 'Aufnahme stoppen' : 'Mikrofon'}
              aria-pressed={isRecording}
              onClick={toggleFakeRecording}
            >
              🎙
            </button>
            <input
              id="assistant-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void sendMessage()
                }
              }}
              placeholder="Nachricht an den Assistenten..."
            />
            <button
              type="button"
              className={`send-button ${input.trim() ? 'is-ready' : ''} ${isSending ? 'is-sending' : ''}`}
              aria-label="Nachricht senden"
              disabled={!input.trim() || isSending}
              onClick={() => {
                void sendMessage()
              }}
            >
              {isSending ? '…' : '▶'}
            </button>
          </div>

          <button type="button" className="button ghost full-width reset-chat-button" onClick={() => actions.resetAssistant()}>
            Unterhaltung zuruecksetzen
          </button>
        </section>
      </main>

      <BottomNav active="assistant" items={navigation} onNavigate={(path) => navigate(path)} />
    </div>
  )
}
