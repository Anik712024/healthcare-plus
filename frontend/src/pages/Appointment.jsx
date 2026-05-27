import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Appointment.css';
import { getToken } from './Login';

const API = 'https://healthcare-plus-api.onrender.com';

const DOCTORS = [
  { name: 'Dr. Sarah Ahmed',  spec: 'General Medicine', fee: 500,  icon: 'fa-solid fa-user-nurse' },
  { name: 'Dr. Kamal Rahman', spec: 'Cardiology',       fee: 800,  icon: 'fa-solid fa-heart-pulse' },
  { name: 'Dr. Fatima Khan',  spec: 'Pediatrics',       fee: 600,  icon: 'fa-solid fa-baby' },
  { name: 'Dr. Rahim Hassan', spec: 'Orthopedics',      fee: 700,  icon: 'fa-solid fa-bone' },
  { name: 'Dr. Nadia Islam',  spec: 'Neurology',        fee: 900,  icon: 'fa-solid fa-brain' },
];

const PAYMENTS = [
  { id: 'bKash', label: 'bKash', cls: 'pay-bkash', icon: 'fa-solid fa-wallet' },
  { id: 'Nagad', label: 'Nagad', cls: 'pay-nagad', icon: 'fa-solid fa-wallet' },
];

export default function Appointment() {
  const location = useLocation();

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    preferred_date: '', preferred_time: '', gender: '', reason: '',
  });
  const [selDoc,     setSelDoc]     = useState(null);
  const [selPayment, setSelPayment] = useState(null);
  const [loading,    setLoading]    = useState(false);

  // Payment result modal (after SSLCommerz redirect back)
  const [resultModal,  setResultModal]  = useState(false);
  const [resultStatus, setResultStatus] = useState(''); // success | failed | cancelled
  const [resultTranId, setResultTranId] = useState('');
  const [resultAmount, setResultAmount] = useState('');

  const fee   = selDoc ? selDoc.fee : 0;
  const tax   = Math.round(fee * 0.05);
  const total = fee + 50 + tax;

  // ── Detect SSLCommerz redirect back ──────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    if (payment) {
      setResultStatus(payment);
      setResultTranId(params.get('tran_id') || '');
      setResultAmount(params.get('amount') || '');
      setResultModal(true);
      // Clean URL
      window.history.replaceState({}, '', '/appointment');
    }
  }, [location.search]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Initiate payment via backend → SSLCommerz ────────────────────────────
  const confirmAppointment = async () => {
    const { full_name, email, phone, preferred_date, preferred_time } = form;
    if (!full_name || !email || !phone || !preferred_date || !preferred_time) {
      alert('Please fill in all required fields.'); return;
    }
    if (!selDoc)     { alert('Please select a doctor.');         return; }
    if (!selPayment) { alert('Please select a payment method.'); return; }

    setLoading(true);

    const payload = {
      ...form,
      doctor:         selDoc.name,
      payment_method: selPayment,
      total_fee:      total,
    };

    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res  = await fetch(`${API}/api/payment/initiate`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.ok) {
        alert('Payment error: ' + (data.error || 'Unknown error'));
        setLoading(false);
        return;
      }

      // ✅ Redirect to SSLCommerz payment page
      window.location.href = data.payment_url;

    } catch (err) {
      alert('Unable to connect to payment server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Payment Result Modal (after redirect back from SSLCommerz) ── */}
      {resultModal && (
        <div className="modal-overlay show">
          <div className="modal-box">
            {resultStatus === 'success' ? (
              <>
                <div className="modal-icon" style={{ background: '#dcfce7' }}>
                  <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                </div>
                <h2>Payment Successful!</h2>
                <p>
                  Your appointment has been confirmed.<br />
                  Transaction ID: <strong>{resultTranId}</strong><br />
                  Amount Paid: <strong>৳{resultAmount}</strong>
                </p>
              </>
            ) : resultStatus === 'failed' ? (
              <>
                <div className="modal-icon" style={{ background: '#fef2f2' }}>
                  <i className="fa-solid fa-xmark" style={{ color: '#dc2626' }}></i>
                </div>
                <h2>Payment Failed</h2>
                <p>Your payment could not be processed. Please try again.</p>
              </>
            ) : (
              <>
                <div className="modal-icon" style={{ background: '#fff7ed' }}>
                  <i className="fa-solid fa-ban" style={{ color: '#ea580c' }}></i>
                </div>
                <h2>Payment Cancelled</h2>
                <p>You cancelled the payment. Your appointment was not confirmed.</p>
              </>
            )}
            <button className="modal-close" onClick={() => setResultModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="appt-hero">
        <div className="appt-hero-icon"><i className="fa-regular fa-calendar-check"></i></div>
        <h1>Book an Appointment</h1>
        <p>Schedule your visit with our expert doctors</p>
      </div>

      <div className="appt-layout">
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
                <option>Male</option><option>Female</option>
                <option>Other</option><option>Prefer not to say</option>
              </select>
            </div>
            <div className="form-group form-full">
              <label>Reason for Visit (Optional)</label>
              <textarea name="reason" value={form.reason} onChange={handleChange}
                placeholder="Briefly describe your symptoms or reason for visit" />
            </div>
          </div>

          {/* Doctors */}
          <div className="section-label">
            <i className="fa-solid fa-user-doctor"></i> Our Doctors <span style={{ color: '#ef4444' }}>*</span>
          </div>
          <div className="doctors-grid">
            {DOCTORS.map(doc => (
              <div key={doc.name}
                className={`doctor-card ${selDoc?.name === doc.name ? 'selected' : ''}`}
                onClick={() => setSelDoc(doc)}>
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

          {/* Payment — bKash and Nagad only */}
          <div className="section-label">
            <i className="fa-solid fa-credit-card"></i> Payment Method <span style={{ color: '#ef4444' }}>*</span>
          </div>
          <div className="payment-options">
            {PAYMENTS.map(p => (
              <div key={p.id}
                className={`payment-option ${selPayment === p.id ? 'selected' : ''}`}
                onClick={() => setSelPayment(p.id)}>
                <div className={`pay-icon ${p.cls}`}><i className={p.icon}></i></div>
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: '#eff6ff', borderRadius: 10, padding: '12px 16px',
            fontSize: 13, color: '#1e40af', marginTop: 16, marginBottom: 4,
          }}>
            🔒 Payments are securely processed by <strong>SSLCommerz</strong> — Bangladesh's #1 payment gateway
          </div>

          <button className="btn-submit-appt" onClick={confirmAppointment} disabled={loading}>
            {loading
              ? <><span className="btn-spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Processing...</>
              : <><i className="fa-solid fa-lock"></i> Confirm &amp; Pay ৳{selDoc ? total : 0}</>
            }
          </button>
        </div>

        {/* Summary */}
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
                  <i className="fa-solid fa-check-circle"></i> Pay via {selPayment}
                </div>
              )}
              <div style={{
                marginTop: 16, padding: '10px 12px', background: '#f8fafc',
                borderRadius: 8, fontSize: 11, color: 'var(--muted)', textAlign: 'center',
              }}>
                🔒 Secured by SSLCommerz
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}