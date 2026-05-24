import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const API = 'https://healthcare-plus-api.onrender.com';

export default function Login() {
  const navigate = useNavigate();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [remember,  setRemember]  = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);
  const [error,     setError]     = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in both fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email address.'); return; }

    try {
      const res  = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me: remember, method: 'email' }),
      });
      const data = await res.json();
      if (!data.ok) { setError('Invalid email and password.'); return; }
    } catch {
      setError('Unable to connect to server.');
      return;
    }

    if (remember) localStorage.setItem('hc_user', email);
    navigate('/');
  };

  const socialLogin = async (provider) => {
    const socialEmail = prompt(`Enter your ${provider} account email:`);
    if (!socialEmail) return;
    try {
      await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: socialEmail, method: provider.toLowerCase(), remember_me: false }),
      });
    } catch {}
    navigate('/');
  };

  return (
    <>
      <div className="auth-hero">
        <div className="auth-hero-icon">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>
        <h1>Welcome Back</h1>
        <p>Login to access your account</p>
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-card-title">Login</div>
          <div className="auth-card-sub">Enter your credentials to continue</div>

          <label className="auth-label" htmlFor="login-email">Email Address</label>
          <div className="input-wrap">
            <input
              className="auth-input"
              id="login-email"
              type="email"
              placeholder="your.email@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <label className="auth-label" htmlFor="login-password">Password</label>
          <div className="input-wrap">
            <input
              className="auth-input"
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button className="eye-btn" type="button" onClick={() => setShowPwd(p => !p)}>
              {showPwd ? (
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <div className="row-check">
            <label className="check-label">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="btn-auth-submit" onClick={handleLogin}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
          </button>

          <div className="divider">Or continue with</div>

          <div className="social-btns">
            <button className="btn-social" onClick={() => socialLogin('Google')}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="btn-social" onClick={() => socialLogin('Facebook')}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.887v2.254h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </>
  );
}