// Hier wird der SOS-Zustand mit Countdown und Notiz verwaltet.
// Autor: Wilfred Feyem
import { useEffect, useState } from 'react'
import { toGermanErrorMessage } from '../../../lib/userMessages'
import { DEFAULT_SOS_MESSAGE, isDefaultSosMessage } from '../../../lib/sos'

export const SOS_COUNTDOWN_SECONDS = 3

function toEditableComplaint(value) {
  return isDefaultSosMessage(value) ? '' : value || ''
}

export function useSosState(currentSenior, actions) {
  const [complaint, setComplaint] = useState(toEditableComplaint(currentSenior.complaint))
  const [isSavingComplaint, setIsSavingComplaint] = useState(false)
  const [sosState, setSosState] = useState('idle')
  const [sosSecondsLeft, setSosSecondsLeft] = useState(SOS_COUNTDOWN_SECONDS)
  const [sosFeedback, setSosFeedback] = useState(null)

  useEffect(() => {
    if (sosState !== 'countdown') return undefined

    if (sosSecondsLeft === 0) {
      // Der Countdown gibt noch kurz Zeit, falls man aus Versehen gedrueckt hat.
      const send = async () => {
        setSosState('sending')
        try {
          await actions.sendSos(complaint)
          setComplaint('')
          await actions.setComplaint('')
          setSosFeedback({ tone: 'success', text: 'SOS wurde erfolgreich gesendet. Dein Caregiver wurde benachrichtigt.' })
          setSosState('sent')
          window.setTimeout(() => {
            setSosFeedback(null)
            setSosState('idle')
            setSosSecondsLeft(SOS_COUNTDOWN_SECONDS)
          }, 2500)
        } catch (error) {
          setSosFeedback({ tone: 'danger', text: toGermanErrorMessage(error, 'SOS kann derzeit nicht gesendet werden.') })
          setSosState('idle')
          setSosSecondsLeft(SOS_COUNTDOWN_SECONDS)
        }
      }

      void send()
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setSosSecondsLeft((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [actions, complaint, sosSecondsLeft, sosState])

  const saveComplaint = async () => {
    const nextComplaint = complaint.trim()
    const currentComplaint = (currentSenior.complaint || '').trim()
    if (nextComplaint === currentComplaint) return

    setIsSavingComplaint(true)
    try {
      await actions.setComplaint(nextComplaint)
    } finally {
      setIsSavingComplaint(false)
    }
  }

  const startSosCountdown = async () => {
    setSosFeedback(null)
    await saveComplaint()
    setSosSecondsLeft(SOS_COUNTDOWN_SECONDS)
    setSosState('countdown')
  }

  const cancelSosCountdown = () => {
    setSosState('idle')
    setSosSecondsLeft(SOS_COUNTDOWN_SECONDS)
    setSosFeedback({ tone: 'success', text: 'SOS wurde vor dem Senden abgebrochen.' })
  }

  return {
    complaint,
    setComplaint,
    isSavingComplaint,
    sosState,
    sosSecondsLeft,
    sosFeedback,
    saveComplaint,
    startSosCountdown,
    cancelSosCountdown,
  }
}

export { DEFAULT_SOS_MESSAGE }
