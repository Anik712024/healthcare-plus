import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; }
    html, body { width: 100%; overflow-x: hidden; }
    body { background: #f0f4f8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

    /* Vite's default scaffold puts max-width:1280px + margin:0 auto on #root, which is what
       was causing the equal dead space on both sides — this forces it back to full-bleed. */
    #root { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes slideIn  { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }

    .fade-up   { animation: fadeUp 0.35s cubic-bezier(.22,.68,0,1.2) both; }
    .fade-in   { animation: fadeIn 0.25s ease both; }

    input:focus, select:focus, textarea:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
      outline: none;
    }
    button:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    .nav-btn:hover  { background: #eef2ff !important; color: #4f46e5 !important; }
    .row-hover:hover { background: #f8faff !important; }
    .del-btn:hover  { background: #fee2e2 !important; border-color: #f87171 !important; }
    .icon-btn:hover { background: #f1f5f9 !important; }
    .footer-link:hover { color: #6366f1 !important; background: #eef2ff !important; }
    .stat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.09) !important; transform: translateY(-2px); }
    .submit-btn:hover { background: #4f46e5 !important; box-shadow: 0 8px 20px rgba(99,102,241,0.4) !important; }
    .clear-btn:hover  { background: #f8fafc !important; border-color: #94a3b8 !important; }
    .show-btn:hover   { background: #eef2ff !important; color: #6366f1 !important; border-color: #c7d2fe !important; }
    .tag:hover        { opacity: 0.85; }

    tr.row-hover td { transition: background 0.12s; }
    .stat-card { transition: box-shadow 0.2s, transform 0.2s; }

    /* ── RESPONSIVE: PHONE / NARROW VIEWPORTS ──
       Above 768px nothing here applies — desktop keeps the original push-layout sidebar.
       At or below 768px the sidebar becomes a fixed slide-over panel (see .sidebar-outer /
       .sidebar-inner below) so it overlays content instead of squeezing it, with a tap-to-close
       backdrop. Header and content paddings shrink so nothing overflows a phone's viewport. */
    @media (max-width: 768px) {
      .sidebar-outer { position: fixed !important; top: 0; left: 0; height: 100vh; width: 0 !important; }
      .sidebar-outer.is-open { width: 100% !important; max-width: 280px; }
      .sidebar-inner { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(.4,0,.2,1); }
      .sidebar-outer.is-open .sidebar-inner { transform: translateX(0); }
      .sidebar-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 99; animation: fadeIn 0.2s ease; }

      .app-header { padding: 0 16px !important; }
      .app-main   { padding: 20px 16px !important; }
      .app-crumb-label { display: none; }

      .app-footer { padding: 20px 18px !important; flex-direction: column; align-items: flex-start !important; text-align: left; }
      .app-footer nav { flex-wrap: wrap; gap: 4px 2px; }

      .reg-card { padding: 22px 18px !important; }
      .reg-card > div { gap: 14px !important; }
      .footer-page-modal { padding: 24px 20px !important; }
      .confirm-modal { padding: 28px 22px !important; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════
   DATA
   Starts empty — real records should come from your backend/database.
   Expected row shape per table (id is always included as the primary key):

   Appointments → { id, Full_Name, Email, Phone_Number, Preferred_Date,
                     Preferred_Time, Gender, Reason, Doctor, Payment_Method,
                     Fee, tran_id, Status }

   Users        → { id, First_Name, Last_Name, Email, Phone_Number,
                     Date_of_Birth, Password_hash }

   Doctors      → { id, Full_Name, Speciality, Phone_Number, Email,
                     Experience, Qualifications, Consultation_Fee }

   Contacts     → { id, Full_Name, Email, Phone_Number, Subject, Message }
═══════════════════════════════════════════════════════════ */
const initialAppointments = [];
const initialUsers = [];
const initialDoctors = [];
const initialContacts = [];

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const C = {
  primary:   "#6366f1",
  primaryDk: "#4f46e5",
  primaryLt: "#eef2ff",
  primaryBd: "#c7d2fe",
  sidebar:   "#ffffff",
  sidebarMd: "#1e293b",
  footer:    "#000000",
  accent:    "#38bdf8",
  success:   "#10b981",
  successLt: "#d1fae5",
  warn:      "#f59e0b",
  warnLt:    "#fef3c7",
  danger:    "#ef4444",
  dangerLt:  "#fee2e2",
  dangerBd:  "#fca5a5",
  textPri:   "#0f172a",
  textSec:   "#475569",
  textMut:   "#94a3b8",
  border:    "#e2e8f0",
  borderLt:  "#f1f5f9",
  bg:        "#f0f4f8",
  surface:   "#ffffff",
};

/* ═══════════════════════════════════════════════════════════
   SVG ICON LIBRARY
═══════════════════════════════════════════════════════════ */
const ICONS = {
  dashboard:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  users:        <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  doctor:       <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></>,
  mail:         <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  trash:        <><path d="M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
  check:        <path d="M20 6 9 17l-5-5"/>,
  clock:        <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  calendar:     <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  patient:      <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  heart:        <path fill="currentColor" stroke="none" d="M12 21.593c-.668-.479-12-8.86-12-13.593 0-3.314 2.686-6 6-6 1.99 0 3.775.956 4.875 2.437 1.1-1.48 2.885-2.437 4.875-2.437 3.314 0 6 2.686 6 6 0 4.733-11.332 13.114-9.75 13.593z"/>,
  menu:         <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  close:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  bell:         <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  chevRight:    <path d="m9 18 6-6-6-6"/>,
  search:       <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  eye:          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:       <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  shield:       <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  activity:     <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  logout:       <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  info:         <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  plus:         <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  filter:       <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  phone:        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
  copy:         <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  list:         <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  userPlus:     <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></>,
};

const Icon = ({ name, size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline-block", flexShrink:0, ...style }}>
    {ICONS[name]}
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════ */
const Avatar = ({ name, size = 36, colors = ["#6366f1","#8b5cf6"] }) => {
  const initials = name ? name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase() : "?";
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*0.35, fontWeight:700, flexShrink:0, letterSpacing:"0.02em" }}>
      {initials}
    </div>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: { bg:"#f1f5f9", color:"#475569", border:"#e2e8f0" },
    blue:    { bg:C.primaryLt, color:C.primary, border:C.primaryBd },
    green:   { bg:C.successLt, color:"#065f46", border:"#6ee7b7" },
    yellow:  { bg:C.warnLt,    color:"#92400e", border:"#fcd34d" },
    red:     { bg:C.dangerLt,  color:"#991b1b", border:C.dangerBd },
    orange:  { bg:"#fff7ed",   color:"#9a3412", border:"#fed7aa" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
};

const SearchBar = ({ value, onChange, placeholder, onEnter }) => (
  <div style={{ position:"relative", minWidth:220 }}>
    <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.textMut, pointerEvents:"none", display:"flex" }}>
      <Icon name="search" size={14} />
    </span>
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Search…"}
      onKeyDown={e => { if (e.key === "Enter" && onEnter) onEnter(); }}
      style={{ width:"100%", padding:"9px 12px 9px 36px", border:`1px solid ${C.border}`, borderRadius:9, fontSize:13, color:C.textPri, background:C.surface, outline:"none", transition:"border-color 0.2s" }}
    />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
const ConfirmModal = ({ onConfirm, onCancel, itemName }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)", animation:"fadeIn 0.2s ease" }}>
    <div className="confirm-modal" style={{ background:C.surface, borderRadius:20, padding:"40px 44px", maxWidth:420, width:"90%", boxShadow:"0 32px 64px rgba(0,0,0,0.22)", textAlign:"center", animation:"fadeUp 0.25s ease" }}>
      <div style={{ width:60, height:60, borderRadius:"50%", background:C.dangerLt, border:`2px solid ${C.dangerBd}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:C.danger }}>
        <Icon name="trash" size={26} />
      </div>
      <h3 style={{ fontSize:19, fontWeight:700, color:C.textPri, marginBottom:10 }}>Delete Record</h3>
      <p style={{ color:C.textSec, fontSize:14, marginBottom:30, lineHeight:1.7 }}>
        Are you sure you want to delete <strong style={{ color:C.textPri }}>{itemName}</strong>?<br/>This action cannot be undone.
      </p>
      <div style={{ display:"flex", gap:12 }}>
        <button className="clear-btn" onClick={onCancel} style={{ flex:1, padding:"11px 0", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textSec, fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.2s" }}>
          Cancel
        </button>
        <button onClick={onConfirm} style={{ flex:1, padding:"11px 0", borderRadius:10, border:"none", background:C.danger, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.2s", boxShadow:"0 4px 14px rgba(239,68,68,0.35)" }}>
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
const Toast = ({ message, type = "success" }) => {
  const bg = type === "success" ? C.primaryDk : C.danger;
  const icon = type === "success" ? "check" : "info";
  const ic = type === "success" ? C.success : "#fff";
  return (
    <div style={{ position:"fixed", bottom:28, right:28, background:bg, color:"#fff", padding:"14px 20px", borderRadius:12, fontSize:13, fontWeight:500, zIndex:2000, boxShadow:"0 12px 32px rgba(0,0,0,0.22)", display:"flex", alignItems:"center", gap:12, animation:"toastIn 0.3s cubic-bezier(.22,.68,0,1.2)", maxWidth:320 }}>
      <span style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:ic, flexShrink:0 }}>
        <Icon name={icon} size={14} />
      </span>
      {message}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FOOTER PAGE MODAL  (About / Terms / Privacy / Help / Contact)
═══════════════════════════════════════════════════════════ */
const FOOTER_PAGE_CONTENT = {
  About: {
    icon: "info",
    body: "Healthcare Plus Admin Dashboard is a centralized management console built for hospital and clinic administrators. It brings appointment scheduling, patient contact records, doctor registration, and user account management into a single, streamlined workspace. The platform is designed to help administrative staff track incoming appointments, monitor payment status, manage registered patients and doctors, and respond quickly to reported symptoms — all from one secure dashboard."
  },
  Terms: {
    icon: "shield",
    body: "By accessing or using the Healthcare Plus Admin Dashboard, administrators agree to use the platform solely for legitimate hospital and clinic management purposes. Access credentials are confidential and must not be shared. All patient and appointment data displayed within this dashboard must be handled responsibly and only used for authorized administrative tasks such as scheduling, billing follow-up, and patient communication. Misuse of the dashboard, including unauthorized data export or sharing of patient records outside approved workflows, may result in suspension of access. These terms may be updated periodically, and continued use of the dashboard constitutes acceptance of the current terms."
  },
  Privacy: {
    icon: "shield",
    body: "Healthcare Plus is committed to protecting the privacy of patient and staff information processed through this admin dashboard. Data such as patient names, contact details, appointment history, and reported symptoms is stored securely and is only accessible to authorized administrative personnel. Information is never sold to third parties. Access logs are maintained to monitor dashboard usage, and administrators are expected to follow standard data-protection practices, including using strong passwords and logging out of shared devices. Any data shared with doctors or departments is limited to what is necessary for patient care coordination."
  },
  Help: {
    icon: "info",
    body: "Need assistance using the Admin Dashboard? Here are some common topics: managing appointments — view, filter, and remove appointment records from the Overview section; user accounts — review and manage registered patients from the User List section; doctor registration — add new doctors to the system through the Doctor Registration form; patient contacts — review reported symptoms and severity levels in the Contacts section. If an issue isn't resolved using the dashboard tools, reach out through the Contact page for further support."
  },
};

const FooterPageModal = ({ page, onClose, showToast }) => {
  const isContact = page === "Contact";
  const content = FOOTER_PAGE_CONTENT[page];
  const email = "support@healthcareplus.com";
  const phone = "+880 1700-000111";

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email address copied to clipboard.");
    } catch {
      showToast("Couldn't copy email — please copy manually.");
    }
  };

  const callPhone = () => {
    // tel: link hands off to the device's Phone app. On Android this opens
    // the dialer with the number already entered on the keypad.
    window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)", animation:"fadeIn 0.2s ease", padding:20 }} onClick={onClose}>
      <div className="footer-page-modal" onClick={e => e.stopPropagation()} style={{ background:C.surface, borderRadius:20, padding:"36px 40px", maxWidth:520, width:"100%", maxHeight:"80vh", overflowY:"auto", boxShadow:"0 32px 64px rgba(0,0,0,0.22)", animation:"fadeUp 0.25s ease" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:C.primaryLt, border:`1.5px solid ${C.primaryBd}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.primary, flexShrink:0 }}>
              <Icon name={isContact ? "mail" : content.icon} size={19} />
            </div>
            <h3 style={{ fontSize:19, fontWeight:800, color:C.textPri }}>{page}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ background:"none", border:`1px solid ${C.border}`, color:C.textMut, width:34, height:34, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <Icon name="close" size={14} />
          </button>
        </div>

        {isContact ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <p style={{ color:C.textSec, fontSize:14, lineHeight:1.7, marginBottom:6 }}>
              Reach out to the Healthcare Plus support team using either of the options below.
            </p>

            <button className="row-hover" onClick={copyEmail} style={{ display:"flex", alignItems:"center", gap:14, width:"100%", textAlign:"left", padding:"14px 16px", borderRadius:12, border:`1px solid ${C.border}`, background:C.surface, cursor:"pointer", transition:"background 0.12s" }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.primaryLt, color:C.primary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="mail" size={17} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMut, letterSpacing:"0.06em", textTransform:"uppercase" }}>Email</div>
                <div style={{ fontSize:14, fontWeight:600, color:C.textPri }}>{email}</div>
              </div>
              <span style={{ display:"flex", alignItems:"center", gap:6, color:C.primary, fontSize:12, fontWeight:700, flexShrink:0 }}>
                <Icon name="copy" size={13} /> Copy
              </span>
            </button>

            <button className="row-hover" onClick={callPhone} style={{ display:"flex", alignItems:"center", gap:14, width:"100%", textAlign:"left", padding:"14px 16px", borderRadius:12, border:`1px solid ${C.border}`, background:C.surface, cursor:"pointer", transition:"background 0.12s" }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.successLt, color:"#059669", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="phone" size={16} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMut, letterSpacing:"0.06em", textTransform:"uppercase" }}>Phone</div>
                <div style={{ fontSize:14, fontWeight:600, color:C.textPri }}>{phone}</div>
              </div>
              <span style={{ display:"flex", alignItems:"center", gap:6, color:"#059669", fontSize:12, fontWeight:700, flexShrink:0 }}>
                <Icon name="phone" size={13} /> Call
              </span>
            </button>

            <p style={{ color:C.textMut, fontSize:12, lineHeight:1.6, marginTop:4 }}>
              Tapping the phone number opens your device's Phone app with the number ready to dial.
            </p>
          </div>
        ) : (
          <p style={{ color:C.textSec, fontSize:14, lineHeight:1.8 }}>{content.body}</p>
        )}
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════
   STAT CARDS
═══════════════════════════════════════════════════════════ */
const StatCard = ({ icon, value, label, sub, accent }) => {
  const accents = {
    indigo: { bg:"#eef2ff", color:"#6366f1", border:"#c7d2fe", glow:"rgba(99,102,241,0.1)" },
    green:  { bg:"#d1fae5", color:"#059669", border:"#6ee7b7", glow:"rgba(5,150,105,0.1)" },
    amber:  { bg:"#fef3c7", color:"#d97706", border:"#fcd34d", glow:"rgba(217,119,6,0.1)" },
    rose:   { bg:"#fee2e2", color:"#e11d48", border:"#fca5a5", glow:"rgba(225,29,72,0.1)" },
  };
  const a = accents[accent] || accents.indigo;
  return (
    <div className="stat-card" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"22px 24px", display:"flex", alignItems:"center", gap:18, cursor:"default", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:a.glow, pointerEvents:"none" }} />
      <div style={{ width:54, height:54, borderRadius:14, background:a.bg, color:a.color, border:`1.5px solid ${a.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:28, fontWeight:800, color:C.textPri, lineHeight:1, letterSpacing:"-0.02em" }}>{value}</div>
        <div style={{ color:C.textSec, fontSize:13, marginTop:3, fontWeight:500 }}>{label}</div>
        {sub && <div style={{ color:a.color, fontSize:11, marginTop:4, fontWeight:600 }}>{sub}</div>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════════ */
const SectionHeader = ({ title, subtitle, action, icon }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, paddingBottom:22, borderBottom:`1.5px solid ${C.borderLt}`, flexWrap:"wrap", gap:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
      {icon && (
        <div style={{ width:44, height:44, borderRadius:12, background:C.primaryLt, color:C.primary, border:`1.5px solid ${C.primaryBd}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon name={icon} size={20} />
        </div>
      )}
      <div style={{ minWidth:0 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.textPri, marginBottom:3, letterSpacing:"-0.02em" }}>{title}</h1>
        <p style={{ color:C.textMut, fontSize:13, fontWeight:400 }}>{subtitle}</p>
      </div>
    </div>
    {action && <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>{action}</div>}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TABLE WRAPPER
═══════════════════════════════════════════════════════════ */
const TableWrap = ({ children, minWidth = 800 }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth }}>
        {children}
      </table>
    </div>
  </div>
);

const TH = ({ children }) => (
  <th style={{ padding:"13px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textMut, background:"#f8fafc", borderBottom:`1.5px solid ${C.border}`, whiteSpace:"nowrap", letterSpacing:"0.06em", textTransform:"uppercase" }}>
    {children}
  </th>
);
const TD = ({ children, style = {} }) => (
  <td style={{ padding:"13px 16px", fontSize:13, color:C.textSec, borderBottom:`1px solid ${C.borderLt}`, verticalAlign:"middle", ...style }}>
    {children}
  </td>
);

const EmptyRow = ({ cols, msg }) => (
  <tr>
    <td colSpan={cols} style={{ textAlign:"center", padding:"56px 20px" }}>
      <div style={{ color:C.textMut, fontSize:14 }}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:C.border }}>
          <Icon name="info" size={22} />
        </div>
        {msg}
      </div>
    </td>
  </tr>
);

/* ═══════════════════════════════════════════════════════════
   OVERVIEW SECTION
═══════════════════════════════════════════════════════════ */
const OverviewSection = ({ appointments, doctors, users, onDelete }) => {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = appointments.filter(a =>
    [a.Full_Name, a.Email, a.Doctor, a.Status].some(v => v && v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-up">
      {modal && <ConfirmModal itemName={modal.Full_Name} onConfirm={() => { onDelete(modal.id); setModal(null); }} onCancel={() => setModal(null)} />}
      <SectionHeader icon="dashboard" title="Dashboard Overview" subtitle="Hospital administration — real-time statistics and appointment log." />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:32 }}>
        <StatCard icon="doctor"   value={doctors.length} label="Total Doctors"  accent="indigo" />
        <StatCard icon="patient"  value={users.length}   label="New Patients"   accent="amber" />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:15, fontWeight:700, color:C.textPri }}>Appointment Submissions</h2>
          <p style={{ fontSize:12, color:C.textMut, marginTop:2 }}>{filtered.length} of {appointments.length} records</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search appointments…" />
        </div>
      </div>

      <TableWrap minWidth={1280}>
        <thead>
          <tr>
            {["Full_Name","Email","Phone_Number","Preferred_Date","Preferred_Time","Gender","Reason","Doctor","Payment_Method","Fee","tran_id","Status","Action"].map(h => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <EmptyRow cols={13} msg={appointments.length === 0 ? "No appointments yet." : "No appointments match your search."} />
          )}
          {filtered.map((row) => (
            <tr key={row.id} className="row-hover">
              <TD style={{ minWidth:160 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={row.Full_Name} size={32} colors={["#6366f1","#8b5cf6"]} />
                  <div style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{row.Full_Name}</div>
                </div>
              </TD>
              <TD style={{ minWidth:170 }}>
                <span style={{ fontSize:12, color:C.textSec }}>{row.Email}</span>
              </TD>
              <TD style={{ whiteSpace:"nowrap" }}>{row.Phone_Number}</TD>
              <TD style={{ minWidth:120 }}>
                <span style={{ fontWeight:600, color:C.textPri, fontSize:12 }}>{row.Preferred_Date}</span>
              </TD>
              <TD style={{ minWidth:140 }}>
                <span style={{ fontSize:12, color:C.textSec }}>{row.Preferred_Time}</span>
              </TD>
              <TD>
                <Badge variant={row.Gender === "Male" ? "blue" : "orange"}>{row.Gender}</Badge>
              </TD>
              <TD style={{ maxWidth:160, whiteSpace:"normal" }}>
                <span style={{ fontSize:12, color:C.textSec, lineHeight:1.5 }}>{row.Reason}</span>
              </TD>
              <TD style={{ minWidth:150 }}>
                <span style={{ fontWeight:600, color:C.textPri, fontSize:12 }}>{row.Doctor}</span>
              </TD>
              <TD><Badge variant="default">{row.Payment_Method}</Badge></TD>
              <TD><span style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{row.Fee}</span></TD>
              <TD>
                <code style={{ background:"#f0f4ff", padding:"3px 8px", borderRadius:6, fontSize:11, color:"#4f46e5", fontWeight:700, border:"1px solid #c7d2fe", whiteSpace:"nowrap" }}>{row.tran_id}</code>
              </TD>
              <TD>
                {row.Status === "paid"
                  ? <Badge variant="green"><Icon name="check" size={10} style={{ marginRight:3 }} />Paid</Badge>
                  : <Badge variant="yellow"><Icon name="clock" size={10} style={{ marginRight:3 }} />Pending</Badge>}
              </TD>
              <TD>
                <button className="del-btn" onClick={() => setModal(row)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", border:`1px solid ${C.dangerBd}`, background:C.dangerLt, color:C.danger, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  <Icon name="trash" size={12} /> Delete
                </button>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   USER LIST SECTION
═══════════════════════════════════════════════════════════ */
const UserListSection = ({ users, onDelete }) => {
  const [modal, setModal] = useState(null);
  const [showPwd, setShowPwd] = useState({});
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const filtered = users.filter(u =>
    [u.First_Name, u.Last_Name, u.Email, u.Phone_Number].some(v => v && v.toLowerCase().includes(search.toLowerCase()))
  );
  const avatarColors = [
    ["#6366f1","#8b5cf6"], ["#0ea5e9","#06b6d4"], ["#10b981","#34d399"],
  ];

  return (
    <div className="fade-up">
      {modal && <ConfirmModal itemName={`${modal.First_Name} ${modal.Last_Name}`} onConfirm={() => { onDelete(modal.id); setModal(null); }} onCancel={() => setModal(null)} />}
      <SectionHeader icon="users" title="User List" subtitle="Authenticated patient records and account management." action={
        <>
          <Badge variant="blue">{users.length} Users</Badge>
          <SearchBar value={query} onChange={setQuery} onEnter={() => setSearch(query)} placeholder="Search users…" />
          <button className="submit-btn" onClick={() => setSearch(query)} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:9, border:"none", background:C.primary, color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.2s", boxShadow:"0 4px 14px rgba(99,102,241,0.3)", whiteSpace:"nowrap" }}>
            <Icon name="search" size={14} /> Search
          </button>
        </>
      } />

      <TableWrap minWidth={860}>
        <thead>
          <tr>
            {["First_Name","Last_Name","Email","Phone_Number","Date of Birth","Password_hash","Action"].map(h => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <EmptyRow cols={7} msg={users.length === 0 ? "No users registered yet." : "No users match your search."} />
          )}
          {filtered.map((u, i) => (
            <tr key={u.id} className="row-hover">
              <TD style={{ minWidth:140 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={`${u.First_Name} ${u.Last_Name}`} size={34} colors={avatarColors[i % avatarColors.length]} />
                  <span style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{u.First_Name}</span>
                </div>
              </TD>
              <TD style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{u.Last_Name}</TD>
              <TD style={{ color:C.primary, fontWeight:500 }}>{u.Email}</TD>
              <TD style={{ whiteSpace:"nowrap" }}>{u.Phone_Number}</TD>
              <TD>{u.Date_of_Birth}</TD>
              <TD>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <code style={{ background:"#f8fafc", padding:"4px 10px", borderRadius:7, fontSize:12, color:C.textPri, border:`1px solid ${C.border}`, fontFamily:"monospace", letterSpacing:showPwd[u.id] ? "normal" : "0.12em", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"inline-block" }}>
                    {showPwd[u.id] ? u.Password_hash : "••••••••"}
                  </code>
                  <button className="show-btn" onClick={() => setShowPwd(p => ({...p, [u.id]: !p[u.id]}))} style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#f8fafc", border:`1px solid ${C.border}`, color:C.textSec, padding:"4px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.15s", whiteSpace:"nowrap" }}>
                    <Icon name={showPwd[u.id] ? "eyeOff" : "eye"} size={12} />
                    {showPwd[u.id] ? "Hide" : "Show"}
                  </button>
                </div>
              </TD>
              <TD>
                <button className="del-btn" onClick={() => setModal(u)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", border:`1px solid ${C.dangerBd}`, background:C.dangerLt, color:C.danger, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                  <Icon name="trash" size={12} /> Delete
                </button>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DOCTOR LIST SECTION
═══════════════════════════════════════════════════════════ */
const DoctorListSection = ({ doctors, onDelete }) => {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = doctors.filter(d =>
    [d.Full_Name, d.Speciality, d.Email, d.Phone_Number].some(v => v && v.toLowerCase().includes(search.toLowerCase()))
  );
  const avatarColors = [
    ["#6366f1","#8b5cf6"], ["#0ea5e9","#06b6d4"], ["#10b981","#34d399"], ["#f59e0b","#f97316"],
  ];

  return (
    <div className="fade-up">
      {modal && <ConfirmModal itemName={modal.Full_Name} onConfirm={() => { onDelete(modal.id); setModal(null); }} onCancel={() => setModal(null)} />}
      <SectionHeader icon="list" title="Doctor List" subtitle="All registered doctors on the Healthcare Plus platform." action={
        <>
          <Badge variant="blue">{doctors.length} Doctors</Badge>
          <SearchBar value={search} onChange={setSearch} placeholder="Search doctors…" />
        </>
      } />

      <TableWrap minWidth={1040}>
        <thead>
          <tr>
            {["Full_Name","Speciality","Phone_Number","Email","Experience","Qualifications","Consultation_Fee","Action"].map(h => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <EmptyRow cols={8} msg={doctors.length === 0 ? "No doctors registered yet." : "No doctors match your search."} />
          )}
          {filtered.map((d, i) => (
            <tr key={d.id} className="row-hover">
              <TD style={{ minWidth:160 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={d.Full_Name} size={34} colors={avatarColors[i % avatarColors.length]} />
                  <span style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{d.Full_Name}</span>
                </div>
              </TD>
              <TD><Badge variant="blue">{d.Speciality}</Badge></TD>
              <TD style={{ whiteSpace:"nowrap" }}>{d.Phone_Number}</TD>
              <TD style={{ minWidth:170 }}>
                <span style={{ fontSize:12, color:C.primary, fontWeight:500 }}>{d.Email}</span>
              </TD>
              <TD>{d.Experience}</TD>
              <TD style={{ maxWidth:200, whiteSpace:"normal" }}>
                <span style={{ fontSize:12, color:C.textSec, lineHeight:1.5 }}>{d.Qualifications}</span>
              </TD>
              <TD><span style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{d.Consultation_Fee}</span></TD>
              <TD>
                <button className="del-btn" onClick={() => setModal(d)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", border:`1px solid ${C.dangerBd}`, background:C.dangerLt, color:C.danger, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  <Icon name="trash" size={12} /> Delete
                </button>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DOCTOR REGISTRATION
═══════════════════════════════════════════════════════════ */
const DoctorRegSection = ({ onAddDoctor, onSuccess }) => {
  const blank = { name:"", speciality:"", phone:"", qualifications:"", experience:"", email:"", fee:"" };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name = "Full name is required";
    if (!form.speciality)           e.speciality = "Please select a speciality";
    if (!form.phone.trim())         e.phone = "Contact number is required";
    if (!form.qualifications.trim()) e.qualifications = "Qualifications are required";
    if (!form.fee.trim())           e.fee = "Consultation fee is required";
    else if (isNaN(Number(form.fee)) || Number(form.fee) < 0) e.fee = "Enter a valid fee amount";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAddDoctor({
      id: Date.now() + Math.random(),
      Full_Name: form.name.trim(),
      Speciality: form.speciality,
      Phone_Number: form.phone.trim(),
      Email: form.email.trim(),
      Experience: form.experience.trim(),
      Qualifications: form.qualifications.trim(),
      Consultation_Fee: form.fee.trim(),
    });
    setSubmitted(true);
    setForm(blank);
    setErrors({});
    onSuccess("Doctor registration submitted successfully!");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const field = (key, placeholder, type = "text", rows) => {
    const hasErr = !!errors[key];
    const base = { width:"100%", padding:"11px 14px", border:`1.5px solid ${hasErr ? C.danger : C.border}`, borderRadius:10, fontSize:14, color:C.textPri, background: hasErr ? "#fff9f9" : C.surface, transition:"border-color 0.2s, box-shadow 0.2s", outline:"none" };
    const props = { value:form[key], onChange:e => { setForm(p=>({...p,[key]:e.target.value})); setErrors(p=>({...p,[key]:""})); }, placeholder, style:base };
    return rows
      ? <textarea {...props} rows={rows} style={{ ...base, resize:"vertical", lineHeight:1.6 }} />
      : <input type={type} {...props} />;
  };

  const Label = ({ children, required }) => (
    <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textSec, marginBottom:7 }}>
      {children}{required && <span style={{ color:C.danger, marginLeft:3 }}>*</span>}
    </label>
  );
  const Err = ({ k }) => errors[k] ? <span style={{ fontSize:12, color:C.danger, marginTop:5, display:"block" }}>{errors[k]}</span> : null;

  const specialities = ["General Medicine","Cardiology","Pediatrics","Dermatology","Neurology","Orthopedics","Ophthalmology","ENT","Psychiatry","Oncology","Gynecology","Urology"];

  return (
    <div className="fade-up">
      <SectionHeader icon="doctor" title="Doctor Registration" subtitle="Register a new medical professional onto the Healthcare Plus platform." />

      {submitted && (
        <div style={{ background:C.successLt, border:`1.5px solid #6ee7b7`, borderRadius:12, padding:"16px 20px", marginBottom:24, color:"#065f46", fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"#6ee7b7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Icon name="check" size={14} style={{ color:"#065f46" }} />
          </div>
          Registration submitted successfully! Our admin team will review the profile shortly.
        </div>
      )}

      <div className="reg-card" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:"36px 40px", maxWidth:860, boxShadow:"0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
          <div>
            <Label required>Doctor Full Name</Label>
            {field("name","e.g. Dr. Rayhan Chowdhury")}
            <Err k="name" />
          </div>
          <div>
            <Label>Email Address</Label>
            {field("email","doctor@hospital.com","email")}
          </div>
          <div>
            <Label required>Speciality / Department</Label>
            <select value={form.speciality} onChange={e => { setForm(p=>({...p,speciality:e.target.value})); setErrors(p=>({...p,speciality:""})); }}
              style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${errors.speciality ? C.danger : C.border}`, borderRadius:10, fontSize:14, color:form.speciality ? C.textPri : C.textMut, background:C.surface, outline:"none", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:40 }}>
              <option value="">Select Speciality</option>
              {specialities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Err k="speciality" />
          </div>
          <div>
            <Label required>Contact Number</Label>
            {field("phone","+880 1XXXXXXXXX","tel")}
            <Err k="phone" />
          </div>
          <div>
            <Label>Years of Experience</Label>
            {field("experience","e.g. 8 years")}
          </div>
          <div>
            <Label required>Consultation Fee (BDT)</Label>
            {field("fee","e.g. 800","number")}
            <Err k="fee" />
          </div>
        </div>

        <div style={{ marginTop:22 }}>
          <Label required>Qualifications &amp; Experience</Label>
          {field("qualifications","e.g. MBBS, FCPS (Medicine), 5 Years in ICU Care at BSMMU…", "text", 4)}
          <Err k="qualifications" />
        </div>

        <div style={{ marginTop:28, display:"flex", gap:12, alignItems:"center" }}>
          <button className="submit-btn" onClick={handleSubmit} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:10, border:"none", background:C.primary, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.2s", boxShadow:"0 4px 14px rgba(99,102,241,0.3)", letterSpacing:"0.01em" }}>
            <Icon name="plus" size={15} /> Submit Registration
          </button>
          <button className="clear-btn" onClick={() => { setForm(blank); setErrors({}); }} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textSec, fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.2s" }}>
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   CONTACTS SECTION
═══════════════════════════════════════════════════════════ */
const ContactsSection = ({ contacts, onDelete }) => {
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c =>
    [c.Full_Name, c.Email, c.Subject].some(v => v && v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-up">
      {modal && <ConfirmModal itemName={modal.Full_Name} onConfirm={() => { onDelete(modal.id); setModal(null); }} onCancel={() => setModal(null)} />}
      <SectionHeader icon="mail" title="Patient Contact Records" subtitle="Messages submitted through the website contact form." action={
        <>
          <Badge variant="orange">{contacts.length} Records</Badge>
          <SearchBar value={search} onChange={setSearch} placeholder="Search contacts…" />
        </>
      } />

      <TableWrap minWidth={960}>
        <thead>
          <tr>
            {["Full_Name","Email","Phone_Number","Subject","Message","Action"].map(h => <TH key={h}>{h}</TH>)}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <EmptyRow cols={6} msg={contacts.length === 0 ? "No contact records yet." : "No contact records match your search."} />
          )}
          {filtered.map((c) => (
            <tr key={c.id} className="row-hover">
              <TD style={{ minWidth:150 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Avatar name={c.Full_Name} size={32} colors={["#0ea5e9","#6366f1"]} />
                  <span style={{ fontWeight:700, color:C.textPri, fontSize:13 }}>{c.Full_Name}</span>
                </div>
              </TD>
              <TD style={{ minWidth:170 }}>
                <span style={{ fontSize:12, color:C.primary, fontWeight:500 }}>{c.Email}</span>
              </TD>
              <TD style={{ whiteSpace:"nowrap" }}>{c.Phone_Number}</TD>
              <TD style={{ minWidth:140 }}>
                <span style={{ fontWeight:600, color:C.textPri, fontSize:12 }}>{c.Subject}</span>
              </TD>
              <TD style={{ maxWidth:260 }}>
                <p style={{ fontSize:12, color:C.textSec, lineHeight:1.65, margin:0 }}>
                  {expanded[c.id] ? c.Message : c.Message.slice(0,90) + (c.Message.length > 90 ? "…" : "")}
                </p>
                {c.Message.length > 90 && (
                  <button onClick={() => setExpanded(p=>({...p,[c.id]:!p[c.id]}))} style={{ background:"none", border:"none", color:C.primary, fontSize:11, fontWeight:700, cursor:"pointer", padding:"4px 0 0", display:"block" }}>
                    {expanded[c.id] ? "Show less ↑" : "Read more ↓"}
                  </button>
                )}
              </TD>
              <TD>
                <button className="del-btn" onClick={() => setModal(c)} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", border:`1px solid ${C.dangerBd}`, background:C.dangerLt, color:C.danger, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                  <Icon name="trash" size={12} /> Delete
                </button>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
const Footer = ({ onLinkClick }) => {
  const links = ["About","Contact","Terms","Privacy","Help"];
  return (
    <footer className="app-footer" style={{ background:C.footer, padding:"24px 36px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14, marginTop:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, borderRadius:9, background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(99,102,241,0.4)" }}>
          <Icon name="heart" size={14} />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#ffffff" }}>Healthcare Plus</div>
          <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>© 2026 · All rights reserved.</div>
        </div>
      </div>
      <nav style={{ display:"flex", gap:2 }}>
        {links.map((l, i) => (
          <span key={l} style={{ display:"flex", alignItems:"center" }}>
            <a href="#" onClick={e=>{ e.preventDefault(); onLinkClick(l); }} style={{ color:"#94a3b8", fontSize:13, fontWeight:500, textDecoration:"none", padding:"5px 11px", borderRadius:7, transition:"all 0.15s" }}
              onMouseOver={e=>{ e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
              onMouseOut={e=>{ e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.background="transparent"; }}
            >{l}</a>
            {i < links.length-1 && <span style={{ color:"#334155", fontSize:12 }}>·</span>}
          </span>
        ))}
      </nav>
    </footer>
  );
};

/* ═══════════════════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════════════════ */
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Please enter both email and password."); return; }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) setError("Invalid email or password.");
    else if (onLogin) onLogin();
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:"'Inter', sans-serif", padding:20 }}>
      <form onSubmit={handleSubmit} className="fade-up" style={{ width:"100%", maxWidth:380, background:C.surface, borderRadius:18, padding:"38px 34px", boxShadow:"0 20px 50px rgba(15,23,42,0.08)", border:`1px solid ${C.borderLt}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(135deg, #6366f1, #4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0 }}>
            <Icon name="shield" size={19} />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.textPri }}>Healthcare Plus</div>
            <div style={{ fontSize:11.5, color:C.textMut }}>Authority Admin Login</div>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hospital.com" autoComplete="username"
            style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:13, color:C.textPri, background:C.surface, outline:"none" }} />
        </div>
        <div style={{ marginBottom:8 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
            style={{ width:"100%", padding:"10px 13px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:13, color:C.textPri, background:C.surface, outline:"none" }} />
        </div>

        {error && <div style={{ fontSize:12, color:C.danger, marginBottom:14, marginTop:8 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width:"100%", marginTop:18, padding:"11px 0", borderRadius:10, border:"none", background:loading ? C.textMut : C.primary, color:"#fff", fontWeight:700, fontSize:13.5, cursor:loading ? "default" : "pointer", boxShadow:"0 4px 14px rgba(99,102,241,0.3)" }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
const mapAppointment = (r) => ({
  id: r.id, Full_Name: r.full_name, Email: r.email, Phone_Number: r.phone,
  Preferred_Date: r.preferred_date, Preferred_Time: r.preferred_time, Gender: r.gender,
  Reason: r.reason, Doctor: r.doctor, Payment_Method: r.payment_method,
  Fee: r.total_fee, tran_id: r.tran_id, Status: r.payment_status,
});

const mapUser = (r) => ({
  id: r.id, First_Name: r.first_name, Last_Name: r.last_name, Email: r.email,
  Phone_Number: r.phone, Date_of_Birth: r.dob, Password_hash: r.password_hash,
});

const mapDoctor = (r) => ({
  id: r.id, Full_Name: r.full_name, Speciality: r.speciality, Phone_Number: r.phone_number,
  Email: r.email, Experience: r.experience, Qualifications: r.qualifications,
  Consultation_Fee: r.consultation_fee,
});

const mapContact = (r) => ({
  id: r.id, Full_Name: r.full_name, Email: r.email, Phone_Number: r.phone,
  Subject: r.subject, Message: r.message,
});
function Dashboard({ onLogout }) {
  const [active, setActive]           = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers]             = useState([]);
  const [doctors, setDoctors]         = useState([]);
  const [contacts, setContacts]       = useState([]);
  const [toast, setToast]             = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === "undefined" || window.innerWidth > 768);
  const [isMobile, setIsMobile]       = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  const [time, setTime]               = useState(new Date());
  const [footerPage, setFooterPage]   = useState(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
  const load = async (table, mapper, setter) => {
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (!error) setter(data.map(mapper));
    else console.error(`Failed to load ${table}:`, error.message);
  };
  load("appointments", mapAppointment, setAppointments);
  load("users", mapUser, setUsers);
  load("doctors", mapDoctor, setDoctors);
  load("contacts", mapContact, setContacts);

  const channel = supabase.channel("admin-dashboard-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, (payload) => {
      if (payload.eventType === "INSERT") setAppointments(p => [mapAppointment(payload.new), ...p]);
      if (payload.eventType === "UPDATE") setAppointments(p => p.map(a => a.id === payload.new.id ? mapAppointment(payload.new) : a));
      if (payload.eventType === "DELETE") setAppointments(p => p.filter(a => a.id !== payload.old.id));
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
      if (payload.eventType === "INSERT") setUsers(p => [mapUser(payload.new), ...p]);
      if (payload.eventType === "DELETE") setUsers(p => p.filter(u => u.id !== payload.old.id));
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "doctors" }, (payload) => {
      if (payload.eventType === "INSERT") setDoctors(p => [mapDoctor(payload.new), ...p]);
      if (payload.eventType === "DELETE") setDoctors(p => p.filter(d => d.id !== payload.old.id));
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, (payload) => {
      if (payload.eventType === "INSERT") setContacts(p => [mapContact(payload.new), ...p]);
      if (payload.eventType === "DELETE") setContacts(p => p.filter(c => c.id !== payload.old.id));
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
  }, []);
  // Track viewport so the sidebar can switch between desktop push-layout and
  // mobile slide-over overlay. Closing it by default on phones keeps the
  // dashboard usable on first load instead of the panel covering everything.
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const nav = [
    { id:"overview",    label:"Overview",            icon:"dashboard", group:"Admin Dashboard" },
    { id:"users",       label:"User List",            icon:"users",     group:"User Dashboard" },
    { id:"doctorList",  label:"Doctor List",          icon:"list",      group:"User Dashboard" },
    { id:"doctor",      label:"Doctor Registration",  icon:"doctor",    group:"User Dashboard" },
    { id:"contacts",    label:"Contacts",             icon:"mail",      group:"User Dashboard" },
  ];
  const groups = [...new Set(nav.map(n => n.group))];
  const W = 262;

  const counts = {
    overview: appointments.length,
    users: users.length,
    doctorList: doctors.length,
    contacts: contacts.length,
  };

  return (
    <div style={{ fontFamily:"'Inter', -apple-system, sans-serif", display:"flex", flexDirection:"column", minHeight:"100vh", background:C.bg }}>
      {toast && <Toast message={toast} />}

      {/* ── SIDEBAR + MAIN ROW ── */}
      <div style={{ display:"flex", flex:1 }}>

        {/* ── SIDEBAR ──
            Outer <aside> is a plain flex item (no explicit height) so it always stretches to
            match the row's full natural height, however tall that grows. The INNER wrapper is
            what's actually position:sticky — that's what keeps it pinned in view for the WHOLE
            page scroll, not just the first screen. Collapsing animates the outer wrapper's width
            to 0 with overflow:hidden, while the inner wrapper keeps a fixed width so nothing
            squishes. Because the sidebar lives only in this row (not beside the footer), the
            footer below is free to span the full page width with no gap on either side. */}
        <aside className={`sidebar-outer${sidebarOpen ? " is-open" : ""}`} style={{ width:sidebarOpen ? W : 0, flexShrink:0, overflow:"hidden", zIndex:100, transition:"width 0.3s cubic-bezier(.4,0,.2,1)" }}>
          <div className="sidebar-inner" style={{ width:W, height:"100vh", position:"sticky", top:0, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", boxShadow:"2px 0 12px rgba(15,23,42,0.04)" }}>

            {/* Logo */}
            <div style={{ padding:"24px 20px 18px", borderBottom:`1px solid ${C.borderLt}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>
                  <Icon name="heart" size={19} />
                </div>
                <div>
                  <div style={{ color:C.textPri, fontSize:16, fontWeight:800, letterSpacing:"-0.02em" }}>Healthcare</div>
                  <div style={{ color:C.primaryDk, fontSize:10, fontWeight:700, letterSpacing:"0.12em" }}>PLUS · ADMIN</div>
                </div>
              </div>
            </div>

            {/* Profile chip */}
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.borderLt}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"#f8fafc", borderRadius:12, padding:"10px 12px", border:`1px solid ${C.border}` }}>
                <Avatar name="Admin User" size={34} colors={["#6366f1","#8b5cf6"]} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.textPri, fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Administrator</div>
                  <div style={{ color:C.textMut, fontSize:11, fontWeight:500 }}>Super Admin · Online</div>
                </div>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", flexShrink:0, boxShadow:"0 0 0 2px rgba(74,222,128,0.3)" }} />
              </div>
            </div>

            {/* Live clock */}
            <div style={{ padding:"10px 20px", borderBottom:`1px solid ${C.borderLt}` }}>
              <div style={{ fontSize:20, fontWeight:300, color:C.textPri, letterSpacing:"0.08em", fontVariantNumeric:"tabular-nums" }}>
                {time.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
              </div>
              <div style={{ fontSize:11, color:C.textMut, marginTop:1 }}>
                {time.toLocaleDateString("en-US", { weekday:"long", month:"short", day:"numeric" })}
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex:1, padding:"14px 12px", overflowY:"auto" }}>
              {groups.map(group => (
                <div key={group} style={{ marginBottom:22 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textMut, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 10px", marginBottom:6 }}>{group}</div>
                  {nav.filter(n => n.group === group).map(n => {
                    const isActive = active === n.id;
                    return (
                      <button key={n.id} className={isActive ? "" : "nav-btn"} onClick={() => { setActive(n.id); if (isMobile) setSidebarOpen(false); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:10, cursor:"pointer", border:"none", background:isActive ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent", color:isActive ? "#fff" : C.textSec, fontSize:13, fontWeight:isActive ? 700 : 500, marginBottom:2, transition:"all 0.18s", textAlign:"left", boxShadow:isActive ? "0 4px 14px rgba(99,102,241,0.35)" : "none" }}>
                        <Icon name={n.icon} size={15} />
                        <span style={{ flex:1 }}>{n.label}</span>
                        {counts[n.id] !== undefined && (
                          <span style={{ fontSize:10, fontWeight:700, background: isActive ? "rgba(255,255,255,0.22)" : "#eef2f7", color: isActive ? "#fff" : C.textSec, padding:"2px 7px", borderRadius:10 }}>
                            {counts[n.id]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom */}
            <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.borderLt}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 10px", color:C.textSec, fontSize:11, fontWeight:500 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#4ade80" }} />
                System Online
              </div>
              <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:9, border:`1px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                <Icon name="logout" size={14} />
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {isMobile && sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── MAIN ── */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>

          {/* Top bar */}
          <header className="app-header" style={{ background:C.surface, borderBottom:`1px solid ${C.borderLt}`, padding:"0 32px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, minWidth:0 }}>
              <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)} style={{ background:"none", border:`1px solid ${C.border}`, color:C.textMut, width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}>
                <Icon name={sidebarOpen ? "close" : "menu"} size={15} />
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, minWidth:0 }}>
                <span className="app-crumb-label" style={{ color:C.textMut }}>Dashboard</span>
                <Icon name="chevRight" size={13} className="app-crumb-label" style={{ color:C.border }} />
                <span style={{ color:C.textPri, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{nav.find(n=>n.id===active)?.label}</span>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
              <div className="app-crumb-label" style={{ padding:"6px 14px", borderRadius:20, background:`linear-gradient(135deg,${C.primaryLt},#f0f4ff)`, border:`1px solid ${C.primaryBd}`, fontSize:12, fontWeight:600, color:C.primary }}>
                {time.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
              </div>
              <button className="icon-btn" style={{ position:"relative", background:"none", border:`1px solid ${C.border}`, color:C.textMut, width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}>
                <Icon name="bell" size={15} />
                <span style={{ position:"absolute", top:9, right:9, width:7, height:7, borderRadius:"50%", background:C.danger, border:"1.5px solid #fff" }} />
              </button>
              <Avatar name="Admin User" size={36} />
            </div>
          </header>

          {/* Content */}
          <main className="app-main" style={{ flex:1, padding:"32px 36px", width:"100%" }}>
            {active === "overview"   && <OverviewSection  appointments={appointments} doctors={doctors} users={users} onDelete={async id => { const { error } = await supabase.from("appointments").delete().eq("id", id); showToast(error ? "Failed to delete appointment." : "Appointment deleted."); }} />}
            {active === "users"      && <UserListSection  users={users} onDelete={async id => { const { error } = await supabase.from("users").delete().eq("id", id); showToast(error ? "Failed to delete user." : "User deleted."); }} />}
            {active === "doctorList" && <DoctorListSection doctors={doctors} onDelete={async id => { const { error } = await supabase.from("doctors").delete().eq("id", id); showToast(error ? "Failed to remove doctor." : "Doctor removed."); }} />}
            {active === "doctor"     && <DoctorRegSection onAddDoctor={async d => { const { error } = await supabase.from("doctors").insert([{ full_name:d.Full_Name, speciality:d.Speciality, phone_number:d.Phone_Number, email:d.Email, experience:d.Experience, qualifications:d.Qualifications, consultation_fee:d.Consultation_Fee }]); if (error) showToast("Failed to register doctor."); }} onSuccess={showToast} />}
            {active === "contacts"   && <ContactsSection  contacts={contacts} onDelete={async id => { const { error } = await supabase.from("contacts").delete().eq("id", id); showToast(error ? "Failed to delete record." : "Record deleted."); }} />}
          </main>
        </div>
      </div>

      {/* ── FOOTER ── full width, outside the sidebar row, so there's no gap on either side */}
      <Footer onLinkClick={setFooterPage} />

      {footerPage && (
        <FooterPageModal page={footerPage} onClose={() => setFooterPage(null)} showToast={showToast} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTH GATE
   Checks for an active Supabase session before rendering the
   dashboard. Logged-out visitors see LoginScreen instead.
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking, null = logged out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <>
        <GlobalStyles />
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, color:C.textMut, fontFamily:"'Inter', sans-serif", fontSize:13 }}>
          Loading…
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <GlobalStyles />
        <LoginScreen onLogin={() => {}} />
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <Dashboard onLogout={() => supabase.auth.signOut()} />
    </>
  );
}