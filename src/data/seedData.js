// Hier stehen Startdaten und feste Listen fuer die App.
// Autor: Wilfred Feyem
export const seniorSeed = {
  profile: {
    firstName: 'Marie',
    lastName: 'Dupont',
    age: 72,
    code: '123456',
    lastActive: 'Heute 14:45',
  },
  mood: null,
  complaint: '',
  meds: [
    {
      id: 1,
      name: 'Aspirine',
      amount: 1,
      unit: 'Tablette',
      time: '20:00',
      notes: 'eine Tablette mit einem Glas Wasser',
      taken: false,
    },
  ],
  appointments: [
    {
      id: 1,
      doctor: 'Dr. Schmidt',
      date: '2026-06-15',
      time: '11:00',
      address: 'Berliner Str. 8, 67437 Darmstadt',
    },
  ],
  exercises: [
    {
      id: 1,
      emoji: '🚶',
      name: 'Laufen',
      duration: '10 Min',
      level: 'Leicht',
      description: 'Gehe in ruhigem Tempo und halte den Rücken aufrecht.',
      steps: ['Aufrecht stehen', 'Langsam losgehen', '10 Minuten gleichmäßig gehen', 'Kurz pausieren'],
    },
    {
      id: 2,
      emoji: '🤸',
      name: 'Rückenübung',
      duration: '8 Min',
      level: 'Mittel',
      description: 'Sanfte Beweglichkeit für den unteren Rücken.',
      steps: ['Aufrecht sitzen', 'Arme nach vorne strecken', 'Langsam kreisen', 'Tief atmen'],
    },
    {
      id: 3,
      emoji: '🧘',
      name: 'Meditation',
      duration: '5 Min',
      level: 'Leicht',
      description: 'Eine beruhigende Atemübung zur Entspannung.',
      steps: ['Bequem sitzen', 'Augen schließen', 'Langsam ein- und ausatmen', 'Gedanken ziehen lassen'],
    },
    {
      id: 4,
      emoji: '🦵',
      name: 'Beineübung',
      duration: '7 Min',
      level: 'Leicht',
      description: 'Aktiviere die Beine mit kleinen kontrollierten Bewegungen.',
      steps: ['Am Stuhl festhalten', 'Ein Bein anheben', 'Langsam senken', 'Mit dem anderen Bein wiederholen'],
    },
    {
      id: 5,
      emoji: '👐',
      name: 'Armkreisen',
      duration: '6 Min',
      level: 'Leicht',
      description: 'Lockere die Schultern mit sanften Kreisbewegungen.',
      steps: ['Arme seitlich anheben', 'Kleine Kreise nach vorne', 'Kleine Kreise nach hinten', 'Locker ausschütteln'],
    },
    {
      id: 6,
      emoji: '💨',
      name: 'Atemübung',
      duration: '4 Min',
      level: 'Leicht',
      description: 'Bewusstes Atmen für mehr Ruhe und Klarheit.',
      steps: ['Durch die Nase einatmen', 'Vier Sekunden halten', 'Langsam ausatmen', 'Mehrfach wiederholen'],
    },
  ],
  assistantMessages: [
    { id: 1, text: 'Hallo, Marie! Wie kann ich dir heute helfen?', isMe: false, time: '09:41' },
  ],
}

export const caregiverSeed = {
  name: 'Lili',
  seniors: [
    {
      id: 'marie',
      firstName: 'Marie',
      lastName: 'Dupont',
      age: 72,
      status: 'good',
      lastActive: 'Heute 14:45',
      code: '123456',
    },
  ],
}

export const roleCards = [
  {
    key: 'senior',
    title: 'Als Senior',
    description: 'Meine Gesundheit verwalten',
    accent: 'var(--accent)',
  },
  {
    key: 'caregiver',
    title: 'Als Care giver',
    description: 'Meine Senioren begleiten',
    accent: 'var(--mint)',
  },
]

export const moodOptions = [
  { key: 'good', emoji: '😊', label: 'Gut', tone: 'positive' },
  { key: 'ok', emoji: '😐', label: 'geht', tone: 'neutral' },
  { key: 'bad', emoji: '☹️', label: 'Schlecht', tone: 'negative' },
]

export const navigation = [
  { key: 'home', icon: '⌂', label: 'Home', path: '/senior/home' },
  { key: 'meds', icon: '💊', label: 'Medikamente', path: '/senior/medications' },
  { key: 'appointments', icon: '📅', label: 'Termine', path: '/senior/appointments' },
  { key: 'gym', icon: '🏋️', label: 'Gym', path: '/senior/gym' },
  { key: 'assistant', icon: '💬', label: 'assistant', path: '/senior/assistant' },
]
