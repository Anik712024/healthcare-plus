import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const API = 'https://healthcare-plus-api.onrender.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', dob: '', password: '', confirm_password: '',
  });
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

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
      e.confirm_password = 'Confirm your selected password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!terms) { alert('Please accept the Terms and Conditions and Privacy Policy.'); return; }
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) { alert(data.error); return; }
      alert('Account created successfully! You can now log in.');
      navigate('/login');
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

  const Field = ({ label, name, type = 'text', placeholder, half }) => (
    <div className={`auth-field-new ${half ? 'field-half' : ''}`}>
      <label>{label}</label>
      <div className={`auth-input-wrap-new ${errors[name] ? 'wrap-error' : ''}`}>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          autoComplete={name === 'email' ? 'email' : name === 'dob' ? 'bday' : 'off'}
        />
      </div>
      {errors[name] && <span className="field-err-msg">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      {/* Top band */}
      <div className="auth-top-band auth-top-band--reg">
        <div className="auth-band-circles">
          <span className="auth-circle c1" />
          <span className="auth-circle c2" />
          <span className="auth-circle c3" />
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

      {/* Card */}
      <div className="auth-card-outer">
        <div className="auth-card-new">

          {/* Step label */}
          <div className="reg-step-label">
            <span className="step-dot active" />
            <span className="step-dot" />
            <span className="step-dot" />
            <span className="step-text">Personal Information</span>
          </div>

          {/* Name row — side by side */}
          <div className="fields-row">
            <Field label="First Name *" name="first_name" placeholder="John" half />
            <Field label="Last Name *"  name="last_name"  placeholder="Doe"  half />
          </div>

          <Field label="Email Address *" name="email" type="email" placeholder="john.doe@example.com" />
          <Field label="Phone Number *"  name="phone" type="tel"   placeholder="+880 1234-567890" />
          <Field label="Date of Birth"   name="dob"   type="date" />

          {/* Password */}
          <div className="auth-field-new">
            <label>Password *</label>
            <div className={`auth-input-wrap-new ${errors.password ? 'wrap-error' : ''}`}>
              <svg className="field-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
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
              <input
                type={showPwd2 ? 'text' : 'password'}
                name="confirm_password"
                placeholder="Re-enter your password"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
              />
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
              I accept the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
            </span>
          </label>

          {/* Submit */}
          <button
            className={`btn-auth-primary ${!terms ? 'btn-auth-disabled' : ''}`}
            onClick={handleRegister}
            disabled={loading}
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