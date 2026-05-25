"""
HealthCare+ — Flask Backend  (fixed for Render deployment)
Endpoints:
  GET  /api/health
  POST /api/register
  POST /api/login
  POST /api/logout
  GET  /api/me
  POST /api/appointment
  POST /api/contact
  GET  /api/admin/appointments
  GET  /api/admin/contacts
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re
import sqlite3
import os
from datetime import timedelta

# ── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "healthcare-plus-secret-2026")
app.permanent_session_lifetime = timedelta(days=30)

# ── CORS — allow ALL origins (covers Vercel, localhost, WebView/APK) ──────────
# If you want to restrict later, set the ALLOWED_ORIGIN env-var in Render
# to your exact Vercel URL e.g. https://healthcare-plus.vercel.app
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

CORS(
    app,
    supports_credentials=(ALLOWED_ORIGIN != "*"),
    origins=ALLOWED_ORIGIN,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "healthcare.db")


# ── Database helpers ──────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables once on startup."""
    conn = get_db()
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name    TEXT    NOT NULL,
            last_name     TEXT    NOT NULL,
            email         TEXT    NOT NULL UNIQUE,
            phone         TEXT,
            dob           TEXT,
            password_hash TEXT    NOT NULL,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name      TEXT NOT NULL,
            email          TEXT NOT NULL,
            phone          TEXT NOT NULL,
            preferred_date TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            gender         TEXT,
            reason         TEXT,
            doctor         TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            total_fee      TEXT NOT NULL,
            created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name  TEXT NOT NULL,
            email      TEXT NOT NULL,
            phone      TEXT,
            subject    TEXT,
            message    TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# ── Call init_db() at module level so Render (Gunicorn) creates tables ────────
init_db()


# ── Validation ────────────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))


# ── CORS preflight helper (OPTIONS) ──────────────────────────────────────────

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return _cors_response(jsonify({}), 200)


def _cors_response(response, status=200):
    origin = request.headers.get("Origin", "*")
    response.headers["Access-Control-Allow-Origin"]      = origin if ALLOWED_ORIGIN == "*" else ALLOWED_ORIGIN
    response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"]     = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true" if ALLOWED_ORIGIN != "*" else "false"
    return response, status


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "service": "HealthCare+ API", "version": "1.0.0"})


# ── Register ──────────────────────────────────────────────────────────────────

@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    data = request.get_json(force=True, silent=True) or {}

    first_name       = (data.get("first_name")       or "").strip()
    last_name        = (data.get("last_name")        or "").strip()
    email            = (data.get("email")            or "").strip().lower()
    phone            = (data.get("phone")            or "").strip()
    dob              = (data.get("dob")              or "").strip()
    password         = (data.get("password")         or "")
    confirm_password = (data.get("confirm_password") or "")

    if not all([first_name, last_name, email, password, confirm_password]):
        return jsonify({"ok": False, "error": "Please fill in all required fields."}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "error": "Please enter a valid email address."}), 400
    if password != confirm_password:
        return jsonify({"ok": False, "error": "Passwords do not match."}), 400
    if len(password) < 8:
        return jsonify({"ok": False, "error": "Password must be at least 8 characters."}), 400

    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?", (email,)
        ).fetchone()
        if existing:
            return jsonify({"ok": False, "error": "An account with this email already exists."}), 409

        conn.execute(
            """INSERT INTO users (first_name, last_name, email, phone, dob, password_hash)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (first_name, last_name, email, phone, dob,
             generate_password_hash(password))
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True, "message": "Account created successfully! You can now log in."})


# ── Login ─────────────────────────────────────────────────────────────────────

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    """
    method = "email"    → validate against DB
    method = "google"   → social (no real OAuth; auto-create user)
    method = "facebook" → same
    """
    data = request.get_json(force=True, silent=True) or {}

    email       = (data.get("email")    or "").strip().lower()
    password    = (data.get("password") or "")
    remember_me = bool(data.get("remember_me", False))
    method      = (data.get("method")   or "email").lower()

    if not email or not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400

    conn = get_db()
    try:
        if method == "email":
            if not password:
                return jsonify({"ok": False, "error": "Please fill in both fields."}), 400

            user = conn.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()

            if not user or not check_password_hash(user["password_hash"], password):
                return jsonify({"ok": False, "error": "Invalid email or password."}), 401

            session.permanent      = remember_me
            session["user_id"]     = user["id"]
            session["user_email"]  = email

            return jsonify({
                "ok":   True,
                "user": {
                    "id":         user["id"],
                    "first_name": user["first_name"],
                    "last_name":  user["last_name"],
                    "email":      user["email"],
                }
            })

        else:
            # Social login — auto-create account if first time
            user = conn.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()

            if not user:
                conn.execute(
                    """INSERT INTO users (first_name, last_name, email, phone, dob, password_hash)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    ("Social", "User", email, "", "",
                     generate_password_hash(os.urandom(24).hex()))
                )
                conn.commit()
                user = conn.execute(
                    "SELECT * FROM users WHERE email = ?", (email,)
                ).fetchone()

            session.permanent     = remember_me
            session["user_id"]    = user["id"]
            session["user_email"] = email

            return jsonify({
                "ok":     True,
                "method": method,
                "user":   {"id": user["id"], "email": user["email"]}
            })
    finally:
        conn.close()


