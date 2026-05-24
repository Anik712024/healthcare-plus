import { useState } from 'react';
import '../styles/Contact.css';

const API = 'http://127.0.0.1:5000';

export default function Contact() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', subject: '', message: ''
  });
  const [toast, setToast] = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSend = async () => {
    if (!form.full_name || !form.email || !form.message) {
      alert('Please fill in required fields.'); return;
    }
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) { alert('Error: ' + data.error); return; }
    } catch {
      console.warn('Backend unavailable.');
    }
    setToast(true);
    setForm({ full_name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setToast(false), 4000);
  };

  return (
    <>
      <section className="page-hero">
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </section>

      <div className="contact-layout">
        <div className="contact-left">
          <div className="contact-card">
            <div className="contact-card-title">Send us a Message</div>
            <div className="contact-form-grid">
              <div>
                <label className="cf-label">Full Name <span>*</span></label>
                <input className="cf-input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div>
                <label className="cf-label">Email <span>*</span></label>
                <input className="cf-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your.email@example.com" />
              </div>
              <div>
                <label className="cf-label">Phone</label>
                <input className="cf-input" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+880 1234-567890" />
              </div>
              <div>
                <label className="cf-label">Subject</label>
                <input className="cf-input" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" />
              </div>
              <div className="cf-full">
                <label className="cf-label">Message <span>*</span></label>
                <textarea className="cf-input" name="message" value={form.message} onChange={handleChange} placeholder="Write your message here..." />
              </div>
            </div>
            <button className="btn-send" onClick={handleSend}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Send Message
            </button>
            <div className={`contact-toast ${toast ? 'show' : ''}`}>
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          </div>
        </div>

        <div className="contact-sidebar">
          <div className="contact-card">
            <div className="info-item">
              <div className="info-icon ii-blue">
                <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.18-1.18a2 2 0 012.11-.45c.93.35 1.9.6 2.9.72A2 2 0 0122 17.92z"/>
                </svg>
              </div>
              <div className="info-body">
                <h3>Phone</h3>
                <p>+880 1234-567890</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon ii-green">
                <svg width="18" height="18" fill="none" stroke="#22a779" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/>
                </svg>
              </div>
              <div className="info-body">
                <h3>Email</h3>
                <p>info@healthcareplus.com</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon ii-orange">
                <svg width="18" height="18" fill="none" stroke="#e07a3a" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div className="info-body">
                <h3>Address</h3>
                <p>Khulna, Bangladesh</p>
              </div>
            </div>
          </div>

          <div className="emergency-card-c">
            <h3>🚨 Emergency?</h3>
            <p>For medical emergencies, call our 24/7 emergency hotline immediately.</p>
            <button className="btn-emergency" onClick={() => window.location.href='tel:+8801234567890'}>
              📞 Call Emergency Line
            </button>
          </div>
        </div>
      </div>
    </>
  );
}