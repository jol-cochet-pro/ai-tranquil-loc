import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { DossierBuilder } from './pages/DossierBuilder';
import { PersonView } from './pages/PersonView';
import { ProtectedRoute } from './pages/ProtectedRoute';
import { PageLayout } from './components/PageLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/invitation/:token" element={<PersonView />} />
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
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PageLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
