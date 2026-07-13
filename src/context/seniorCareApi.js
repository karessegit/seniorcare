// Hier werden die Daten aus Supabase fuer SeniorCare geladen.
// Autor: Wilfred Feyem
import { caregiverSeed, seniorSeed } from '../data/seedData'
import { currentLastActiveLabel } from '../lib/format'
import { supabase } from '../lib/supabaseClient'
import { mapCaregiverSeniors, mapSeniorBundle, mapSeniorSummary, toSnakeRole } from './seniorCareHelpers'

export const realtimeTables = ['profiles', 'caregiver_seniors', 'seniors', 'medications', 'appointments', 'assistant_messages', 'exercise_progress']

export async function touchSeniorActivity(seniorId) {
  if (!supabase || !seniorId) return
  await supabase.from('seniors').update({ last_active: currentLastActiveLabel() }).eq('id', seniorId)
}

async function fetchSeniorTemplates() {
  const { data, error } = await supabase.from('exercise_templates').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

async function fetchLatestSosMessage(seniorId) {
  const { data, error } = await supabase
    .from('assistant_messages')
    .select('*')
    .eq('senior_id', seniorId)
    .like('text', '[SOS]%')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

async function fetchSeniorBySeniorId(seniorId) {
  const { data: seniorRow, error: seniorError } = await supabase
    .from('seniors')
    .select('*')
    .eq('id', seniorId)
    .maybeSingle()

  if (seniorError) throw seniorError
  if (!seniorRow) return null

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', seniorRow.profile_id)
    .maybeSingle()

  if (profileError) throw profileError

  // Das Dashboard braucht mehrere kleine Datensaetze.
  // Mit Promise.all muss die App nicht alles nacheinander laden.
  const [{ data: medications, error: medsError }, { data: appointments, error: appointmentsError }, { data: assistantMessages, error: assistantError }, latestSosMessage, { data: exerciseProgress, error: progressError }, exerciseTemplates] = await Promise.all([
    supabase.from('medications').select('*').eq('senior_id', seniorId).order('created_at', { ascending: true }),
    supabase.from('appointments').select('*').eq('senior_id', seniorId).order('date', { ascending: true }).order('time', { ascending: true }),
    supabase.from('assistant_messages').select('*').eq('senior_id', seniorId).order('created_at', { ascending: true }),
    fetchLatestSosMessage(seniorId),
    supabase.from('exercise_progress').select('*').eq('senior_id', seniorId),
    fetchSeniorTemplates(),
  ])

  if (medsError) throw medsError
  if (appointmentsError) throw appointmentsError
  if (assistantError) throw assistantError
  if (progressError) throw progressError

  return mapSeniorBundle({
    profileRow,
    seniorRow,
    medications,
    appointments,
    assistantMessages,
    latestSosMessage,
    exerciseTemplates,
    exerciseProgress,
  })
}

async function fetchSeniorSummaryBySeniorId(seniorId) {
  const { data: seniorRow, error: seniorError } = await supabase
    .from('seniors')
    .select('*')
    .eq('id', seniorId)
    .maybeSingle()

  if (seniorError) throw seniorError
  if (!seniorRow) return null

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', seniorRow.profile_id)
    .maybeSingle()

  if (profileError) throw profileError

  const latestSosMessage = await fetchLatestSosMessage(seniorId)

  return mapSeniorSummary({ seniorRow, profileRow, latestSosMessage })
}

async function fetchCaregiverBundle(profileRow) {
  const { data: caregiverRow, error: caregiverError } = await supabase
    .from('caregivers')
    .select('*')
    .eq('profile_id', profileRow.id)
    .maybeSingle()

  if (caregiverError) throw caregiverError

  const { data: links, error: linksError } = caregiverRow
    ? await supabase.from('caregiver_seniors').select('senior_id').eq('caregiver_id', caregiverRow.id)
    : { data: [], error: null }

  if (linksError) throw linksError

  const linkedIds = (links || []).map((row) => row.senior_id)
  // Fuer die Caregiver-Startseite reicht erst eine kurze Zusammenfassung pro Senior.
  const summaries = await Promise.all(linkedIds.map((id) => fetchSeniorSummaryBySeniorId(id)))

  return {
    caregiver: {
      name: profileRow.first_name,
      profileId: profileRow.id,
      seniors: mapCaregiverSeniors(summaries.filter(Boolean)),
    },
  }
}

export async function fetchCurrentUserBundle(session) {
  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profileRow) {
    // Falls das Profil nach Signup noch nicht angelegt wurde, bleibt die App trotzdem benutzbar.
    return {
      profile: null,
      role: session.user.user_metadata?.role || 'senior',
      caregiverSeniors: [],
      selectedSeniorId: null,
      currentSenior: seniorSeed,
      currentCaregiver: caregiverSeed,
    }
  }

  const role = toSnakeRole(profileRow.role || session.user.user_metadata?.role)

  // Caregiver brauchen ihre eigene Uebersicht und einen ausgewaehlten Senior.
  if (role === 'caregiver') {
    const { caregiver } = await fetchCaregiverBundle(profileRow)
    const selectedSeniorId = profileRow.selected_senior_id || caregiver.seniors[0]?.id || null
    const currentSeniorBundle = selectedSeniorId ? await fetchSeniorBySeniorId(selectedSeniorId) : null
    const currentSenior = currentSeniorBundle?.senior || seniorSeed

    return {
      profile: profileRow,
      role,
      caregiverSeniors: caregiver.seniors,
      selectedSeniorId,
      currentSenior,
      currentCaregiver: caregiver,
    }
  }

  const { data: seniorRow, error: seniorError } = await supabase
    .from('seniors')
    .select('id')
    .eq('profile_id', profileRow.id)
    .maybeSingle()

  if (seniorError) throw seniorError
  const seniorBundle = seniorRow ? await fetchSeniorBySeniorId(seniorRow.id) : null
  const currentSenior = seniorBundle?.senior || seniorSeed

  return {
    profile: profileRow,
    role,
    caregiverSeniors: [],
    selectedSeniorId: null,
    currentSenior,
    currentCaregiver: caregiverSeed,
  }
}

export async function withTimeout(promise, ms, label) {
  let timeoutId
  // Damit der Ladescreen nicht ewig haengt, bekommt jede groessere Anfrage ein Zeitlimit.
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(label)), ms)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timeoutId)
  }
}
