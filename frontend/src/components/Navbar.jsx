import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="brand-text">HealthCare+</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-links">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''}>Services</NavLink></li>
          <li><NavLink to="/appointment" className={({ isActive }) => isActive ? 'active' : ''}>Appointment</NavLink></li>
          <li><NavLink to="/bmi" className={({ isActive }) => isActive ? 'active' : ''}>BMI</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink></li>
        </ul>

        {/* Right side */}
        <div className="nav-actions">
          <Link to="/login" className="btn-nav-login">Login</Link>
          <Link to="/register" className="btn-nav-register">Register</Link>

          {/* Three dot menu button */}
          <button
            className="btn-three-dot"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="dropdown-menu">
            <div className="dropdown-header">Navigation</div>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </NavLink>
            <NavLink to="/services" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Services
            </NavLink>
            <NavLink to="/appointment" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Doctor Appointment
            </NavLink>
            <NavLink to="/bmi" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              BMI Calculator
            </NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.18-1.18a2 2 0 012.11-.45c.93.35 1.9.6 2.9.72A2 2 0 0122 17.92z"/></svg>
              Contact
            </NavLink>
            <div className="dropdown-divider" />
            <NavLink to="/login" onClick={() => setMenuOpen(false)} className="dropdown-login">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Login
            </NavLink>
            <NavLink to="/register" onClick={() => setMenuOpen(false)} className="dropdown-register">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Register
            </NavLink>
          </div>
        </>
      )}
    </>
  );
}