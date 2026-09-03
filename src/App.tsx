import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './auth/AuthProvider';
import GraduationGate from './components/GraduationGate';
import Layout from './components/Layout';
import Login from './pages/Login';
import Activate from './pages/Activate';
import InvolvementFair from './pages/InvolvementFair';
import AuthCallback from './pages/AuthCallback';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Resume from './pages/Resume';
import Events from './pages/Events';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          {/* RequireAuth bounces to login when there is no session, so the root can
              aim at the dashboard rather than guessing who is asking. */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="activate" element={<Activate />} />
          <Route path="forgot" element={<ForgotPassword />} />
          {/* The QR code on the tabling cloth. Public, and the only route in this app
              aimed at people who are not members yet — it records attendance and mails
              them the membership form rather than trying to sign them up here. */}
          <Route path="involvement-fair" element={<InvolvementFair />} />
          {/* Where Google sign-in lands. Swaps the handoff code for a session and moves
              on; nothing here is a decision the member makes. */}
          <Route path="auth/callback" element={<AuthCallback />} />
          {/* Public and unauthenticated: Google's consent screen links straight to these,
              so they have to render for somebody who has never signed in. */}
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          {/* Grouped so the gate mounts once for the whole signed-in portal and reads
              the profile a single time, rather than refetching on every navigation. */}
          <Route
            element={
              <RequireAuth>
                <GraduationGate />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="resume" element={<Resume />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* Deliberately outside the gate. A member who does not want to answer can
              still reach their account and sign out instead of being stuck. */}
          <Route
            path="settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
