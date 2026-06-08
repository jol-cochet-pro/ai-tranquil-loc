import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { PersonView } from './pages/PersonView';
import { ProtectedRoute } from './pages/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { PersonListPage } from './pages/PersonListPage';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-2">Page en construction</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
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
              path="/candidats"
              element={
                <ProtectedRoute>
                  <PersonListPage role="candidat" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/garants"
              element={
                <ProtectedRoute>
                  <PersonListPage role="garant" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transmissions"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Transmissions" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parametres"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Paramètres" />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
