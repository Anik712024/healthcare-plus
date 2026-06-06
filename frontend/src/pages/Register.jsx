import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';
import { saveToken } from './Login';

const API = 'https://healthcare-plus-api.onrender.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Field = ({ label, name, type = 'text', placeholder, half, value, onChange, error }) => (
  <div className={`auth-field-new ${half ? 'field-half' : ''}`}>
    <label>{label}</label>
    <div className={`auth-input-wrap-new ${error ? 'wrap-error' : ''}`}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={name === 'email' ? 'email' : name === 'dob' ? 'bday' : 'off'}
      />
    </div>
    {error && <span className="field-err-msg">{error}</span>}
  </div>
);

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ name, onLogin, onHome }) {
  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)', zIndex: 999,
        animation: 'fadeInBackdrop 0.3s ease forwards',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        animation: 'slideUpModal 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '40px 32px 48px',
          maxWidth: 480,
          margin: '0 auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}>
          {/* Checkmark circle */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
            animation: 'popIn 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <svg width="36" height="36" fill="none" stroke="#fff" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 style={{
            fontSize: '1.6rem', fontWeight: 700, color: '#111827',
            margin: '0 0 8px',
          }}>
            Welcome, {name}! 🎉
          </h2>
          <p style={{
            color: '#6b7280', fontSize: '0.95rem',
            margin: '0 0 32px', lineHeight: 1.6,
          }}>
            Your account has been created successfully.<br />
            What would you like to do next?
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <button onClick={onLogin} style={{
              width: '100%', padding: '14px 24px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 14,
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'; }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Go to Login
            </button>

            <button onClick={onHome} style={{
              width: '100%', padding: '14px 24px',
              background: '#f3f4f6', color: '#374151',
              border: '2px solid #e5e7eb', borderRadius: 14,
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.15s, background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.transform = ''; }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Home
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Main Register Component ───────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', dob: '', password: '', confirm_password: '',
  });
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPwd2,  setShowPwd2]  = useState(false);
  const [terms,     setTerms]     = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim())  e.last_name  = 'Required';
    if (!form.email.trim())      e.email = 'Required';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone.trim())      e.phone = 'Required';
    if (!form.password)          e.password = 'Required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.confirm_password)  e.confirm_password = 'Required';
    else if (form.password !== form.confirm_password)
      e.confirm_password = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!terms) { alert('Please accept the Terms and Conditions and Privacy Policy.'); return; }
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) { alert(data.error); return; }
      saveToken(data.token);
      setShowModal(true); // ← show success modal instead of navigating
    } catch {
      alert('Unable to connect to server. Please try again.');
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
      {/* Success Modal */}
      {showModal && (
        <SuccessModal
          name={form.first_name}
          onLogin={() => navigate('/login')}
          onHome={() => navigate('/')}
        />
      )}

      <div className="auth-top-band auth-top-band--reg">
        <div className="auth-band-circles">
          <span className="auth-circle c1" /><span className="auth-circle c2" /><span className="auth-circle c3" />
        </div>
        <div className="auth-brand-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          HealthCare+
        </div>
        <h1 className="auth-band-title">Create Account</h1>
        <p className="auth-band-sub">Start your health journey today</p>
      </div>

      <div className="auth-card-outer">
        <div className="auth-card-new">
          <div className="reg-step-label">
            <span className="step-dot active" /><span className="step-dot" /><span className="step-dot" />
            <span className="step-text">Personal Information</span>
          </div>

          <div className="fields-row">
            <Field label="First Name *" name="first_name" placeholder="John" half
              value={form.first_name} onChange={handleChange} error={errors.first_name} />
            <Field label="Last Name *" name="last_name" placeholder="Doe" half
              value={form.last_name} onChange={handleChange} error={errors.last_name} />
          </div>
          <Field label="Email Address *" name="email" type="email" placeholder="john.doe@example.com"
            value={form.email} onChange={handleChange} error={errors.email} />
          <Field label="Phone Number *" name="phone" type="tel" placeholder="+880 1234-567890"
            value={form.phone} onChange={handleChange} error={errors.phone} />
          <Field label="Date of Birth" name="dob" type="date"
            value={form.dob} onChange={handleChange} error={errors.dob} />

          {/* Password */}
          <div className="auth-field-new">
            <label>Password *</label>
            <div className={`auth-input-wrap-new ${errors.password ? 'wrap-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input type={showPwd ? 'text' : 'password'} name="password"
                placeholder="Min. 8 characters" value={form.password}
                onChange={handleChange} autoComplete="new-password" />
              <button className="eye-toggle" type="button" onClick={() => setShowPwd(p => !p)}>
                {showPwd ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {errors.password && <span className="field-err-msg">{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className="auth-field-new">
            <label>Confirm Password *</label>
            <div className={`auth-input-wrap-new ${errors.confirm_password ? 'wrap-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input type={showPwd2 ? 'text' : 'password'} name="confirm_password"
                placeholder="Re-enter your password" value={form.confirm_password}
                onChange={handleChange} autoComplete="new-password" />
              <button className="eye-toggle" type="button" onClick={() => setShowPwd2(p => !p)}>
                {showPwd2 ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {errors.confirm_password && <span className="field-err-msg">{errors.confirm_password}</span>}
          </div>

          {/* Terms */}
          <label className="terms-row">
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
            <span className="remember-box" />
            <span className="terms-text">
              I accept the <Link to="/terms">Terms &amp; Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
            </span>
          </label>

          <button
            className={`btn-auth-primary ${!terms ? 'btn-auth-disabled' : ''}`}
            onClick={handleRegister} disabled={loading}
          >
            {loading
              ? <span className="btn-spinner" />
              : <>Create Account <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
            }
          </button>

          <p className="auth-switch-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}