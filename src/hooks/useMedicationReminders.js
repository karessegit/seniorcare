// Reminder-Logik fuer Medikamente und Termine.
// Autor: Wilfred Feyem
import { useCallback, useEffect, useMemo, useState } from 'react'

const SENT_PREFIX = 'seniorcare.reminders.sent'
let unlockedAudioContext = null

// Der Browser kann Benachrichtigungen nur anzeigen, wenn die Funktion existiert
// und der Nutzer spaeter auch die Erlaubnis gibt.
function supportsNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null

  if (!unlockedAudioContext || unlockedAudioContext.state === 'closed') {
    unlockedAudioContext = new AudioContext()
  }

  return unlockedAudioContext
}

// Fuer localStorage brauche ich stabile Schluessel pro Tag.
// Sonst wuerde eine Erinnerung nach jedem Refresh wieder neu kommen.
function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function currentTimeKey(date = new Date()) {
  return date.toTimeString().slice(0, 5)
}

function parseLocalDateTime(date, time) {
  if (!date || !time) return null
  const parsed = new Date(`${date}T${time}:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function sentKey(type, item, extra = '') {
  return `${SENT_PREFIX}.${type}.${todayKey()}.${item.id}.${item.time}${extra ? `.${extra}` : ''}`
}

// Der Ton wird direkt im Browser erzeugt, damit keine extra Audio-Datei gebraucht wird.
function playAlarmTone() {
  const audioContext = getAudioContext()
  if (!audioContext) return

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  const gain = audioContext.createGain()
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.32, audioContext.currentTime + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 3.2)
  gain.connect(audioContext.destination)

  ;[0, 0.75, 1.5, 2.25].forEach((offset) => {
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + offset)
    oscillator.connect(gain)
    oscillator.start(audioContext.currentTime + offset)
    oscillator.stop(audioContext.currentTime + offset + 0.45)
  })
}

function speakReminder(text) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  // Zuerst wird nach bekannten deutschen Stimmen gesucht, sonst wird eine beliebige deutsche Stimme genommen.
  const preferredVoice = voices.find((voice) => /katja|anna|amelie|petra|google deutsch/i.test(voice.name))
    || voices.find((voice) => voice.lang?.toLowerCase().startsWith('de'))

  utterance.lang = 'de-DE'
  if (preferredVoice) {
    utterance.voice = preferredVoice
  }
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1
  window.speechSynthesis.speak(utterance)
}

function notify(title, body, tag) {
  if (!supportsNotifications() || Notification.permission !== 'granted') return

  new Notification(title, {
    body,
    tag,
    requireInteraction: true,
  })
}

function setupRemindersOnFirstInteraction() {
  const prepareReminders = () => {
    const audioContext = getAudioContext()
    if (audioContext?.state === 'suspended') {
      void audioContext.resume()
    }

    if (supportsNotifications() && Notification.permission === 'default') {
      void Notification.requestPermission()
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // Viele Browser erlauben Audio erst nach einer echten Nutzeraktion.
  // Deshalb wird alles beim ersten Klick oder Tastendruck vorbereitet.
  window.addEventListener('pointerdown', prepareReminders, { once: true })
  window.addEventListener('keydown', prepareReminders, { once: true })

  return () => {
    window.removeEventListener('pointerdown', prepareReminders)
    window.removeEventListener('keydown', prepareReminders)
  }
}

function triggerMedicationReminder(medication, showReminder) {
  const key = sentKey('medication', medication)
  if (localStorage.getItem(key)) return

  const title = `Medikament: ${medication.name}`
  const message = medication.notes || 'Es ist Zeit fuer dein Medikament.'

  localStorage.setItem(key, 'true')
  // Bei einer Erinnerung gibt es drei Signale: Ton, Sprache und sichtbare Meldung.
  playAlarmTone()
  speakReminder(`${title}. ${message}. Uhrzeit: ${medication.time}.`)
  showReminder({
    type: 'medication',
    item: medication,
    title,
    message,
  })
  notify(title, message, `medication-${medication.id}-${todayKey()}`)
}

function triggerAppointmentReminder(appointment, showReminder) {
  const key = sentKey('appointment', appointment, appointment.date)
  if (localStorage.getItem(key)) return

  const title = `Termin in einer Stunde: ${appointment.doctor}`
  const message = appointment.address || `Der Termin ist um ${appointment.time}.`

  localStorage.setItem(key, 'true')
  playAlarmTone()
  speakReminder(`${title}. ${message}. Termin: ${appointment.date} um ${appointment.time}.`)
  showReminder({
    type: 'appointment',
    item: appointment,
    title,
    message,
  })
  notify(title, message, `appointment-${appointment.id}-${appointment.date}-${appointment.time}`)
}

function checkMedicationReminders(medications, now, showReminder) {
  const currentTime = currentTimeKey(now)

  medications
    .filter((medication) => !medication.taken && medication.time === currentTime)
    .forEach((medication) => triggerMedicationReminder(medication, showReminder))
}

function checkAppointmentReminders(appointments, now, showReminder) {
  appointments.forEach((appointment) => {
    const appointmentDate = parseLocalDateTime(appointment.date, appointment.time)
    if (!appointmentDate) return

    // Termine werden eine Stunde vorher gemeldet.
    const reminderTime = appointmentDate.getTime() - 60 * 60 * 1000
    const nowTime = now.getTime()

    if (nowTime >= reminderTime && nowTime < appointmentDate.getTime()) {
      triggerAppointmentReminder(appointment, showReminder)
    }
  })
}

export function useMedicationReminders({ role, currentSenior }) {
  const [activeReminder, setActiveReminder] = useState(null)
  const medications = useMemo(() => currentSenior?.meds || [], [currentSenior?.meds])
  const appointments = useMemo(() => currentSenior?.appointments || [], [currentSenior?.appointments])
  const dismissReminder = useCallback(() => setActiveReminder(null), [])

  useEffect(() => {
    if (role !== 'senior') return undefined
    return setupRemindersOnFirstInteraction()
  }, [role])

  useEffect(() => {
    if (role !== 'senior') return undefined

    const checkReminders = () => {
      const now = new Date()
      checkMedicationReminders(medications, now, setActiveReminder)
      checkAppointmentReminders(appointments, now, setActiveReminder)
    }

    checkReminders()
    // Zehn Sekunden sind hier genau genug und trotzdem nicht zu viel Arbeit fuer den Browser.
    const intervalId = window.setInterval(checkReminders, 10000)

    return () => window.clearInterval(intervalId)
  }, [appointments, medications, role])

  return { activeReminder, dismissReminder }
}
