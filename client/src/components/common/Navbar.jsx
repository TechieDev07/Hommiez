import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, ShoppingBag, User, LogOut, Building } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isStudent, isBroker } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Flats & PGs', path: '/', icon: <Home size={16} /> },
    { name: 'Flatmates', path: '/flatmates', icon: <Users size={16} /> },
    { name: 'Buy & Sell', path: '/marketplace', icon: <ShoppingBag size={16} /> },
  ];

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Top Navbar Bar */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '65px',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Home size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
              Hommiez
            </span>
          </div>
        </Link>

        {/* Desktop 3 Navigation Tabs (Center) */}
        <nav className="desktop-tabs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navLinks.map((tab) => {
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: active ? '700' : '600',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                  border: active ? '1px solid var(--primary-border)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Actions (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isBroker && (
                <Link to="/broker/dashboard" className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', minHeight: '36px' }}>
                  <Building size={15} />
                  <span>Dashboard</span>
                </Link>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#F1F5F9',
                padding: '0.3rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}>
                <User size={14} color="var(--primary)" />
                <span>{user.name.split(' ')[0]}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-outline"
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.8rem', minHeight: '36px' }}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', minHeight: '36px' }}>
                Log in
              </Link>
              <Link to="/register" className="btn-accent" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', minHeight: '36px' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Horizontal Sub-bar for the 3 Tabs */}
      <div className="mobile-tabs-bar" style={{
        display: 'none',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: '0.35rem 1rem 0.5rem',
        borderTop: '1px solid var(--border-color)',
        gap: '0.5rem',
      }}>
        {navLinks.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: active ? '700' : '600',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: active ? 'var(--primary-light)' : '#F1F5F9',
                flexShrink: 0,
              }}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
