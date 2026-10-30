import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PasswordInput from '../components/common/PasswordInput';
import { Home, KeyRound, ArrowLeft, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Multi-step: 1 = Email, 2 = Verify OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // 60-second cooldown timer for Resend OTP
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/forgot-password', { email });
      setInfoMessage(res.data.message || 'Verification code sent to your email.');
      setCooldown(60);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send recovery OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/verify-otp', {
        email,
        otp: otp.trim(),
      });
      setResetSessionToken(res.data.resetSessionToken);
      setInfoMessage('OTP verified! Please set your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post('/auth/reset-password', {
        email,
        resetSessionToken,
        newPassword,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              marginBottom: '0.75rem',
            }}
          >
            <KeyRound size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
            {step === 4 && 'Password Reset Complete!'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            {step === 1 && "Enter your email to receive a 6-digit recovery OTP."}
            {step === 2 && `We sent a 6-digit code to ${email}`}
            {step === 3 && 'Enter and confirm your new secure password.'}
            {step === 4 && 'Your password has been successfully updated.'}
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {infoMessage && step !== 4 && (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4,
            }}
          >
            {infoMessage}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                />
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Sending Code...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="form-control"
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '8px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.4rem',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                Code expires in 5 minutes.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>

            {/* Resend Cooldown Section */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              {cooldown > 0 ? (
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Resend code in <strong>{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <PasswordInput
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <PasswordInput
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              <ShieldCheck size={18} />
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>

            <Link
              to="/login"
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              Proceed to Log In
            </Link>
          </div>
        )}

        {/* Back to Login Footer */}
        {step !== 4 && (
          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
