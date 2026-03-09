import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './src/components/Layout';
import Home from './src/pages/Home';
import Tasks from './src/pages/Tasks';
import Calendar from './src/pages/Calendar';
import Documents from './src/pages/Documents';
import Team from './src/pages/Team';
import NotFound from './src/pages/NotFound';

// Hospital-related pages
import Patients from './src/pages/Patients';
import Appointments from './src/pages/Appointments';
import Doctors from './src/pages/Doctors';
import Departments from './src/pages/Departments';
import Pharmacy from './src/pages/Pharmacy';
import Billing from './src/pages/Billing';
import LabResults from './src/pages/LabResults';
import Admissions from './src/pages/Admissions';
import Emergency from './src/pages/Emergency';
import Reports from './src/pages/Reports';

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/team" element={<Team />} />

            {/* Hospital routes */}
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/lab-results" element={<LabResults />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/reports" element={<Reports />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop
          closeOnClick
          theme="colored"
        />
      </Router>
    </Theme>
  );
}

export default App;