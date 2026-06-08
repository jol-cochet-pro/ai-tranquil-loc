import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { DossierBuilder } from './pages/DossierBuilder';
import { PersonView } from './pages/PersonView';
import { TransmissionBuilder } from './pages/TransmissionBuilder';
import { TransmissionView } from './pages/TransmissionView';
import { ProtectedRoute } from './pages/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/invitation/:token" element={<PersonView />} />
          <Route path="/transmission/:token" element={<TransmissionView />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dossier"
            element={
              <ProtectedRoute>
                <DossierBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transmissions"
            element={
              <ProtectedRoute>
                <TransmissionBuilder />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
