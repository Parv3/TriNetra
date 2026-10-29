import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { SystemCheckPage } from '@/pages/SystemCheckPage';
import { ConsentPage } from '@/pages/ConsentPage';
import { LoginPage } from '@/pages/LoginPage';
import { FaceVerificationPage } from '@/pages/FaceVerificationPage';
import { ActiveSessionBlockPage } from '@/pages/ActiveSessionBlockPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TestEnvironmentPage } from '@/pages/TestEnvironmentPage';
import { ToastContainer } from '@/components/common/Toast';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useUIStore } from '@/stores/uiStore';
import { Moon, Sun } from 'lucide-react';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      {/* Floating Theme Switcher */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-card/90 border border-border shadow-lg hover:bg-muted text-foreground transition-all backdrop-blur-xs flex items-center justify-center"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      <ToastContainer />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/system-check" element={<SystemCheckPage />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/face-verification"
          element={
            <ProtectedRoute requireAuth>
              <FaceVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session-blocked"
          element={
            <ProtectedRoute requireAuth>
              <ActiveSessionBlockPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth requireFace>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ProtectedRoute requireAuth requireFace>
              <TestEnvironmentPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
