import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Standings from './pages/Standings';
import Calendar from './pages/Calendar';
import Drivers from './pages/Drivers';
import Teams from './pages/Teams';
import LiveSession from './pages/LiveSession';
import Profile from './pages/Profile';
import FantasyTeam from './pages/FantasyTeam';
import Compare from './pages/Compare';
import Widgets from './pages/Widgets';
import Onboarding, { useOnboarding } from './components/Onboarding';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
import './styles/index.css';

function AppInner() {
  const { authModal } = useAuth();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  useTheme(); // apply saved theme on mount

  return (
    <div className="app-root">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/live" element={<LiveSession />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/fantasy" element={<FantasyTeam />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/widgets" element={<Widgets />} />
        </Routes>
      </main>
      {authModal && <AuthModal />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  );
}
