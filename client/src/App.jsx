import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import FlatmatesPage from './pages/FlatmatesPage';
import MarketplacePage from './pages/MarketplacePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrokerDashboardPage from './pages/BrokerDashboardPage';

// Protected Route Guard for Owner / Broker Dashboard
function BrokerRoute({ children }) {
  const { user, loading, isBroker } = useAuth();
  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  if (!user || !isBroker) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <div style={{ flexGrow: 1 }}>
            <Routes>
              {/* Core 3 Campus Ecosystem Tabs */}
              <Route path="/" element={<HomePage />} />
              <Route path="/flatmates" element={<FlatmatesPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />

              {/* Property Details */}
              <Route path="/listings/:id" element={<ListingDetailPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Owner Dashboard */}
              <Route
                path="/broker/dashboard"
                element={
                  <BrokerRoute>
                    <BrokerDashboardPage />
                  </BrokerRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#FFFFFF',
            padding: '2rem 0',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}>
            <div className="container">
              Hommiez © {new Date().getFullYear()} — Student Housing, Flatmate Finder & Campus Marketplace. Built with MERN Stack.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
