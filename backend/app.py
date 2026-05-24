"""
HealthCare+ — Flask Backend
Run:  python app.py
Then open:  http://localhost:3000  (React dev server)
           http://127.0.0.1:5000  (Flask only)
"""

import os
import sqlite3
import re
from datetime import datetime
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from functools import wraps

# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DESKTOP  = r"C:\Users\DELL\Desktop"   # <-- your Windows desktop path

DB_APPOINTMENT = os.path.join(DESKTOP, "DoctorAppointment Information", "appointments.db")
DB_CONTACT     = os.path.join(DESKTOP, "Contact Information",           "contacts.db")
DB_LOGIN       = os.path.join(DESKTOP, "Login Information",             "logins.db")
DB_REGISTER    = os.path.join(DESKTOP, "Register Information",          "registrations.db")

app = Flask(__name__)
app.secret_key = "healthcare_plus_secret_2026"  # change in production

# Allow requests from React dev server
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])


# ──────────────────────────────────────────────
# HELPER — ensure DB folder + table exist
# ──────────────────────────────────────────────
def get_db(db_path: str, create_sql: str):
    folder = os.path.dirname(db_path)
    os.makedirs(folder, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute(create_sql)
    conn.commit()
    return conn


def valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))


# ──────────────────────────────────────────────
# 1. DOCTOR APPOINTMENT
# ──────────────────────────────────────────────
CREATE_APPT = """
CREATE TABLE IF NOT EXISTS appointments (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name      TEXT    NOT NULL,
    email          TEXT    NOT NULL,
    phone          TEXT    NOT NULL,
    preferred_date TEXT    NOT NULL,
    preferred_time TEXT    NOT NULL,
    gender         TEXT,
    reason         TEXT,
    doctor         TEXT    NOT NULL,
    payment_method TEXT    NOT NULL,
    total_fee      TEXT,
    submitted_at   TEXT    NOT NULL
)
"""

