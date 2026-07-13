# SeniorCare+

SeniorCare+ ist eine HCI-Anwendung für Senioren und Caregiver. Die App hilft dabei, wichtige Gesundheitsaufgaben einfacher zu verwalten und gibt Caregiver einen schnellen Überblick.

Die App wurde mit React 19, Vite und Supabase gebaut. Supabase wird hier für Login, Datenbank, Realtime-Updates und Zugriffsregeln benutzt.

Repository: `git@code.fbi.h-da.de:wilfred.feyemtadaha/hci-app.git`

Autoren: `Wilfred Feyem`, `Karesse Tchoffo`

Die Abschnittsverantwortung ist im Code ueber die Datei-Kopfkommentare dokumentiert.

Verantwortlichkeiten:

- `Wilfred Feyem`: App-Routing, gemeinsamer Kontext, Senior-Screens und Reminder-Logik.
- `Karesse Tchoffo`: Medikamentenformular, Caregiver-Startseite und zugehoerige UI-Anpassungen.

## Ziel der Anwendung

Die Anwendung unterstützt zwei Rollen:

- Senior: Medikamente, Termine, Übungen, Stimmung, SOS und Assistent
- Caregiver: verbundene Senioren ansehen, Alarme erkennen und Einträge mitverwalten

Wichtig war uns, dass die Oberfläche nicht zu kompliziert wirkt. Deshalb gibt es große Buttons, klare Bereiche, sichtbare Rückmeldungen und Bestätigungen vor dem Löschen.

## Installation und Start

1. Abhängigkeiten installieren:

   ```bash
   npm install
   ```

2. Im Hauptordner eine Datei `.env.local` anlegen.

3. Supabase-Konfiguration eintragen:

   ```env
   VITE_SUPABASE_URL=https://gqcpyfmfuwojgdgqxzvp.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SQJGZmypZ7p5ZbpPTyT7Gw_FABn5k3d
   ```

4. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

Die App läuft danach lokal über Vite, normalerweise auf:

```text
http://localhost:5174
```

## Verfügbare Scripts

- `npm run dev`: startet die App lokal
- `npm run build`: erstellt eine Produktionsversion
- `npm run lint`: prüft den Code mit ESLint
- `npm run preview`: zeigt den Production-Build lokal an

## Projektstruktur

- `src/App.jsx`
  Hier liegen die Haupt-Routen und die Weiterleitung je nach Rolle.
- `src/context/SeniorCareContext.jsx`
  Gemeinsamer App-Zustand, Supabase-Session, CRUD-Aktionen und Realtime-Refresh.
- `src/context/seniorCareApi.js`
  Lädt die Daten aus Supabase und baut die größeren Datenpakete für Senior und Caregiver.
- `src/context/seniorCareHelpers.js`
  Hilfsfunktionen, damit Daten aus Supabase besser in der Oberfläche benutzt werden können.
- `src/components/ui.jsx`
  Exportiert gemeinsame UI-Elemente wie TopBar, BottomNav, Dialoge und Formular-Aktionen.
- `src/components/recordForms.jsx`
  Gemeinsame Formulare für Medikamente, Termine und Übungen.
- `src/screens/senior/`
  Screens für Senioren: Dashboard, Medikamente, Termine, Gym und Assistent.
- `src/screens/caregiver/`
  Screens für Caregiver: Übersicht, Senior-Detailseite und Bearbeitungsbereiche.
- `supabase/`
  SQL-Dateien für Schema, Beispieldaten, Policies und Realtime-Erweiterungen.

## Datenbank

Die wichtigsten Tabellen sind:

- `profiles`: Basisdaten zu jedem eingeloggten User
- `seniors`: Senior-spezifische Daten, z. B. Code, Stimmung und letzte Aktivität
- `caregivers`: Caregiver-spezifische Daten
- `caregiver_seniors`: Verbindung zwischen Caregiver und Senior
- `medications`: Medikamente eines Seniors
- `appointments`: Termine eines Seniors
- `assistant_messages`: Nachrichten aus Assistent und SOS
- `exercise_templates`: Übungsvorlagen
- `exercise_progress`: Fortschritt der Übungen pro Senior

Die SQL-Dateien für die Datenbank liegen im Ordner `supabase/`. Die Datei `supabase/schema.sql` enthält das Grundschema mit Tabellen, Triggern, Policies, Realtime-Konfiguration und Seed-Daten. Danach können `supabase/german_seed_update.sql` und `supabase/caregiver_realtime_patch.sql` genutzt werden, falls die Datenbank aktualisiert werden soll.

## Funktionen