# ── Logout ────────────────────────────────────────────────────────────────────

@app.route("/api/logout", methods=["POST", "OPTIONS"])
def logout():
    session.clear()
    return jsonify({"ok": True})


# ── Current user ──────────────────────────────────────────────────────────────

@app.route("/api/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"ok": False, "error": "Not logged in."}), 401

    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, first_name, last_name, email, phone, dob FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
    finally:
        conn.close()

    if not user:
        session.clear()
        return jsonify({"ok": False, "error": "User not found."}), 404

    return jsonify({"ok": True, "user": dict(user)})


# ── Appointment ───────────────────────────────────────────────────────────────

@app.route("/api/appointment", methods=["POST", "OPTIONS"])
def appointment():
    data = request.get_json(force=True, silent=True) or {}

    full_name      = (data.get("full_name")      or "").strip()
    email          = (data.get("email")          or "").strip().lower()
    phone          = (data.get("phone")          or "").strip()
    preferred_date = (data.get("preferred_date") or "").strip()
    preferred_time = (data.get("preferred_time") or "").strip()
    gender         = (data.get("gender")         or "").strip()
    reason         = (data.get("reason")         or "").strip()
    doctor         = (data.get("doctor")         or "").strip()
    payment_method = (data.get("payment_method") or "").strip()
    total_fee      = (data.get("total_fee")      or "").strip()

    if not all([full_name, email, phone, preferred_date, preferred_time, doctor, payment_method]):
        return jsonify({"ok": False, "error": "Please fill in all required fields."}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400

    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO appointments
               (full_name, email, phone, preferred_date, preferred_time,
                gender, reason, doctor, payment_method, total_fee)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (full_name, email, phone, preferred_date, preferred_time,
             gender, reason, doctor, payment_method, total_fee)
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({
        "ok":      True,
        "message": f"Appointment booked with {doctor} on {preferred_date} at {preferred_time}."
    })


# ── Contact ───────────────────────────────────────────────────────────────────

@app.route("/api/contact", methods=["POST", "OPTIONS"])
def contact():
    data = request.get_json(force=True, silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email     = (data.get("email")     or "").strip().lower()
    phone     = (data.get("phone")     or "").strip()
    subject   = (data.get("subject")   or "").strip()
    message   = (data.get("message")   or "").strip()

    if not all([full_name, email, message]):
        return jsonify({"ok": False, "error": "Please fill in required fields."}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400

    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO contacts (full_name, email, phone, subject, message)
               VALUES (?, ?, ?, ?, ?)""",
            (full_name, email, phone, subject, message)
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True, "message": "Message received. We'll get back to you soon!"})


# ── Admin ─────────────────────────────────────────────────────────────────────

@app.route("/api/admin/appointments", methods=["GET"])
def admin_appointments():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM appointments ORDER BY created_at DESC"
        ).fetchall()
    finally:
        conn.close()
    return jsonify({"ok": True, "appointments": [dict(r) for r in rows]})


@app.route("/api/admin/contacts", methods=["GET"])
def admin_contacts():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM contacts ORDER BY created_at DESC"
        ).fetchall()
    finally:
        conn.close()
    return jsonify({"ok": True, "contacts": [dict(r) for r in rows]})


# ── Error handlers ────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(_):
    return jsonify({"ok": False, "error": "Endpoint not found."}), 404

@app.errorhandler(405)
def method_not_allowed(_):
    return jsonify({"ok": False, "error": "Method not allowed."}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"ok": False, "error": "Internal server error.", "detail": str(e)}), 500


# ── Entry point (local dev only; Render uses Gunicorn) ───────────────────────

if __name__ == "__main__":
    print("✅  HealthCare+ API — local dev mode")
    app.run(host="0.0.0.0", port=5000, debug=True)