@app.route("/api/appointment", methods=["POST"])
def save_appointment():
    data = request.get_json(force=True)
    required = ["full_name", "email", "phone", "preferred_date",
                "preferred_time", "doctor", "payment_method"]
    for field in required:
        if not data.get(field, "").strip():
            return jsonify({"ok": False, "error": f"Missing field: {field}"}), 400
    if not valid_email(data["email"]):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400
    try:
        conn = get_db(DB_APPOINTMENT, CREATE_APPT)
        conn.execute("""
            INSERT INTO appointments
            (full_name, email, phone, preferred_date, preferred_time,
             gender, reason, doctor, payment_method, total_fee, submitted_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, (
            data["full_name"].strip(), data["email"].strip(), data["phone"].strip(),
            data["preferred_date"].strip(), data["preferred_time"].strip(),
            data.get("gender", "").strip(), data.get("reason", "").strip(),
            data["doctor"].strip(), data["payment_method"].strip(),
            data.get("total_fee", "").strip(),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit(); conn.close()
        return jsonify({"ok": True, "message": "Appointment saved successfully."})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# ──────────────────────────────────────────────
# 2. CONTACT FORM
# ──────────────────────────────────────────────
CREATE_CONTACT = """
CREATE TABLE IF NOT EXISTS contacts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name    TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT,
    subject      TEXT,
    message      TEXT NOT NULL,
    submitted_at TEXT NOT NULL
)
"""

@app.route("/api/contact", methods=["POST"])
def save_contact():
    data = request.get_json(force=True)
    for field in ["full_name", "email", "message"]:
        if not data.get(field, "").strip():
            return jsonify({"ok": False, "error": f"Missing field: {field}"}), 400
    if not valid_email(data["email"]):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400
    try:
        conn = get_db(DB_CONTACT, CREATE_CONTACT)
        conn.execute("""
            INSERT INTO contacts (full_name, email, phone, subject, message, submitted_at)
            VALUES (?,?,?,?,?,?)
        """, (
            data["full_name"].strip(), data["email"].strip(),
            data.get("phone", "").strip(), data.get("subject", "").strip(),
            data["message"].strip(), datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit(); conn.close()
        return jsonify({"ok": True, "message": "Message sent successfully."})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# ──────────────────────────────────────────────
# 3. LOGIN
# ──────────────────────────────────────────────
CREATE_LOGIN = """
CREATE TABLE IF NOT EXISTS logins (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    email        TEXT NOT NULL,
    remember_me  INTEGER NOT NULL DEFAULT 0,
    login_method TEXT NOT NULL DEFAULT 'email',
    submitted_at TEXT NOT NULL
)
"""

CREATE_REGISTER_TABLE = """
CREATE TABLE IF NOT EXISTS registrations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT NOT NULL,
    last_name     TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT,
    dob           TEXT,
    password_hash TEXT NOT NULL,
    submitted_at  TEXT NOT NULL
)
"""

def hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json(force=True)
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()
    remember = bool(data.get("remember_me", False))
    method   = data.get("method", "email")

    if not email:               return jsonify({"ok": False, "error": "Email is required."}), 400
    if not valid_email(email):  return jsonify({"ok": False, "error": "Invalid email address."}), 400

    if method == "email":
        if not password: return jsonify({"ok": False, "error": "Password is required."}), 400
        try:
            conn = get_db(DB_REGISTER, CREATE_REGISTER_TABLE)
            row  = conn.execute("SELECT * FROM registrations WHERE email = ?", (email,)).fetchone()
            conn.close()
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500
        if row is None or row["password_hash"] != hash_password(password):
            return jsonify({"ok": False, "error": "Invalid email or password."}), 401

    try:
        conn = get_db(DB_LOGIN, CREATE_LOGIN)
        conn.execute("""
            INSERT INTO logins (email, remember_me, login_method, submitted_at)
            VALUES (?,?,?,?)
        """, (email, int(remember), method, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit(); conn.close()
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

    session.permanent    = remember
    session["user_email"] = email
    return jsonify({"ok": True, "message": f"Welcome, {email}!"})


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/session")
def check_session():
    if "user_email" in session:
        return jsonify({"ok": True, "email": session["user_email"]})
    return jsonify({"ok": False})


# ──────────────────────────────────────────────
# 4. REGISTER
# ──────────────────────────────────────────────
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    required = ["first_name", "last_name", "email", "password", "confirm_password"]
    for field in required:
        if not data.get(field, "").strip():
            return jsonify({"ok": False, "error": f"Missing field: {field}"}), 400
    if not valid_email(data["email"]):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400
    if data["password"] != data["confirm_password"]:
        return jsonify({"ok": False, "error": "Confirm your selected password"}), 400
    if len(data["password"]) < 8:
        return jsonify({"ok": False, "error": "Password must be at least 8 characters."}), 400
    try:
        conn     = get_db(DB_REGISTER, CREATE_REGISTER_TABLE)
        existing = conn.execute(
            "SELECT id FROM registrations WHERE email = ?", (data["email"].strip(),)
        ).fetchone()
        if existing:
            conn.close()
            return jsonify({"ok": False, "error": "Email already registered."}), 409
        conn.execute("""
            INSERT INTO registrations
            (first_name, last_name, email, phone, dob, password_hash, submitted_at)
            VALUES (?,?,?,?,?,?,?)
        """, (
            data["first_name"].strip(), data["last_name"].strip(), data["email"].strip(),
            data.get("phone", "").strip(), data.get("dob", "").strip(),
            hash_password(data["password"]),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit(); conn.close()
        return jsonify({"ok": True, "message": "Account created! You can now log in."})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# ──────────────────────────────────────────────
# RUN
# ──────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 50)
    print("  HealthCare+ Backend running!")
    print("  API: http://127.0.0.1:5000")
    print("  Open React app: http://localhost:3000")
    print("=" * 50)
    app.run(debug=True, port=5000)