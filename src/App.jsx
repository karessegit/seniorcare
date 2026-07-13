// Hier werden die wichtigsten Routen der App festgelegt.
// Autor: Wilfred Feyem
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SeniorCareProvider, useSeniorCare } from './context/SeniorCareContext'
import { SetupScreen } from './screens/SetupScreen'
import { LandingScreen } from './screens/LandingScreen'
import { AuthScreen, CodeScreen } from './screens/AuthScreens'
import {
  AssistantScreen,
  AppointmentScreen,
  GymScreen,
  MedicationScreen,
  SeniorDashboardScreen,
} from './screens/SeniorScreens'
import { CaregiverDetailScreen, CaregiverHomeScreen } from './screens/CaregiverScreens'
import { useMedicationReminders } from './hooks/useMedicationReminders'
import './App.css'

function LoadingScreen() {
  return (
    <div className="app-shell">
      <div className="hero-panel">
        <p className="eyebrow">SeniorCare+</p>
        <h2>Daten werden geladen ...</h2>
      </div>
    </div>
  )
}

function ReminderPopup({ reminder, actions, onClose }) {
  if (!reminder) return null

  const isMedication = reminder.type === 'medication'

  const validateReminder = async () => {
    if (isMedication) {
      await actions.toggleMedicationTaken(reminder.item.id)
    }
    onClose()
  }

  return (
    <div className="modal-overlay reminder-overlay" role="presentation">
      <div className="confirm-dialog reminder-dialog" role="dialog" aria-modal="true" aria-labelledby="reminder-dialog-title">
        <div className="confirm-dialog-copy">
          <p className="eyebrow">Alarm</p>
          <h3 id="reminder-dialog-title">{reminder.title}</h3>
          <p>{reminder.message}</p>
          <p className="reminder-time">
            {isMedication ? `Uhrzeit: ${reminder.item.time}` : `Termin: ${reminder.item.date} um ${reminder.item.time}`}
          </p>
        </div>
        <div className="confirm-dialog-actions">
          <button type="button" className="button ghost" onClick={onClose}>
            Spaeter
          </button>
          <button type="button" className="button primary success-action" onClick={validateReminder}>
            {isMedication ? 'Als genommen markieren' : 'Gesehen'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { isReady, setupReady, isAuthenticated, role, currentSenior, actions } = useSeniorCare()

  const { activeReminder, dismissReminder } = useMedicationReminders({ role, currentSenior })

  if (!setupReady) {
    return <SetupScreen />
  }

  if (!isReady) {
    return <LoadingScreen />
  }

  const defaultHome = role === 'caregiver' ? '/caregiver/home' : '/senior/home'
  const seniorRoutesAllowed = role === 'senior'
  const caregiverRoutesAllowed = role === 'caregiver'

  return (
    <>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/welcome" element={<LandingScreen />} />
            <Route path="/register" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to={defaultHome} replace />} />
            <Route path="/auth" element={<Navigate to={defaultHome} replace />} />
            <Route path="/register" element={<Navigate to={defaultHome} replace />} />
            <Route path="/code" element={seniorRoutesAllowed ? <CodeScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/senior" element={seniorRoutesAllowed ? <Navigate to="/senior/home" replace /> : <Navigate to={defaultHome} replace />} />
            <Route path="/senior/home" element={seniorRoutesAllowed ? <SeniorDashboardScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/senior/medications" element={seniorRoutesAllowed ? <MedicationScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/senior/appointments" element={seniorRoutesAllowed ? <AppointmentScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/senior/medikamente" element={<Navigate to="/senior/medications" replace />} />
            <Route path="/senior/termine" element={<Navigate to="/senior/appointments" replace />} />
            <Route path="/senior/gym" element={seniorRoutesAllowed ? <GymScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/senior/assistant" element={seniorRoutesAllowed ? <AssistantScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/caregiver" element={caregiverRoutesAllowed ? <Navigate to="/caregiver/home" replace /> : <Navigate to={defaultHome} replace />} />
            <Route path="/caregiver/home" element={caregiverRoutesAllowed ? <CaregiverHomeScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="/caregiver/seniors/:seniorId" element={caregiverRoutesAllowed ? <CaregiverDetailScreen /> : <Navigate to={defaultHome} replace />} />
            <Route path="*" element={<Navigate to={defaultHome} replace />} />
          </>
        )}
      </Routes>
      <ReminderPopup reminder={activeReminder} actions={actions} onClose={dismissReminder} />
    </>
  )
}

function App() {
  return (
    <SeniorCareProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SeniorCareProvider>
  )
}

export default App
