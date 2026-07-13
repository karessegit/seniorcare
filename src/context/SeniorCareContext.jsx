/* eslint-disable react-refresh/only-export-components */
// Hier wird der gemeinsame Zustand der App gespeichert.
// Viele Aktionen fuer Supabase liegen auch hier, damit die Screens einfacher bleiben.
// Autor: Wilfred Feyem
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient'
import { seniorSeed, caregiverSeed } from '../data/seedData'
import { currentLastActiveLabel, currentTime } from '../lib/format'
import { getAssistantReply } from '../lib/assistant'
import { fetchCurrentUserBundle, realtimeTables, touchSeniorActivity, withTimeout } from './seniorCareApi'
import { buildExerciseKey, buildSignedOutState, buildSosPayload, toSnakeRole } from './seniorCareHelpers'

const initialState = {
  initializing: true,
  setupReady: hasSupabaseConfig,
  session: null,
  role: null,
  profile: null,
  caregiverSeniors: [],
  selectedSeniorId: null,
  currentSenior: seniorSeed,
  currentCaregiver: caregiverSeed,
  error: null,
}

const SeniorCareContext = createContext(null)

async function reloadSessionBundle(session, setState) {
  if (!session) {
    setState((current) => ({
      ...current,
      initializing: false,
      ...buildSignedOutState(),
    }))
    return null
  }

  const bundle = await fetchCurrentUserBundle(session)
  const currentSenior = bundle.currentSenior || seniorSeed
  const currentCaregiver = bundle.currentCaregiver || caregiverSeed

  setState((current) => ({
    ...current,
    initializing: false,
    setupReady: true,
    session,
    role: bundle.role,
    profile: bundle.profile,
    caregiverSeniors: bundle.caregiverSeniors || [],
    selectedSeniorId: bundle.selectedSeniorId,
    currentSenior,
    currentCaregiver,
    error: null,
  }))

  return bundle
}

