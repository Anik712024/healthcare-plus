import { useState } from 'react';
import '../styles/Appointment.css';

const API = 'http://127.0.0.1:5000';

const DOCTORS = [
  { name: 'Dr. Sarah Ahmed',  spec: 'General Medicine', fee: 500,  icon: 'fa-solid fa-user-nurse' },
  { name: 'Dr. Kamal Rahman', spec: 'Cardiology',       fee: 800,  icon: 'fa-solid fa-heart-pulse' },
  { name: 'Dr. Fatima Khan',  spec: 'Pediatrics',       fee: 600,  icon: 'fa-solid fa-baby' },
  { name: 'Dr. Rahim Hassan', spec: 'Orthopedics',      fee: 700,  icon: 'fa-solid fa-bone' },
  { name: 'Dr. Nadia Islam',  spec: 'Neurology',        fee: 900,  icon: 'fa-solid fa-brain' },
];

const PAYMENTS = [
  { id: 'bKash',                  label: 'bKash',                  cls: 'pay-bkash', icon: 'fa-solid fa-wallet' },
  { id: 'Nagad',                  label: 'Nagad',                  cls: 'pay-nagad', icon: 'fa-solid fa-wallet' },
  { id: 'Credit/Debit Card',      label: 'Credit / Debit Card',    cls: 'pay-card',  icon: 'fa-regular fa-credit-card' },
  { id: 'Cash (Pay at Hospital)', label: 'Cash (Pay at Hospital)', cls: 'pay-cash',  icon: 'fa-solid fa-money-bill-wave' },
];

export default function Appointment() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    preferred_date: '', preferred_time: '', gender: '', reason: '',
  });
  const [selDoc,     setSelDoc]     = useState(null);
  const [selPayment, setSelPayment] = useState(null);
  const [modal,      setModal]      = useState(false);
  const [modalMsg,   setModalMsg]   = useState('');

  const fee   = selDoc ? selDoc.fee : 0;
  const tax   = Math.round(fee * 0.05);
  const total = fee + 50 + tax;

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const confirmAppointment = async () => {
    const { full_name, email, phone, preferred_date, preferred_time } = form;
    if (!full_name || !email || !phone || !preferred_date || !preferred_time) {
      alert('Please fill in all required fields.'); return;
    }
    if (!selDoc)     { alert('Please select a doctor.');          return; }
    if (!selPayment) { alert('Please select a payment method.');  return; }

    const payload = {
      ...form,
      doctor:         selDoc.name,
      payment_method: selPayment,
      total_fee:      `৳${total}`,
    };

    try {
      const res  = await fetch(`${API}/api/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) { alert('Error: ' + data.error); return; }
    } catch {
      console.warn('Backend unavailable — showing modal anyway.');
    }

    setModalMsg(
      `${selDoc.name} on ${form.preferred_date} at ${form.preferred_time}. Payment: ${selPayment}. Total: ৳${total}`
    );
    setModal(true);

    /* reset */
    setForm({ full_name: '', email: '', phone: '', preferred_date: '', preferred_time: '', gender: '', reason: '' });
    setSelDoc(null);
    setSelPayment(null);
  };

  return (
    <>
      {/* Hero */}
      <div className="appt-hero">
        <div className="appt-hero-icon">
          <i className="fa-regular fa-calendar-check"></i>
        </div>
        <h1>Book an Appointment</h1>
        <p>Schedule your visit with our expert doctors</p>
      </div>

      <div className="appt-layout">
        {/* ── Left: form ── */}
        <div className="appt-card">
          <div className="appt-card-title">
            <i className="fa-solid fa-notes-medical" style={{ color: 'var(--blue)' }}></i>
            Appointment Details
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name <span>*</span></label>
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label>Email <span>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your.email@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number <span>*</span></label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+880 1234-567890" />
            </div>
            <div className="form-group">
              <label>Preferred Date <span>*</span></label>
              <input name="preferred_date" type="date" value={form.preferred_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Preferred Time <span>*</span></label>
              <select name="preferred_time" value={form.preferred_time} onChange={handleChange}>
                <option value="">Select time slot</option>
                <option>09:00 AM – 10:00 AM</option>
                <option>10:00 AM – 11:00 AM</option>
                <option>11:00 AM – 12:00 PM</option>
                <option>02:00 PM – 03:00 PM</option>
                <option>03:00 PM – 04:00 PM</option>
                <option>05:00 PM – 06:00 PM</option>
              </select>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="form-group form-full">
              <label>Reason for Visit (Optional)</label>
              <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Briefly describe your symptoms or reason for visit" />
            </div>
          </div>

          {/* Doctors */}
          <div className="section-label">
            <i className="fa-solid fa-user-doctor"></i> Our Doctors <span style={{ color: '#ef4444' }}>*</span>
          </div>
          <div className="doctors-grid">
            {DOCTORS.map(doc => (
              <div
                key={doc.name}
                className={`doctor-card ${selDoc?.name === doc.name ? 'selected' : ''}`}
                onClick={() => setSelDoc(doc)}
              >
                <div className="doctor-avatar"><i className={doc.icon}></i></div>
                <div className="doctor-name">{doc.name}</div>
                <div className="doctor-spec">{doc.spec}</div>
                <div className="doctor-fee">
                  <span>Consultation Fee</span>
                  <strong>৳{doc.fee}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Payment */}
          <div className="section-label">
            <i className="fa-solid fa-credit-card"></i> Payment Method <span style={{ color: '#ef4444' }}>*</span>
          </div>
          <div className="payment-options">
            {PAYMENTS.map(p => (
              <div
                key={p.id}
                className={`payment-option ${selPayment === p.id ? 'selected' : ''}`}
                onClick={() => setSelPayment(p.id)}
              >
                <div className={`pay-icon ${p.cls}`}><i className={p.icon}></i></div>
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          <button className="btn-submit-appt" onClick={confirmAppointment}>
            <i className="fa-regular fa-calendar-check"></i>
            Confirm Appointment &amp; Payment
          </button>
        </div>

        {/* ── Right: summary ── */}
        <div className="appt-card summary-card">
          <div className="appt-card-title">
            <i className="fa-solid fa-receipt" style={{ color: 'var(--blue)' }}></i>
            Payment Summary
          </div>

          {!selDoc ? (
            <div className="summary-empty">
              <i className="fa-regular fa-calendar" style={{ fontSize: 30, display: 'block', marginBottom: 10, color: 'var(--border)' }}></i>
              Select a doctor to see payment details
            </div>
          ) : (
            <>
              <div className="summary-doctor">
                <div className="summary-avatar"><i className="fa-solid fa-user-doctor"></i></div>
                <div>
                  <div className="summary-name">{selDoc.name}</div>
                  <div className="summary-spec">{selDoc.spec}</div>
                </div>
              </div>
              <div className="summary-row"><span>Consultation Fee</span><span>৳{fee}</span></div>
              <div className="summary-row"><span>Platform Fee</span><span>৳50</span></div>
              <div className="summary-row"><span>Tax (5%)</span><span>৳{tax}</span></div>
              <div className="summary-total"><span>Total</span><span>৳{total}</span></div>
              {selPayment && (
                <div className="summary-badge">
                  <i className="fa-solid fa-check-circle"></i> Payment via {selPayment}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      <div className={`modal-overlay ${modal ? 'show' : ''}`}>
        <div className="modal-box">
          <div className="modal-icon"><i className="fa-solid fa-check"></i></div>
          <h2>Appointment Confirmed!</h2>
          <p>{modalMsg}</p>
          <button className="modal-close" onClick={() => setModal(false)}>Done</button>
        </div>
      </div>
    </>
  );
}