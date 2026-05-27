import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentFail() {
  const [params] = useSearchParams();
  const tran_id  = params.get('tran_id') || '';
  // show same UI for /appointment/cancel route too
  const isCancelled = window.location.pathname.includes('cancel');

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <i
            className={isCancelled ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-triangle-exclamation'}
            style={{ fontSize: 64, color: isCancelled ? '#6b7280' : '#ef4444' }}
          ></i>
        </div>
        <h1 style={styles.title}>
          {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
        </h1>
        <p style={styles.sub}>
          {isCancelled
            ? 'You cancelled the payment. No money was deducted.'
            : 'Something went wrong with your payment. No money was deducted.'}
        </p>
        {tran_id && (
          <div style={styles.tranBox}>
            <span style={styles.tranLabel}>Transaction Reference</span>
            <span style={styles.tranId}>{tran_id}</span>
          </div>
        )}
        <p style={styles.note}>
          Please try again. If money was deducted from your account, contact us with the transaction reference above.
        </p>
        <Link to="/appointment" style={styles.btn}>
          <i className="fa-solid fa-rotate-right"></i>&nbsp; Try Again
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
  tranBox:   { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.75rem 1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 4 },
  tranLabel: { fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  tranId:    { fontSize: '0.95rem', fontWeight: 700, color: '#7f1d1d', wordBreak: 'break-all' },
  note:      { color: '#777', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' },
  btn:       { display: 'block', background: 'var(--blue, #2563eb)', color: '#fff', borderRadius: 10, padding: '0.85rem 1.5rem', fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem' },
  btnOutline:{ display: 'block', border: '2px solid var(--blue, #2563eb)', color: 'var(--blue, #2563eb)', borderRadius: 10, padding: '0.75rem 1.5rem', fontWeight: 600, textDecoration: 'none' },
};