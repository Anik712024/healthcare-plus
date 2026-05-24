import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const API = 'http://127.0.0.1:5000';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', dob: '', password: '', confirm_password: '',
  });
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [terms,    setTerms]    = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async () => {
    if (!terms) { alert('Please accept the Terms and Conditions and Privacy Policy.'); return; }

    const { first_name, last_name, email, password, confirm_password } = form;
    if (!first_name || !last_name || !email || !password || !confirm_password) {
      alert('Please fill in all required fields.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.'); return;
    }
    if (password !== confirm_password) {
      alert('Confirm your selected password'); return;
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters.'); return;
    }

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
              <input className="reg-input" name="first_name" type="text" placeholder="John" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="reg-group">
              <label className="reg-label">Last Name *</label>
              <input className="reg-input" name="last_name" type="text" placeholder="Doe" value={form.last_name} onChange={handleChange} />
            </div>
          </div>

          {/* Email */}
          <div className="reg-full">
            <label className="reg-label">Email Address *</label>
            <input className="reg-input" name="email" type="email" placeholder="john.doe@example.com" value={form.email} onChange={handleChange} style={{ width: '100%' }} />
          </div>

          {/* Phone + DOB */}
          <div className="reg-row">
            <div className="reg-group">
              <label className="reg-label">Phone Number *</label>
              <input className="reg-input" name="phone" type="tel" placeholder="+880 1234-567890" value={form.phone} onChange={handleChange} />
            </div>
            <div className="reg-group">
              <label className="reg-label">Date of Birth *</label>
              <input className="reg-input" name="dob" type="date" value={form.dob} onChange={handleChange} />
            </div>
          </div>

          {/* Password */}
          <div className="reg-full">
            <label className="reg-label">Password *</label>
            <div className="pass-wrap">
              <input
                className="reg-input"
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter password (min. 8 characters)"
                value={form.password}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              <button className="reg-eye" type="button" onClick={() => setShowPwd(p => !p)}>
                <EyeIcon show={showPwd} />
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="reg-full">
            <label className="reg-label">Confirm Password *</label>
            <div className="pass-wrap">
              <input
                className="reg-input"
                name="confirm_password"
                type={showPwd2 ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirm_password}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
              <button className="reg-eye" type="button" onClick={() => setShowPwd2(p => !p)}>
                <EyeIcon show={showPwd2} />
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="checkbox-row">
            <input type="checkbox" id="reg-terms" checked={terms} onChange={e => setTerms(e.target.checked)} />
            <label htmlFor="reg-terms">
              I accept the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>

          <button className="btn-auth-submit" onClick={handleRegister}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Create Account
          </button>

          <div className="auth-link" style={{ marginTop: 16 }}>
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}