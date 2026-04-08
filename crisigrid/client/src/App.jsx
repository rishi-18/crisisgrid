import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import VolunteersPage from './pages/VolunteersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';

// Helper for redirecting logged in users from auth pages
const PublicOnly = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />} >
                 <Route path="/dashboard" element={<DashboardPage />} />
                 <Route path="/resources" element={<ResourcesPage />} />
                 
                 {/* Coordinator only */}
                 <Route element={<ProtectedRoute roles={['coordinator']} />}>
                    <Route path="/volunteers" element={<VolunteersPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                 </Route>

                 {/* Coordinator or Operator */}
                 <Route element={<ProtectedRoute roles={['coordinator', 'operator']} />}>
                    <Route path="/alerts" element={<AlertsPage />} />
                 </Route>
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
