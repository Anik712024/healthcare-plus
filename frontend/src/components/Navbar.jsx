import { NavLink, Link } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="nav-brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        HealthCare+
      </Link>

      {/* Nav Links */}
      <ul className="nav-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
        <li><NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''}>Services</NavLink></li>
        <li><NavLink to="/appointment" className={({ isActive }) => isActive ? 'active' : ''}>Doctor Appointment</NavLink></li>
        <li><NavLink to="/bmi" className={({ isActive }) => isActive ? 'active' : ''}>BMI Calculator</NavLink></li>
        <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink></li>
      </ul>

      {/* Actions */}
      <div className="nav-actions">
        <Link to="/login" className="btn-nav-login">Login</Link>
        <Link to="/register" className="btn-nav-register">Register</Link>
        <button
          className="btn-theme"
          title="Toggle theme"
          onClick={() => {
            document.body.style.background =
              document.body.style.background === 'rgb(15, 23, 42)' ? '' : '#0f172a';
          }}
        >
          🌙
        </button>
      </div>
    </nav>
  );
}