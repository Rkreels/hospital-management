import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Patients = lazy(() => import('./pages/Patients'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Nurses = lazy(() => import('./pages/Nurses'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Departments = lazy(() => import('./pages/Departments'))
const Pharmacy = lazy(() => import('./pages/Pharmacy'))
const Prescriptions = lazy(() => import('./pages/Prescriptions'))
const LabResults = lazy(() => import('./pages/LabResults'))
const Billing = lazy(() => import('./pages/Billing'))
const Admissions = lazy(() => import('./pages/Admissions'))
const Emergency = lazy(() => import('./pages/Emergency'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Documents = lazy(() => import('./pages/Documents'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Surgeries = lazy(() => import('./pages/Surgeries'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const OperatingRoom = lazy(() => import('./pages/OperatingRoom'))
const Staff = lazy(() => import('./pages/Staff'))

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/nurses" element={<Nurses />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/lab-results" element={<LabResults />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/surgeries" element={<Surgeries />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/operating-room" element={<OperatingRoom />} />
            <Route path="/staff" element={<Staff />} />
          </Routes>
        </Suspense>
      </Layout>
      <ToastContainer position="top-right" />
    </>
  )
}