export function SeniorCareProvider({ children }) {
  const [state, setState] = useState(initialState)
  const refreshInFlightRef = useRef(null)
  const refreshTimerRef = useRef(null)
  const lastActivityTouchRef = useRef(null)

  useEffect(() => {
    if (!supabase) {
      setState((current) => ({
        ...current,
        initializing: false,
        setupReady: false,
      }))
      return undefined
    }

    let active = true

    const initialize = async () => {
      try {
        // Beim Start warte ich zuerst auf Login-Daten und danach auf die User-Daten.
        // Sonst koennte die App kurz einen falschen Screen anzeigen.
        const { data } = await withTimeout(supabase.auth.getSession(), 2500, 'Timed out loading auth state')
        if (!active) return
        await withTimeout(reloadSessionBundle(data.session, setState), 5000, 'Timed out loading user data')
      } catch (error) {
        if (!active) return
      setState((current) => ({
        ...current,
        initializing: false,
        error: error?.message || 'Initialisierung fehlgeschlagen',
      }))
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      try {
        await withTimeout(reloadSessionBundle(session, setState), 5000, 'Timed out loading user data')
      } catch (error) {
        setState((current) => ({
          ...current,
          initializing: false,
          error: error?.message || 'Initialisierung fehlgeschlagen',
        }))
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!supabase) return null
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current
    }

    const pendingRefresh = (async () => {
      const { data } = await supabase.auth.getSession()
      return reloadSessionBundle(data.session, setState)
    })()

    refreshInFlightRef.current = pendingRefresh

    try {
      return await pendingRefresh
    } finally {
      refreshInFlightRef.current = null
    }
  }, [])

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) return

    // Realtime kann mehrere Events schnell hintereinander schicken.
    // Deshalb mache ich daraus nur einen Refresh.
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null
      void refresh()
    }, 150)
  }, [refresh])

  useEffect(() => {
    if (!supabase || !state.session?.user?.id) return undefined

    // Dieser Channel haelt Senior- und Caregiver-Ansichten synchron,
    // ohne dass man den Browser neu laden muss.
    const channel = supabase.channel(`live-sync:${state.session.user.id}`)

    realtimeTables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        scheduleRefresh()
      })
    })

    channel.subscribe()

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      void supabase.removeChannel(channel)
    }
  }, [scheduleRefresh, state.session?.user?.id])

  useEffect(() => {
    if (!supabase || !state.session?.user?.id) return undefined

    // Falls Realtime nicht richtig laeuft, prueft die App trotzdem regelmaessig neue Daten.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      void refresh()
    }, 2500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [refresh, state.session?.user?.id])

  useEffect(() => {
    if (!supabase || state.role !== 'senior' || !state.currentSenior?.seniorRow?.id) return undefined

    const seniorId = state.currentSenior.seniorRow.id

    const touch = () => {
      const minuteKey = new Date().toISOString().slice(0, 16)
      if (lastActivityTouchRef.current === minuteKey) return
      lastActivityTouchRef.current = minuteKey
      void touchSeniorActivity(seniorId)
    }

    // Der Caregiver sieht, wann der Senior zuletzt aktiv war.
    touch()
    const intervalId = window.setInterval(touch, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [state.currentSenior?.seniorRow?.id, state.role])

  const actions = useMemo(
    () => ({
      signIn: async (email, password) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return refresh()
      },
      signUp: async ({ email, password, role, firstName, lastName }) => {
        if (!supabase) throw new Error('Supabase is not configured')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: toSnakeRole(role),
              first_name: firstName,
              last_name: lastName,
            },
          },
        })
        if (error) throw error
        return refresh()
      },
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      },
      setSelectedSeniorId: async (selectedSeniorId) => {
        if (!supabase || !state.profile) return
        await supabase.from('profiles').update({ selected_senior_id: selectedSeniorId }).eq('id', state.profile.id)
        await refresh()
      },
      setMood: async (mood) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        await supabase
          .from('seniors')
          .update({ current_mood: mood, last_active: currentLastActiveLabel() })
          .eq('id', state.currentSenior.seniorRow.id)
        await refresh()
      },
      setComplaint: async (complaint) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        await supabase
          .from('seniors')
          .update({ complaint, last_active: currentLastActiveLabel() })
          .eq('id', state.currentSenior.seniorRow.id)
        await refresh()
      },
      sendSos: async (input = '') => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return null
        const now = currentTime()
        const seniorId = state.currentSenior.seniorRow.id
        const payload = buildSosPayload(input)

        const { error: updateError } = await supabase
          .from('seniors')
          .update({ complaint: payload.complaint, current_mood: 'bad', last_active: currentLastActiveLabel() })
          .eq('id', seniorId)
        if (updateError) throw updateError

        // Mit dem [SOS]-Praefix kann ich Notfaelle spaeter leichter vom normalen Chat trennen.
        const { error: messageError } = await supabase
          .from('assistant_messages')
          .insert({ senior_id: seniorId, text: payload.assistantText, is_me: true, time_label: now })
        if (messageError) throw messageError

        await refresh()

        return {
          message: payload.complaint,
          time: now,
        }
      },
      addMedication: async (form, editId = null) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const basePayload = {
          senior_id: state.currentSenior.seniorRow.id,
          name: form.name.trim(),
          amount: Number(form.amount) || 1,
          unit: form.unit.trim() || 'Tablette',
          time: form.time,
          notes: form.notes.trim(),
        }

        if (editId) {
          // Beim Bearbeiten soll der genommen/nicht genommen Status erhalten bleiben.
          const { error } = await supabase.from('medications').update(basePayload).eq('id', editId)
          if (error) throw error
        } else {
          const payload = { ...basePayload, taken: false }
          const { error } = await supabase.from('medications').insert(payload)
          if (error) throw error
        }

        await refresh()
      },
      deleteMedication: async (id) => {
        if (!supabase) return
        const { error } = await supabase.from('medications').delete().eq('id', id)
        if (error) throw error
        await refresh()
      },
      toggleMedicationTaken: async (id) => {
        if (!supabase) return
        // Das Medikament wird zuerst aus der Datenbank gelesen, damit der aktuelle Status umgedreht wird.
        const { data: med, error: fetchError } = await supabase.from('medications').select('*').eq('id', id).maybeSingle()
        if (fetchError) throw fetchError
        if (!med) return
        const { error } = await supabase.from('medications').update({ taken: !med.taken }).eq('id', id)
        if (error) throw error
        await refresh()
      },
      addAppointment: async (form, editId = null) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const payload = {
          senior_id: state.currentSenior.seniorRow.id,
          doctor: form.doctor.trim(),
          date: form.date,
          time: form.time,
          address: form.address.trim(),
        }

        if (editId) {
          const { error } = await supabase.from('appointments').update(payload).eq('id', editId)
          if (error) throw error
        } else {
          const { error } = await supabase.from('appointments').insert(payload)
          if (error) throw error
        }

        await refresh()
      },
      deleteAppointment: async (id) => {
        if (!supabase) return
        const { error } = await supabase.from('appointments').delete().eq('id', id)
        if (error) throw error
        await refresh()
      },
      toggleExerciseDone: async (exerciseId) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const exercise = state.currentSenior.exercises.find((item) => item.id === exerciseId)
        if (!exercise) return
        // Die Definition der Uebung ist vom Fortschritt des Seniors getrennt.
        // Deshalb suche ich zuerst die passende Fortschritts-Zeile.
        const { data: existing, error: fetchError } = await supabase
          .from('exercise_progress')
          .select('*')
          .eq('senior_id', state.currentSenior.seniorRow.id)
          .eq('exercise_key', exercise.key)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (existing) {
          const { error } = await supabase
            .from('exercise_progress')
            .update({ done: !existing.done })
            .eq('id', existing.id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('exercise_progress')
            .insert({ senior_id: state.currentSenior.seniorRow.id, exercise_key: exercise.key, done: true })
          if (error) throw error
        }

        await refresh()
      },
      addExercise: async (form, editId = null) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const currentExercise = editId ? state.currentSenior.exercises.find((item) => item.id === editId) : null
        const payload = {
          emoji: form.emoji?.trim() || '↕',
          name: form.name.trim(),
          duration: form.duration.trim(),
          level: form.level.trim(),
          description: form.description.trim(),
          steps: form.steps || [],
        }

        if (currentExercise) {
          // Beim Bearbeiten wird das Template geaendert, weil dort der Inhalt der Uebung gespeichert ist.
          const { error } = await supabase
            .from('exercise_templates')
            .update(payload)
            .eq('exercise_key', currentExercise.key)
          if (error) throw error
        } else {
          const exerciseKey = buildExerciseKey(payload.name)
          const sortOrder = Math.floor(Date.now() / 1000)
          // Neue Uebungen brauchen zuerst ein Template und danach einen Fortschritt fuer diesen Senior.
          const { error: templateError } = await supabase
            .from('exercise_templates')
            .insert({ ...payload, exercise_key: exerciseKey, sort_order: sortOrder })
          if (templateError) throw templateError

          const { error: progressError } = await supabase
            .from('exercise_progress')
            .insert({ senior_id: state.currentSenior.seniorRow.id, exercise_key: exerciseKey, done: false })
          if (progressError) throw progressError
        }

        await refresh()
      },
      deleteExercise: async (exerciseId) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const exercise = state.currentSenior.exercises.find((item) => item.id === exerciseId)
        if (!exercise) return

        // Loeschen soll bestaetigt werden, damit man eine Uebung nicht aus Versehen entfernt.
        const { error } = await supabase
          .from('exercise_progress')
          .delete()
          .eq('senior_id', state.currentSenior.seniorRow.id)
          .eq('exercise_key', exercise.key)
        if (error) throw error

        await refresh()
      },
      addAssistantMessage: async (input) => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const cleanText = input.trim()
        if (!cleanText) return
        const reply = getAssistantReply(cleanText, state.currentSenior)
        const now = currentTime()
        const seniorId = state.currentSenior.seniorRow.id

        const { error: userError } = await supabase
          .from('assistant_messages')
          .insert({ senior_id: seniorId, text: cleanText, is_me: true, time_label: now })
        if (userError) throw userError

        const { error: replyError } = await supabase
          .from('assistant_messages')
          .insert({ senior_id: seniorId, text: reply, is_me: false, time_label: now })
        if (replyError) throw replyError

        await refresh()
      },
      resetAssistant: async () => {
        if (!supabase || !state.currentSenior?.seniorRow?.id) return
        const seniorId = state.currentSenior.seniorRow.id
        const { error: deleteError } = await supabase.from('assistant_messages').delete().eq('senior_id', seniorId)
        if (deleteError) throw deleteError
        const { error: insertError } = await supabase
          .from('assistant_messages')
          .insert({ senior_id: seniorId, text: `Hallo, ${state.currentSenior.profile.firstName}! Wie kann ich dir heute helfen?`, is_me: false, time_label: currentTime() })
        if (insertError) throw insertError
        await refresh()
      },
      addSeniorByCode: async (code) => {
        if (!supabase) return
        const cleanCode = code.trim()
        if (!cleanCode) return
        // Die Datenbankfunktion prueft den Code und legt die Caregiver-Senior-Verbindung an.
        const { data, error } = await supabase.rpc('link_senior_by_code', { senior_code: cleanCode })
        if (error) throw error
        await refresh()
        return data
      },
      disconnectSenior: async (seniorId) => {
        if (!supabase || !state.profile || !seniorId) return

        const { data: caregiverRow, error: caregiverError } = await supabase
          .from('caregivers')
          .select('id')
          .eq('profile_id', state.profile.id)
          .maybeSingle()
        if (caregiverError) throw caregiverError
        if (!caregiverRow) throw new Error('Current user is not a caregiver')

        // Der Caregiver entfernt nur seine eigene Verbindung zu diesem Senior.
        const { error } = await supabase
          .from('caregiver_seniors')
          .delete()
          .eq('caregiver_id', caregiverRow.id)
          .eq('senior_id', seniorId)
        if (error) throw error

        const nextSeniorId = state.currentCaregiver.seniors.find((senior) => senior.id !== seniorId)?.id || null
        await supabase.from('profiles').update({ selected_senior_id: nextSeniorId }).eq('id', state.profile.id)
        await refresh()
        return nextSeniorId
      },
    }),
    [refresh, state.currentCaregiver.seniors, state.currentSenior, state.profile],
  )

  const value = useMemo(() => {
    const role = state.role
    return {
      state,
      isReady: !state.initializing,
      setupReady: state.setupReady,
      isAuthenticated: Boolean(state.session),
      role,
      profile: state.profile,
      currentSenior: state.currentSenior,
      currentCaregiver: state.currentCaregiver,
      caregiverSeniors: state.caregiverSeniors,
      selectedSeniorId: state.selectedSeniorId,
      session: state.session,
      error: state.error,
      actions,
    }
  }, [actions, state])

  return <SeniorCareContext.Provider value={value}>{children}</SeniorCareContext.Provider>
}

export function useSeniorCare() {
  const context = useContext(SeniorCareContext)
  if (!context) {
    throw new Error('useSeniorCare must be used within SeniorCareProvider')
  }
  return context
}
