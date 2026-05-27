import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="auth-page" style={{ paddingBottom: 48 }}>
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
        <h1 className="auth-band-title">Privacy Policy</h1>
        <p className="auth-band-sub">Last updated: May 2026</p>
      </div>

      <div className="auth-card-outer">
        <div className="auth-card-new" style={{ maxWidth: 600 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8 }}>

            <Section title="1. Information We Collect">
              We collect information you provide directly, including your name, email address,
              phone number, date of birth, and appointment details. We also collect usage data
              such as pages visited and features used.
            </Section>

            <Section title="2. How We Use Your Information">
              We use your information to provide and improve our services, process appointment
              bookings, send important notifications, respond to your inquiries, and ensure
              the security of our platform.
            </Section>

            <Section title="3. Data Storage">
              Your data is stored securely in our database hosted in Singapore (Southeast Asia).
              We use industry-standard encryption and security measures to protect your information.
            </Section>

            <Section title="4. Data Sharing">
              We do not sell, trade, or rent your personal information to third parties.
              We may share your information with healthcare providers only as necessary to
              fulfill your appointment bookings.
            </Section>

            <Section title="5. Cookies">
              We use local storage to keep you logged in securely. We do not use tracking
              cookies or third-party advertising cookies.
            </Section>

            <Section title="6. Your Rights">
              You have the right to access, correct, or delete your personal data at any time.
              To exercise these rights, please contact us at info@healthcareplus.com.
            </Section>

            <Section title="7. Data Retention">
              We retain your personal data for as long as your account is active or as needed
              to provide services. You may request deletion of your account and associated data
              at any time.
            </Section>

            <Section title="8. Security">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. Passwords are stored using secure hashing algorithms.
            </Section>

            <Section title="9. Children's Privacy">
              Our services are not directed to children under the age of 13. We do not knowingly
              collect personal information from children under 13.
            </Section>

            <Section title="10. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page.
            </Section>

            <Section title="11. Contact Us">
              If you have any questions about this Privacy Policy, please contact us at
              info@healthcareplus.com or visit our Contact page.
            </Section>
          </div>

          <button
            className="btn-auth-primary"
            style={{ marginTop: 24 }}
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{children}</p>
    </div>
  );
}