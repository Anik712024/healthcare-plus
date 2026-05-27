import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const API = 'https://healthcare-plus-api.onrender.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [step, setStep]       = useState(1); // 1=email, 2=token, 3=newpwd, 4=done
  const [email, setEmail]     = useState('');
  const [token, setToken]     = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [showPwd,  setShowPwd]    = useState(false);
  const [showPwd2, setShowPwd2]   = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1: Send reset token to email ──────────────────────────────────────
  const handleSendToken = async () => {
    setError('');
    if (!email.trim())            { setError('Please enter your email.'); return; }
    if (!EMAIL_RE.test(email))    { setError('Invalid email address.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error || 'Email not found.'); return; }
      if (data.code) setToken(data.code); // auto-fill the code
setStep(2);
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify token ────────────────────────────────────────────────────
  const handleVerifyToken = async () => {
    setError('');
    if (!token.trim()) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/verify-reset-token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), token: token.trim() }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error || 'Invalid or expired code.'); return; }
      setStep(3);
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Set new password ────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setError('');
    if (!password)              { setError('Please enter a new password.'); return; }
    if (password.length < 8)   { setError('Password must be at least 8 characters.'); return; }
    if (password !== password2) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    email.trim().toLowerCase(),
          token:    token.trim(),
          password: password,
        }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error || 'Failed to reset password.'); return; }
      setStep(4);
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeOff = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
  const EyeOn = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <div className="auth-page">
      {/* Top band */}
      <div className="auth-top-band">
        <div className="auth-band-circles">
          <span className="auth-circle c1" /><span className="auth-circle c2" /><span className="auth-circle c3" />
        </div>
        <div className="auth-brand-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          HealthCare+
        </div>
        <h1 className="auth-band-title">
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Enter Code'}
          {step === 3 && 'New Password'}
          {step === 4 && 'Password Reset!'}
        </h1>
        <p className="auth-band-sub">
          {step === 1 && 'Enter your email to receive a reset code'}
          {step === 2 && `We sent a 6-digit code to ${email}`}
          {step === 3 && 'Create your new password'}
          {step === 4 && 'Your password has been reset successfully'}
        </p>
      </div>

      <div className="auth-card-outer">
        <div className="auth-card-new">

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <>
              <div className="auth-field-new">
                <label>Email Address</label>
                <div className="auth-input-wrap-new">
                  <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/>
                  </svg>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSendToken()}
                  />
                </div>
              </div>
              {error && <div className="auth-error-banner">{error}</div>}
              <button className="btn-auth-primary" onClick={handleSendToken} disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Send Reset Code'}
              </button>
            </>
          )}

          {/* ── Step 2: Token ── */}
          {step === 2 && (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Enter the 6-digit code sent to <strong>{email}</strong>. Check your inbox and spam folder.
              </p>
              <div className="auth-field-new">
                <label>6-Digit Code</label>
                <div className="auth-input-wrap-new">
                  <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={token}
                    onChange={e => { setToken(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyToken()}
                    style={{ letterSpacing: '0.3em', fontWeight: 700, fontSize: '1.1rem' }}
                  />
                </div>
              </div>
              {error && <div className="auth-error-banner">{error}</div>}
              <button className="btn-auth-primary" onClick={handleVerifyToken} disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Verify Code'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--muted)', marginTop: 8 }}>
                Didn't receive it?{' '}
                <span
                  onClick={() => { setStep(1); setError(''); setToken(''); }}
                  style={{ color: 'var(--blue)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Resend
                </span>
              </p>
            </>
          )}

          {/* ── Step 3: New password ── */}
          {step === 3 && (
            <>
              <div className="auth-field-new">
                <label>New Password</label>
                <div className="auth-input-wrap-new">
                  <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="new-password"
                  />
                  <button className="eye-toggle" type="button" onClick={() => setShowPwd(p => !p)}>
                    {showPwd ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
              </div>
              <div className="auth-field-new">
                <label>Confirm New Password</label>
                <div className="auth-input-wrap-new">
                  <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    type={showPwd2 ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={password2}
                    onChange={e => { setPassword2(e.target.value); setError(''); }}
                    autoComplete="new-password"
                  />
                  <button className="eye-toggle" type="button" onClick={() => setShowPwd2(p => !p)}>
                    {showPwd2 ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
              </div>
              {error && <div className="auth-error-banner">{error}</div>}
              <button className="btn-auth-primary" onClick={handleResetPassword} disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Reset Password'}
              </button>
            </>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                background: '#dcfce7', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 32
              }}>✅</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link to="/login">
                <button className="btn-auth-primary" style={{ marginBottom: 0 }}>
                  Go to Login
                </button>
              </Link>
            </div>
          )}

          {step !== 4 && (
            <p className="auth-switch-link" style={{ marginTop: 12 }}>
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}