import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

export default function Terms() {
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
        <h1 className="auth-band-title">Terms &amp; Conditions</h1>
        <p className="auth-band-sub">Last updated: May 2026</p>
      </div>

      <div className="auth-card-outer">
        <div className="auth-card-new" style={{ maxWidth: 600 }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.8 }}>

            <Section title="1. Acceptance of Terms">
              By creating an account and using HealthCare+, you agree to these Terms and Conditions.
              If you do not agree, please do not use our services.
            </Section>

            <Section title="2. Use of Service">
              HealthCare+ provides a platform to book medical appointments, calculate BMI, and contact
              healthcare providers. Our services are for informational and scheduling purposes only and
              do not replace professional medical advice.
            </Section>

            <Section title="3. User Accounts">
              You are responsible for maintaining the confidentiality of your account credentials.
              You must provide accurate and complete information when registering. You may not use
              another person's account without permission.
            </Section>

            <Section title="4. Appointments">
              Appointments booked through HealthCare+ are subject to availability. We reserve the right
              to cancel or reschedule appointments. Please arrive on time for your scheduled appointment.
            </Section>

            <Section title="5. Privacy">
              Your personal data is handled in accordance with our Privacy Policy. We collect only the
              information necessary to provide our services and do not sell your data to third parties.
            </Section>

            <Section title="6. Prohibited Activities">
              You may not use HealthCare+ for any unlawful purpose, to submit false information,
              to harass other users, or to attempt to gain unauthorized access to our systems.
            </Section>

            <Section title="7. Limitation of Liability">
              HealthCare+ is not liable for any indirect, incidental, or consequential damages arising
              from your use of our services. Medical decisions should always be made in consultation
              with a qualified healthcare professional.
            </Section>

            <Section title="8. Changes to Terms">
              We may update these Terms at any time. Continued use of HealthCare+ after changes
              constitutes acceptance of the new Terms.
            </Section>

            <Section title="9. Contact">
              If you have any questions about these Terms, please contact us at info@healthcareplus.com
              or visit our Contact page.
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