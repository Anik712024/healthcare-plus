import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const [params]  = useSearchParams();
  const tran_id   = params.get('tran_id') || '';
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 64, color: '#22c55e' }}></i>
        </div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.sub}>Your appointment has been confirmed.</p>
        {tran_id && (
          <div style={styles.tranBox}>
            <span style={styles.tranLabel}>Transaction ID</span>
            <span style={styles.tranId}>{tran_id}</span>
          </div>
        )}
        <p style={styles.note}>
          Please save your transaction ID for reference. Our team will contact you to confirm the appointment time.
        </p>
        <Link to="/appointment" style={styles.btn}>
          <i className="fa-regular fa-calendar-check"></i>&nbsp; Book Another Appointment
        </Link>
        <Link to="/" style={styles.btnOutline}>
          <i className="fa-solid fa-house"></i>&nbsp; Go to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card:      { background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', padding: '3rem 2.5rem', maxWidth: 480, width: '100%', textAlign: 'center' },
  iconWrap:  { marginBottom: '1.5rem' },
  title:     { fontSize: '1.8rem', fontWeight: 700, color: '#111', margin: '0 0 0.5rem' },
  sub:       { color: '#555', fontSize: '1.05rem', marginBottom: '1.5rem' },
  tranBox:   { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '0.75rem 1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 4 },
  tranLabel: { fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  tranId:    { fontSize: '0.95rem', fontWeight: 700, color: '#166534', wordBreak: 'break-all' },
  note:      { color: '#777', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' },
  btn:       { display: 'block', background: 'var(--blue, #2563eb)', color: '#fff', borderRadius: 10, padding: '0.85rem 1.5rem', fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem', transition: 'opacity 0.2s' },
  btnOutline:{ display: 'block', border: '2px solid var(--blue, #2563eb)', color: 'var(--blue, #2563eb)', borderRadius: 10, padding: '0.75rem 1.5rem', fontWeight: 600, textDecoration: 'none' },
};