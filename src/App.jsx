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
  const { user, loading } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce">🥑</div>
          <p className="font-black text-[#7CA190] text-sm">Memuat DayMirror...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E35] font-cute flex flex-col selection:bg-[#F7D3C6] selection:text-[#50281F]">
      <Toast />
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex gap-8">
        <Sidebar />

        {/* pb-24 di mobile supaya konten tidak ketutup bottom nav */}
        <div className="flex-1 min-w-0 pb-24 md:pb-0">
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

      {/* Footer hanya di desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
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