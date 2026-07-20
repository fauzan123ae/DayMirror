import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header     from './components/Header';
import Sidebar    from './components/Sidebar';
import Footer     from './components/Footer';
import Toast      from './components/Toast';
import Onboarding from './pages/Onboarding';
import Dashboard  from './pages/Dashboard';
import Reflect    from './pages/Reflect';
import Journal    from './pages/Journal';
import Weekly     from './pages/Weekly';
import Profile    from './pages/Profile';

function PrivateRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/" replace />;
}

function AppShell() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E35] font-cute flex flex-col selection:bg-[#F7D3C6] selection:text-[#50281F]">
      <Toast />
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex gap-8">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/"          element={<Onboarding />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/reflect"   element={<PrivateRoute><Reflect /></PrivateRoute>} />
            <Route path="/journal"   element={<PrivateRoute><Journal /></PrivateRoute>} />
            <Route path="/weekly"    element={<PrivateRoute><Weekly /></PrivateRoute>} />
            <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*"          element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
          </Routes>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}