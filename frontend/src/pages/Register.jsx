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
  const [errors,   setErrors]   = useState({});  // field-level errors
  const [loading,  setLoading]  = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── Inline validation — returns true if everything is OK ── */
  const validate = () => {
    const newErrors = {};

    if (!form.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!form.last_name.trim())  newErrors.last_name  = 'Last name is required.';

    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!EMAIL_RE.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!form.phone.trim()) newErrors.phone = 'Phone number is required.';

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password.';
    } else if (form.password !== form.confirm_password) {
      // This is the exact message your spec requires
      newErrors.confirm_password = 'Confirm your selected password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    /* Terms check — button won't work without this */
    if (!terms) {
      alert('Please accept the Terms and Conditions and Privacy Policy.');
      return;
    }

    /* Run all field validations */
    if (!validate()) return;

    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.ok) {
        // Show server-side errors (e.g. duplicate email)
        alert(data.error);
        return;
      }

      alert('Account created successfully! You can now log in.');
      navigate('/login');
    } catch {
      alert('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) =>
    show ? (
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
    );

  return (
    <>
      <div className="auth-hero">
        <div className="auth-hero-icon">
          <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h1>Create Account</h1>
        <p>Join HealthCare+ and start your health journey</p>
      </div>

      <div className="auth-card-wrap">
        <div className="reg-card">
          <div className="auth-card-title">Registration Form</div>
          <div className="auth-card-sub">Please fill in all the required information</div>

          {/* Name row */}
          <div className="reg-row">
            <div className="reg-group">
              <label className="reg-label">First Name *</label>
              <input
                className={`reg-input ${errors.first_name ? 'input-error' : ''}`}
                name="first_name"
                type="text"
                placeholder="John"
                value={form.first_name}
                onChange={handleChange}
              />
              {errors.first_name && <span className="field-error">{errors.first_name}</span>}
            </div>
            <div className="reg-group">
              <label className="reg-label">Last Name *</label>
              <input
                className={`reg-input ${errors.last_name ? 'input-error' : ''}`}
                name="last_name"
                type="text"
                placeholder="Doe"
                value={form.last_name}
                onChange={handleChange}
              />
              {errors.last_name && <span className="field-error">{errors.last_name}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="reg-full">
            <label className="reg-label">Email Address *</label>
            <input
              className={`reg-input ${errors.email ? 'input-error' : ''}`}
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={form.email}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Phone + DOB */}
          <div className="reg-row">
            <div className="reg-group">
              <label className="reg-label">Phone Number *</label>
              <input
                className={`reg-input ${errors.phone ? 'input-error' : ''}`}
                name="phone"
                type="tel"
                placeholder="+880 1234-567890"
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
            <div className="reg-group">
              <label className="reg-label">Date of Birth</label>
              <input
                className="reg-input"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="reg-full">
            <label className="reg-label">Password *</label>
            <div className="pass-wrap">
              <input
                className={`reg-input ${errors.password ? 'input-error' : ''}`}
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter password (min. 8 characters)"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ width: '100%' }}
              />
              <button className="reg-eye" type="button" onClick={() => setShowPwd(p => !p)}>
                <EyeIcon show={showPwd} />
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className="reg-full">
            <label className="reg-label">Confirm Password *</label>
            <div className="pass-wrap">
              <input
                className={`reg-input ${errors.confirm_password ? 'input-error' : ''}`}
                name="confirm_password"
                type={showPwd2 ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{ width: '100%' }}
              />
              <button className="reg-eye" type="button" onClick={() => setShowPwd2(p => !p)}>
                <EyeIcon show={showPwd2} />
              </button>
            </div>
            {/* Shows "Confirm your selected password" when passwords don't match */}
            {errors.confirm_password && (
              <span className="field-error">{errors.confirm_password}</span>
            )}
          </div>

          {/* Terms — Create Account is disabled until this is ticked */}
          <div className="checkbox-row">
            <input
              type="checkbox"
              id="reg-terms"
              checked={terms}
              onChange={e => setTerms(e.target.checked)}
            />
            <label htmlFor="reg-terms">
              I accept the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>

          {/*
            The button is visually and functionally disabled when:
              • terms is false  → the onClick guard returns early with an alert
            We also add the CSS class "btn-disabled" for a visual greyed-out state.
          */}
          <button
            className={`btn-auth-submit ${!terms ? 'btn-disabled' : ''}`}
            onClick={handleRegister}
            disabled={loading}
            title={!terms ? 'Please accept the Terms and Conditions first' : ''}
          >
            {loading ? 'Creating account…' : (
              <>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Create Account
              </>
            )}
          </button>

          <div className="auth-link" style={{ marginTop: 16 }}>
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}