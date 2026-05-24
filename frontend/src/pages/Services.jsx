import '../styles/Services.css';

const services = [
  {
    color: 'sc-blue',
    title: 'General Medicine',
    desc: 'Comprehensive primary care for common health concerns and routine check-ups.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3"/>
        <path d="M8 15v1a6 6 0 006 6v0a6 6 0 006-6v-4"/>
        <circle cx="20" cy="10" r="2"/>
      </svg>
    ),
  },
  {
    color: 'sc-pink',
    title: 'Cardiology',
    desc: 'Expert cardiac care including diagnosis and treatment of heart conditions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
  {
    color: 'sc-purple',
    title: 'Neurology',
    desc: 'Specialized care for nervous system disorders and brain health.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 013.32-3.97A2.5 2.5 0 019.5 2z"/>
        <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-3.32-3.97A2.5 2.5 0 0014.5 2z"/>
      </svg>
    ),
  },
  {
    color: 'sc-green',
    title: 'Ophthalmology',
    desc: 'Complete eye care services including vision correction and surgery.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    color: 'sc-orange',
    title: 'Orthopedics',
    desc: 'Treatment for bone, joint, and muscle conditions and injuries.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 00-2.82 0L8 7l9 9 1.59-1.59a2 2 0 000-2.82L17 10l4.37-4.37a2.12 2.12 0 00-3-3z"/>
        <path d="M5.63 21.37L10 17l1.59 1.59a2 2 0 002.82 0L16 17l-9-9-1.59 1.59a2 2 0 000 2.82L7 14l-4.37 4.37a2.12 2.12 0 003 3z"/>
      </svg>
    ),
  },
  {
    color: 'sc-rose',
    title: 'Pediatrics',
    desc: 'Dedicated healthcare for infants, children, and adolescents.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    color: 'sc-teal',
    title: 'Pharmacy',
    desc: 'Full-service pharmacy with prescription and over-the-counter medications.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>
        <path d="M12 5L8.5 9.5l7 0L12 14"/>
      </svg>
    ),
  },
  {
    color: 'sc-yellow',
    title: 'Emergency Care',
    desc: '24/7 emergency medical services for urgent health situations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <h1>Our Medical Services</h1>
        <p>A comprehensive range of medical services to meet all your healthcare needs with expert care and modern facilities.</p>
      </section>

      <div className="services-grid">
        {services.map((s) => (
          <div key={s.title} className={`svc-card ${s.color}`}>
            <div className="svc-icon-banner">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="stats-wrap">
        <p className="stats-title">Why Choose Our Services?</p>
        <div className="stats-box">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Expert Doctors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50,000+</span>
            <span className="stat-label">Happy Patients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Emergency Support</span>
          </div>
        </div>
      </div>
    </>
  );
}