- Registrierung und Login für Senioren und Caregiver
- Persönlicher Senior-Code zum Verbinden mit einem Caregiver
- Medikamente hinzufügen, bearbeiten, löschen und als genommen markieren
- Termine hinzufügen, bearbeiten und löschen
- Übungen ansehen, bearbeiten und abhaken
- SOS-Button mit Countdown und Abbrechen-Funktion
- Assistenten-Chat mit einfachen lokalen Antworten
- Realtime-Synchronisation zwischen Senior und Caregiver
- Statusanzeige, wann ein Senior zuletzt aktiv war

## HCI-Entscheidungen

Ein paar HCI-Punkte, die im Code auch kommentiert sind:

- Große und klare Buttons, weil die Senior-Ansicht leicht bedienbar sein soll.
- Deutliche Rückmeldungen beim Speichern, Löschen, Laden und beim SOS-Countdown.
- Löschen wird vorher bestätigt, damit keine wichtigen Daten aus Versehen entfernt werden.
- Formulare können erst abgeschickt werden, wenn die wichtigsten Felder ausgefüllt sind.
- SOS ist optisch getrennt von normalen Notizen, damit die Notfallaktion nicht verwechselt wird.
- Der Caregiver sieht Alarme oben vor der normalen Senior-Liste.
- Icons und Text werden zusammen benutzt, damit Navigation schneller erkannt wird.

## Release Notes

### Version 1.0 - 11.07.2026

#### Hinzugefügt

- Rollenbasierter Login und Registrierung für Senior und Caregiver.
- Senior-Code, damit ein Caregiver einen Senior verbinden kann.
- Verwaltung von Medikamenten, Terminen und Übungen.
- Caregiver-Ansicht mit Übersicht über verbundene Senioren.
- Realtime-Synchronisation zwischen Senior- und Caregiver-Ansicht.
- SOS-Funktion mit Countdown, Abbrechen-Funktion und Caregiver-Alarm.
- Assistenten-Chat mit einfachen lokalen Antworten.
- Medikamenten- und Termin-Reminder mit Alarmton, Popup und Sprachansage.
- Popup zur Bestätigung von Remindern.

#### Geändert

- Senior- und Caregiver-Oberflächen wurden stärker getrennt und farblich angepasst.
- Buttons für Bearbeiten, Löschen und Bestätigung haben jetzt Icons und eigene Farben.
- Das Label `Eingenommen` wurde durch `Als genommen markieren` ersetzt.
- Passwort-Sichtbarkeit wird bei Registrierung pro Feld getrennt gesteuert.
- Die Senior-Gym-Ansicht zeigt alle Übungen statt nur vier Einträge.
- Reminder für Termine werden eine Stunde vor dem Termin ausgelöst.

#### Behoben

- Der Senior kann Medikamente löschen.
- Das Auge-Icon im Passwortformular zeigt nicht mehr beide Passwortfelder gleichzeitig an.
- Neue Senioren sehen dieselben Übungen wie in der Caregiver-Ansicht.
- Der Löschdialog für Medikamente wird korrekt angezeigt.
- Alarmton wird nach der ersten Nutzerinteraktion vorbereitet, damit Browser ihn weniger oft blockieren.

#### Bekannte Einschränkungen

- Reminder funktionieren nur zuverlässig, wenn die App im Browser geöffnet ist.
- Browser können Audio, Sprache oder Benachrichtigungen blockieren, wenn noch keine Nutzerinteraktion stattgefunden hat.
- `npm run lint` meldet aktuell noch eine bestehende Warnung/Fehlermeldung in `MoodSection.jsx`.



## Entwicklungsnotizen

- Der Code ist in kleinere Screens, Komponenten und Helper-Dateien aufgeteilt.
- Die meisten Datenänderungen laufen zentral über `SeniorCareContext.jsx`.
- Für Realtime gibt es zusätzlich Polling als einfache Absicherung, falls Supabase Realtime nicht sofort reagiert.
- Kommentare im Code sind bewusst einfach gehalten und erklären nur die Stellen, die nicht sofort klar sind.
- Komplexere Stellen wie Realtime, Reminder, Listen-Feedback und Supabase-Mapping sind zusätzlich kommentiert, damit man die Logik schneller nachvollziehen kann.
- Refactoring und Clean-Code-Anpassungen wurden durchgeführt, um Dateien kleiner, Zuständigkeiten klarer und wiederkehrende UI-Elemente konsistenter zu machen.

## KI-Nutzung

Claude Code wurde unterstützend für Refactoring, Clean-Code-Verbesserungen und die Korrektur einzelner Fehler verwendet. Die fachliche Ausrichtung, Funktionsauswahl und finale Übernahme der Änderungen erfolgte im Rahmen der Projektarbeit.

## Abgabehinweise

- `node_modules` nicht mit abgeben.
- `.env.local` lokal behalten und nicht in Git einchecken.
- Für eine frische Datenbank zuerst `supabase/schema.sql` ausführen.
- Danach bei Bedarf die weiteren SQL-Dateien aus `supabase/` ausführen.
