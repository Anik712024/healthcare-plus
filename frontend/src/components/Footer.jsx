import { Link, useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  const navigate = useNavigate();

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => alert('Email copied: ' + email));
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Brand */}
        <div className="footer-brand-col">
          <div className="footer-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            HealthCare+
          </div>
          <p>Your trusted healthcare partner. We provide comprehensive medical services with care and compassion.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/appointment">Book Appointment</Link></li>
            <li><Link to="/bmi">BMI Calculator</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact Us</h4>

          {/* Phone — opens dialer with number pre-filled */}
          <a
            className="footer-contact-item"
            href="tel:+8801234567890"
            title="Tap to call"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.18-1.18a2 2 0 012.11-.45c.93.35 1.9.6 2.9.72A2 2 0 0122 17.92z" />
            </svg>
            <span>+880 1234-567890</span>
          </a>

          {/* Email — copies to clipboard */}
          <div
            className="footer-contact-item"
            onClick={() => copyEmail('info@healthcareplus.com')}
            title="Click to copy email"
            style={{ cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <polyline points="2,4 12,13 22,4" />
            </svg>
            <span>info@healthcareplus.com</span>
          </div>

          {/* Location — navigates to Contact page (Find Us on Map section) */}
          <div
            className="footer-contact-item"
            onClick={() => navigate('/contact')}
            title="Find us on map"
            style={{ cursor: 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>Khulna, Bangladesh</span>
          </div>
        </div>

        {/* Social */}
        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-social">
            {/* Facebook — opens Facebook app/page */}
            <a
              href="https://www.facebook.com/share/1DxQHAUD9v/"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.887v2.254h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
            </a>

            {/* X / Twitter — opens X app/page */}
            <a
              href="https://x.com/HCare_MHB"
              target="_blank"
              rel="noopener noreferrer"
              title="X / Twitter"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 HealthCare+. All Rights Reserved.</span>
        <span>Handcrafted in <a href="#">Bangladesh</a></span>
      </div>
    </footer>
  );
}