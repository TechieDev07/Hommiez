import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';
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
          <footer
            style={{
              borderTop: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              padding: '1.25rem 1rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              lineHeight: '1.4',
            }}
          >
            <div
              className="container"
              style={{
                maxWidth: '680px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Brand Logo with Icon */}
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  marginBottom: '0.35rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--primary, #0F766E)',
                    color: '#FFFFFF',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(15, 118, 110, 0.2)',
                  }}
                >
                  <Home size={18} strokeWidth={2.4} />
                </div>
                <span
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    color: 'var(--primary, #0F766E)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Hommiez
                </span>
              </Link>

              {/* Tagline */}
              <p
                style={{
                  margin: '0 0 0.35rem',
                  fontSize: '0.925rem',
                  fontWeight: '600',
                  color: 'var(--text-main, #0F172A)',
                  letterSpacing: '-0.2px',
                }}
              >
                Find your space. Find your people.
              </p>

              {/* Campus Pill Badge */}
              <div style={{ marginBottom: '0.65rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: 'var(--primary-light, #F0FDFA)',
                    color: 'var(--primary, #0F766E)',
                    border: '1px solid var(--primary-border, #99F6E4)',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.775rem',
                    fontWeight: '600',
                  }}
                >
                  <Heart size={12} fill="currentColor" />
                  Built by Student, for Students
                </span>
              </div>

              {/* Copyright */}
              <p
                style={{
                  margin: 0,
                  fontSize: '0.775rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '0.5rem',
                  width: '100%',
                }}
              >
                © {new Date().getFullYear()} Hommiez. All rights reserved.
              </p>
            </div>
          </footer>

        </div>
      </Router>
    </AuthProvider>
  );
}
