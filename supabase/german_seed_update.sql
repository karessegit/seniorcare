-- Diese Datei uebersetzt bestehende Beispieldaten in Deutsch.

alter table public.medications
  alter column unit set default 'Tablette';

update public.medications
set
  name = 'Aspirine',
  unit = 'Tablette',
  notes = 'eine Tablette mit einem Glas Wasser'
where name in ('Aspirin', 'Aspirine')
  and time = '20:00';

update public.appointments
set
  doctor = 'Dr. Schmidt',
  address = 'Berliner Str. 8, 67437 Darmstadt'
where doctor in ('Dr. Miller', 'Dr. Schmidt')
  and time = '11:00';

update public.assistant_messages
set text = 'Hallo! Wie kann ich dir heute helfen?'
where text in ('Hello, Marie! How can I help you today?', 'Hallo, Wie kann ich dir heute helfen?');

update public.exercise_templates
set
  name = 'Laufen',
  level = 'Leicht',
  description = 'Gehe in ruhigem Tempo und halte den Rücken aufrecht.',
  steps = '["Aufrecht stehen", "Langsam losgehen", "10 Minuten gleichmäßig gehen", "Kurz pausieren"]'::jsonb
where exercise_key = 'walking';

update public.exercise_templates
set
  name = 'Rückenübung',
  level = 'Mittel',
  description = 'Sanfte Beweglichkeit für den unteren Rücken.',
  steps = '["Aufrecht sitzen", "Arme nach vorne strecken", "Langsam kreisen", "Tief atmen"]'::jsonb
where exercise_key = 'back';

update public.exercise_templates
set
  name = 'Meditation',
  level = 'Leicht',
  description = 'Eine beruhigende Atemübung zur Entspannung.',
  steps = '["Bequem sitzen", "Augen schließen", "Langsam ein- und ausatmen", "Gedanken ziehen lassen"]'::jsonb
where exercise_key = 'meditation';

update public.exercise_templates
set
  name = 'Beineübung',
  level = 'Leicht',
  description = 'Aktiviere die Beine mit kleinen kontrollierten Bewegungen.',
  steps = '["Am Stuhl festhalten", "Ein Bein anheben", "Langsam senken", "Mit dem anderen Bein wiederholen"]'::jsonb
where exercise_key = 'legs';

update public.exercise_templates
set
  name = 'Armkreisen',
  level = 'Leicht',
  description = 'Lockere die Schultern mit sanften Kreisbewegungen.',
  steps = '["Arme seitlich anheben", "Kleine Kreise nach vorne", "Kleine Kreise nach hinten", "Locker ausschütteln"]'::jsonb
where exercise_key = 'arms';

update public.exercise_templates
set
  name = 'Atemübung',
  level = 'Leicht',
  description = 'Bewusstes Atmen für mehr Ruhe und Klarheit.',
  steps = '["Durch die Nase einatmen", "Vier Sekunden halten", "Langsam ausatmen", "Mehrfach wiederholen"]'::jsonb
where exercise_key = 'breathing';
