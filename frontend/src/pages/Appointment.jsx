import { useState } from 'react';
import '../styles/Appointment.css';
import { getToken } from './Login';   // JWT helper

const API = 'https://healthcare-plus-api.onrender.com';

const DOCTORS = [
  { name: 'Dr. Sarah Ahmed',  spec: 'General Medicine', fee: 500,  icon: 'fa-solid fa-user-nurse' },
  { name: 'Dr. Kamal Rahman', spec: 'Cardiology',       fee: 800,  icon: 'fa-solid fa-heart-pulse' },
  { name: 'Dr. Fatima Khan',  spec: 'Pediatrics',       fee: 600,  icon: 'fa-solid fa-baby' },
  { name: 'Dr. Rahim Hassan', spec: 'Orthopedics',      fee: 700,  icon: 'fa-solid fa-bone' },
  { name: 'Dr. Nadia Islam',  spec: 'Neurology',        fee: 900,  icon: 'fa-solid fa-brain' },
];

const PAYMENTS = [
  { id: 'bKash',             label: 'bKash',               cls: 'pay-bkash', icon: 'fa-solid fa-wallet',         needsNumber: true,  placeholder: 'Enter bKash number',  color: '#e2136e' },
  { id: 'Nagad',             label: 'Nagad',               cls: 'pay-nagad', icon: 'fa-solid fa-wallet',         needsNumber: true,  placeholder: 'Enter Nagad number',  color: '#f0692b' },
  { id: 'Credit/Debit Card', label: 'Credit / Debit Card', cls: 'pay-card',  icon: 'fa-regular fa-credit-card',  needsNumber: false, placeholder: '',                    color: '#2563eb' },
];

export default function Appointment() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    preferred_date: '', preferred_time: '', gender: '', reason: '',
  });
  const [selDoc,        setSelDoc]        = useState(null);
  const [selPayment,    setSelPayment]    = useState(null);
  const [mobileNumber,  setMobileNumber]  = useState('');
  const [mobileError,   setMobileError]   = useState('');
  const [loading,       setLoading]       = useState(false);

  const fee   = selDoc ? selDoc.fee : 0;
  const tax   = Math.round(fee * 0.05);
  const total = fee + 50 + tax;

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePaymentSelect = (paymentId) => {
    setSelPayment(paymentId);
    setMobileNumber('');
    setMobileError('');
  };

  const selectedPaymentObj = PAYMENTS.find(p => p.id === selPayment);

  const validateMobileNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 11) return false;
    return true;
  };

  const confirmAppointment = async () => {
    const { full_name, email, phone, preferred_date, preferred_time } = form;
    if (!full_name || !email || !phone || !preferred_date || !preferred_time) {
      alert('Please fill in all required fields.'); return;
    }
    if (!selDoc)     { alert('Please select a doctor.');         return; }
    if (!selPayment) { alert('Please select a payment method.'); return; }

    // Validate mobile number for bKash/Nagad
    if (selectedPaymentObj?.needsNumber) {
      if (!mobileNumber.trim()) {
        setMobileError(`Please enter your ${selPayment} number.`);
        return;
      }
      if (!validateMobileNumber(mobileNumber)) {
        setMobileError(`Please enter a valid ${selPayment} number (11 digits).`);
        return;
      }
    }

    setLoading(true);

    const payload = {
      ...form,
      doctor:         selDoc.name,
      payment_method: selPayment,
      mobile_number:  selectedPaymentObj?.needsNumber ? mobileNumber : undefined,
      total_fee:      `৳${total}`,
    };

    const token   = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res  = await fetch(`${API}/api/payment/initiate`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.ok) {
        alert('Payment Error: ' + (data.error || 'Something went wrong.'));
        setLoading(false);
        return;
      }

      window.location.href = data.GatewayPageURL;

    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert('Could not connect to payment gateway. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
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
              <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Briefly describe your symptoms or reason for visit" />
            </div>
          </div>

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

          <div className="section-label">
            <i className="fa-solid fa-credit-card"></i> Payment Method <span style={{ color: '#ef4444' }}>*</span>
          </div>

          <div className="payment-info-banner">
            <i className="fa-solid fa-shield-halved"></i>
            Secure payment powered by SSLCommerz — supports bKash, Nagad &amp; Cards
          </div>

          <div className="payment-options">
            {PAYMENTS.map(p => (
              <div key={p.id}
                className={`payment-option ${selPayment === p.id ? 'selected' : ''}`}
                onClick={() => handlePaymentSelect(p.id)}>
                <div className={`pay-icon ${p.cls}`}><i className={p.icon}></i></div>
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          {/* ── Mobile number input for bKash / Nagad ── */}
          {selPayment && selectedPaymentObj?.needsNumber && (
            <div style={{
              marginTop: 16,
              padding: '20px',
              background: '#f9fafb',
              borderRadius: 14,
              border: `2px solid ${mobileError ? '#ef4444' : selectedPaymentObj.color}`,
              animation: 'slideDown 0.3s ease',
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: 10,
              }}>
                <i className="fa-solid fa-mobile-screen" style={{ marginRight: 8, color: selectedPaymentObj.color }}></i>
                {selPayment} Account Number <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500,
                  pointerEvents: 'none',
                }}>+880</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={e => {
                    setMobileNumber(e.target.value);
                    setMobileError('');
                  }}
                  placeholder={selectedPaymentObj.placeholder}
                  maxLength={14}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 56px',
                    border: `1.5px solid ${mobileError ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: 10,
                    fontSize: '1rem',
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = selectedPaymentObj.color}
                  onBlur={e => e.target.style.borderColor = mobileError ? '#ef4444' : '#d1d5db'}
                />
              </div>

              {mobileError && (
                <p style={{
                  marginTop: 8, color: '#ef4444',
                  fontSize: '0.8rem', display: 'flex',
                  alignItems: 'center', gap: 6,
                }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {mobileError}
                </p>
              )}

              <p style={{
                marginTop: 8, color: '#6b7280',
                fontSize: '0.78rem',
              }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }}></i>
                Enter the {selPayment} number you want to pay from
              </p>
            </div>
          )}

          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <button
            className="btn-submit-appt"
            onClick={confirmAppointment}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 20 }}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Redirecting to Payment...
              </>
            ) : (
              <>
                <i className="fa-solid fa-lock"></i>
                Confirm &amp; Pay Securely
              </>
            )}
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
                  <i className="fa-solid fa-check-circle"></i> Payment via {selPayment}
                  {selectedPaymentObj?.needsNumber && mobileNumber && (
                    <span style={{ display: 'block', fontSize: '0.8rem', marginTop: 4, opacity: 0.8 }}>
                      {mobileNumber}
                    </span>
                  )}
                </div>
              )}
              <div className="summary-secure">
                <i className="fa-solid fa-lock"></i> 100% Secure · Powered by SSLCommerz
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}