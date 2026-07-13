// Hier werden Supabase-Daten in ein Format umgebaut, das die App einfacher benutzen kann.
// Autor: Wilfred Feyem
import { caregiverSeed, seniorSeed } from '../data/seedData'
import { DEFAULT_SOS_MESSAGE } from '../lib/sos'

export function toSnakeRole(role) {
  return role === 'caregiver' ? 'caregiver' : 'senior'
}

export function normalizeMood(value) {
  if (!value) return null
  if (value === 'good' || value === 'g' + 'ut') return 'good'
  if (value === 'ok' || value === 'okay' || value === 'm' + 'ittel') return 'ok'
  if (value === 'bad' || value === 'sch' + 'lecht' || value === 'needs_attention') return 'bad'
  return value
}

export function buildSosPayload(input) {
  const cleanText = input.trim()
  const message = cleanText || DEFAULT_SOS_MESSAGE

  return {
    complaint: message,
    assistantText: `[SOS] ${message}`,
  }
}

export function buildExerciseKey(name) {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)

  return `custom-${cleanName || 'uebung'}-${Date.now().toString(36)}`
}

function parseSosMessage(row) {
  if (!row?.text || !row.text.startsWith('[SOS]')) return null

  return {
    id: row.id,
    text: row.text.replace(/^\[SOS\]\s*/, '').trim(),
    time: row.time_label,
    createdAt: row.created_at,
  }
}

// Falls die Datenbankregeln den Namen kurz nicht liefern, gibt es hier einen einfachen Ersatz.
function buildProfileView(profileRow, seniorRow) {
  if (profileRow) {
    return {
      id: profileRow.id,
      role: profileRow.role,
      firstName: profileRow.first_name,
      lastName: profileRow.last_name,
      selectedSeniorId: profileRow.selected_senior_id || null,
    }
  }

  return {
    id: seniorRow.profile_id,
    role: 'senior',
    firstName: `Senior ${seniorRow.code}`,
    lastName: '',
    selectedSeniorId: null,
  }
}

export function mapSeniorBundle({ profileRow, seniorRow, medications, appointments, assistantMessages, latestSosMessage, exerciseTemplates, exerciseProgress }) {
  // Mit der Map kann ich den Fortschritt schnell ueber den exercise_key finden.
  const progressByKey = new Map((exerciseProgress || []).map((row) => [row.exercise_key, row]))
  const profile = buildProfileView(profileRow, seniorRow)

  return {
    profile,
    senior: {
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: seniorRow.age,
        code: seniorRow.code,
        lastActive: seniorRow.last_active,
      },
      mood: normalizeMood(seniorRow.current_mood),
      complaint: seniorRow.complaint || '',
      meds: (medications || []).map((med) => ({
        id: med.id,
        name: med.name,
        amount: med.amount,
        unit: med.unit,
        time: med.time,
        notes: med.notes,
        taken: med.taken,
      })),
      appointments: (appointments || []).map((item) => ({
        id: item.id,
        doctor: item.doctor,
        date: item.date,
        time: item.time,
        address: item.address,
      })),
      assistantMessages: (assistantMessages || []).map((item) => ({
        id: item.id,
        text: item.text,
        isMe: item.is_me,
        time: item.time_label,
      })),
      latestSos: parseSosMessage(latestSosMessage),
      // Es werden nur Uebungen angezeigt, fuer die dieser Senior auch einen Fortschritt hat.
      exercises: (exerciseTemplates || [])
        .filter((exercise) => progressByKey.has(exercise.exercise_key))
        .map((exercise) => ({
          id: exercise.id,
          key: exercise.exercise_key,
          emoji: exercise.emoji,
          name: exercise.name,
          duration: exercise.duration,
          level: exercise.level,
          description: exercise.description,
          steps: exercise.steps || [],
          done: progressByKey.get(exercise.exercise_key)?.done || false,
        })),
      seniorRow,
    },
  }
}

export function mapCaregiverSeniors(rows) {
  return (rows || []).map((row) => ({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    age: row.age,
    status: normalizeMood(row.status) || 'good',
    lastActive: row.lastActive,
    code: row.code,
    latestSos: row.latestSos || null,
  }))
}

export function mapSeniorSummary({ seniorRow, profileRow, latestSosMessage }) {
  return {
    id: seniorRow.id,
    firstName: profileRow?.first_name || `Senior ${seniorRow.code}`,
    lastName: profileRow?.last_name || '',
    age: seniorRow.age,
    status: normalizeMood(seniorRow.current_mood) || 'ok',
    lastActive: seniorRow.last_active,
    code: seniorRow.code,
    latestSos: parseSosMessage(latestSosMessage),
  }
}

export function buildSignedOutState() {
  return {
    session: null,
    role: null,
    profile: null,
    caregiverSeniors: [],
    selectedSeniorId: null,
    currentSenior: seniorSeed,
    currentCaregiver: caregiverSeed,
    error: null,
  }
}
