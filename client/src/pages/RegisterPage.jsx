import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Building2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('student'); // 'student' or 'broker'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        collegeName: role === 'student' ? collegeName : undefined,
        phone: role === 'broker' ? phone : undefined,
        businessName: role === 'broker' ? businessName : undefined,
      };

      const newUser = await register(payload);
      if (newUser.role === 'broker') {
        navigate('/broker/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.25rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Join Hommiez</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Choose how you'll be using the platform
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          backgroundColor: '#F1F5F9',
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
        }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '0.9rem',
              backgroundColor: role === 'student' ? '#FFFFFF' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={18} />
            <span>Student / Seeker</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('broker')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '0.9rem',
              backgroundColor: role === 'broker' ? '#FFFFFF' : 'transparent',
              color: role === 'broker' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'broker' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={18} />
            <span>Owner / Broker</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personal Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. alex@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Conditional field for Students */}
          {role === 'student' && (
            <div className="form-group">
              <label className="form-label">College / University Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Thapar University, VIT, DU, etc."
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="form-control"
              />
            </div>
          )}

          {/* Conditional fields for Owners / Brokers */}
          {role === 'broker' && (
            <>
              <div className="form-group">
                <label className="form-label">Phone / WhatsApp Number (Required)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Students will use this number to contact you.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Business or Property Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sai PG & Hostels or Direct Owner"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="form-control"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : `Sign Up as ${role === 'student' ? 'Student' : 'Owner/Broker'}`}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
