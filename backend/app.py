"""
HealthCare+ — Flask Backend  v3.2  (JWT, PostgreSQL, SSLCommerz Payment)
"""

from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re, os, random, requests as req_lib, psycopg2, psycopg2.extras, jwt
from datetime import datetime, timedelta, timezone

# ── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)

SECRET_KEY     = os.environ.get("SECRET_KEY", "change-this-in-render-env-vars")
DATABASE_URL   = os.environ.get("DATABASE_URL")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

# SSLCommerz credentials
SSL_STORE_ID   = os.environ.get("SSL_STORE_ID",  "healt6a16b774b080d")
SSL_STORE_PASS = os.environ.get("SSL_STORE_PASS", "healt6a16b774b080d@ssl")
SSL_IS_LIVE    = os.environ.get("SSL_IS_LIVE", "false").lower() == "true"
SSL_BASE       = "https://securepay.sslcommerz.com" if SSL_IS_LIVE else "https://sandbox.sslcommerz.com"

# Frontend URL for redirects
FRONTEND_URL   = os.environ.get("FRONTEND_URL", "https://healthcare-plus-vn1y.vercel.app")

CORS(
    app,
    origins=ALLOWED_ORIGIN,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

# ── Database ──────────────────────────────────────────────────────────────────

def get_db():
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=psycopg2.extras.RealDictCursor
    )


def init_db():
    conn = get_db(); cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            SERIAL PRIMARY KEY,
            first_name    TEXT      NOT NULL,
            last_name     TEXT      NOT NULL,
            email         TEXT      NOT NULL UNIQUE,
            phone         TEXT,
            dob           TEXT,
            password_hash TEXT      NOT NULL,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id             SERIAL PRIMARY KEY,
            user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
            payment_status TEXT DEFAULT 'pending',
            tran_id        TEXT,
            val_id         TEXT,
            created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id         SERIAL PRIMARY KEY,
            full_name  TEXT NOT NULL,
            email      TEXT NOT NULL,
            phone      TEXT,
            subject    TEXT,
            message    TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit(); cur.close(); conn.close()


init_db()

# In-memory reset token store
reset_tokens = {}

# ── Helpers ───────────────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def valid_email(e): return bool(EMAIL_RE.match(e))

def make_token(user_id, email, remember=False):
    days = 30 if remember else 1
    return jwt.encode(
        {"sub": user_id, "email": email,
         "exp": datetime.now(timezone.utc) + timedelta(days=days)},
        SECRET_KEY, algorithm="HS256"
    )

def decode_token(token):
    try:    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except: return None

def current_user_id():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return None
    p = decode_token(auth[7:])
    return p["sub"] if p else None

def gen_tran_id():
    import time, random
    return f"HC{int(time.time())}{random.randint(1000,9999)}"

# ── CORS preflight ────────────────────────────────────────────────────────────

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        resp = jsonify({})
        origin = request.headers.get("Origin", "*")
        resp.headers["Access-Control-Allow-Origin"]  = origin if ALLOWED_ORIGIN == "*" else ALLOWED_ORIGIN
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return resp, 200

# ── Health ────────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"ok": True, "service": "HealthCare+ API", "version": "3.2.0"})

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
        return jsonify({"ok": False, "error": "Invalid email address."}), 400
    if password != confirm_password:
        return jsonify({"ok": False, "error": "Passwords do not match."}), 400
    if len(password) < 8:
        return jsonify({"ok": False, "error": "Password must be at least 8 characters."}), 400

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"ok": False, "error": "An account with this email already exists."}), 409
        cur.execute(
            "INSERT INTO users (first_name,last_name,email,phone,dob,password_hash) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
            (first_name, last_name, email, phone, dob, generate_password_hash(password))
        )
        user_id = cur.fetchone()["id"]; conn.commit()
    finally: cur.close(); conn.close()

    return jsonify({"ok": True, "token": make_token(user_id, email),
                    "user": {"id": user_id, "first_name": first_name, "last_name": last_name, "email": email}})

# ── Login ─────────────────────────────────────────────────────────────────────

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    email       = (data.get("email")    or "").strip().lower()
    password    = (data.get("password") or "")
    remember_me = bool(data.get("remember_me", False))
    method      = (data.get("method")   or "email").lower()

    if not email or not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400

    conn = get_db(); cur = conn.cursor()
    try:
        if method == "email":
            if not password:
                return jsonify({"ok": False, "error": "Please fill in both fields."}), 400
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            if not user or not check_password_hash(user["password_hash"], password):
                return jsonify({"ok": False, "error": "Invalid email or password."}), 401
        else:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            if not user:
                cur.execute(
                    "INSERT INTO users (first_name,last_name,email,phone,dob,password_hash) VALUES (%s,%s,%s,%s,%s,%s) RETURNING *",
                    ("Social","User",email,"","",generate_password_hash(os.urandom(24).hex()))
                )
                user = cur.fetchone(); conn.commit()

        return jsonify({"ok": True, "token": make_token(user["id"], email, remember=remember_me),
                        "user": {"id": user["id"], "first_name": user["first_name"],
                                 "last_name": user["last_name"], "email": user["email"]}})
    finally: cur.close(); conn.close()

# ── Logout ────────────────────────────────────────────────────────────────────

@app.route("/api/logout", methods=["POST", "OPTIONS"])
def logout():
    return jsonify({"ok": True})

# ── Me ────────────────────────────────────────────────────────────────────────

@app.route("/api/me")
def me():
    uid = current_user_id()
    if not uid: return jsonify({"ok": False, "error": "Not authenticated."}), 401
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT id,first_name,last_name,email,phone,dob FROM users WHERE id=%s", (uid,))
        user = cur.fetchone()
    finally: cur.close(); conn.close()
    if not user: return jsonify({"ok": False, "error": "User not found."}), 404
    return jsonify({"ok": True, "user": dict(user)})

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

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO contacts (full_name,email,phone,subject,message) VALUES (%s,%s,%s,%s,%s)",
                    (full_name, email, phone, subject, message)); conn.commit()
    finally: cur.close(); conn.close()
    return jsonify({"ok": True, "message": "Message received!"})

# ── SSLCommerz Payment ────────────────────────────────────────────────────────

@app.route("/api/payment/initiate", methods=["POST", "OPTIONS"])
def initiate_payment():
    """
    Frontend sends appointment data here.
    We save a pending appointment and redirect to SSLCommerz payment page.
    """
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
    total_fee      = int(data.get("total_fee", 0))

    if not all([full_name, email, phone, preferred_date, preferred_time, doctor, payment_method]):
        return jsonify({"ok": False, "error": "Please fill in all required fields."}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400
    if total_fee <= 0:
        return jsonify({"ok": False, "error": "Invalid payment amount."}), 400

    uid    = current_user_id()
    tran_id = gen_tran_id()

    # Save appointment as PENDING
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO appointments
               (user_id,full_name,email,phone,preferred_date,preferred_time,
                gender,reason,doctor,payment_method,total_fee,payment_status,tran_id)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending',%s)""",
            (uid, full_name, email, phone, preferred_date, preferred_time,
             gender, reason, doctor, payment_method, f"৳{total_fee}", tran_id)
        )
        conn.commit()
    finally: cur.close(); conn.close()

    # Build SSLCommerz payload
    backend_url = "https://healthcare-plus-api.onrender.com"
    ssl_payload = {
        "store_id":       SSL_STORE_ID,
        "store_passwd":   SSL_STORE_PASS,
        "total_amount":   total_fee,
        "currency":       "BDT",
        "tran_id":        tran_id,
        "success_url":    f"{backend_url}/api/payment/success",
        "fail_url":       f"{backend_url}/api/payment/fail",
        "cancel_url":     f"{backend_url}/api/payment/cancel",
        "ipn_url":        f"{backend_url}/api/payment/ipn",
        "product_name":   f"Appointment with {doctor}",
        "product_category": "Healthcare",
        "product_profile":  "general",
        "cus_name":       full_name,
        "cus_email":      email,
        "cus_phone":      phone,
        "cus_add1":       "Khulna, Bangladesh",
        "cus_city":       "Khulna",
        "cus_country":    "Bangladesh",
        "shipping_method": "NO",
        "num_of_item":    1,
        "weight_of_items": 0,
        "amount_per_unit": total_fee,
        "product_amount":  total_fee,
    }

    try:
        resp = req_lib.post(
            f"{SSL_BASE}/gwprocess/v4/api.php",
            data=ssl_payload, timeout=15
        )
        result = resp.json()
    except Exception as e:
        return jsonify({"ok": False, "error": f"Payment gateway error: {str(e)}"}), 500

    if result.get("status") != "SUCCESS":
        return jsonify({"ok": False, "error": result.get("failedreason", "Payment initiation failed.")}), 400

    return jsonify({
        "ok":           True,
        "payment_url":  result["GatewayPageURL"],
        "tran_id":      tran_id,
        "session_key":  result.get("sessionkey", ""),
    })


@app.route("/api/payment/success", methods=["GET", "POST"])
def payment_success():
    """SSLCommerz redirects here after successful payment."""
    tran_id = request.values.get("tran_id", "")
    val_id  = request.values.get("val_id",  "")
    amount  = request.values.get("amount",  "")
    status  = request.values.get("status",  "")

    if tran_id and status == "VALID":
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE appointments SET payment_status='paid', val_id=%s WHERE tran_id=%s",
                (val_id, tran_id)
            ); conn.commit()
        finally: cur.close(); conn.close()

    return redirect(f"{FRONTEND_URL}/appointment?payment=success&tran_id={tran_id}&amount={amount}")


@app.route("/api/payment/fail", methods=["GET", "POST"])
def payment_fail():
    """SSLCommerz redirects here on payment failure."""
    tran_id = request.values.get("tran_id", "")
    if tran_id:
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute("UPDATE appointments SET payment_status='failed' WHERE tran_id=%s", (tran_id,))
            conn.commit()
        finally: cur.close(); conn.close()
    return redirect(f"{FRONTEND_URL}/appointment?payment=failed")


@app.route("/api/payment/cancel", methods=["GET", "POST"])
def payment_cancel():
    """SSLCommerz redirects here when user cancels."""
    tran_id = request.values.get("tran_id", "")
    if tran_id:
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute("UPDATE appointments SET payment_status='cancelled' WHERE tran_id=%s", (tran_id,))
            conn.commit()
        finally: cur.close(); conn.close()
    return redirect(f"{FRONTEND_URL}/appointment?payment=cancelled")


@app.route("/api/payment/ipn", methods=["GET", "POST"])
def payment_ipn():
    """Instant Payment Notification from SSLCommerz."""
    tran_id = request.values.get("tran_id", "")
    val_id  = request.values.get("val_id",  "")
    status  = request.values.get("status",  "")
    if tran_id and status == "VALID":
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE appointments SET payment_status='paid', val_id=%s WHERE tran_id=%s",
                (val_id, tran_id)
            ); conn.commit()
        finally: cur.close(); conn.close()
    return jsonify({"ok": True})


# ── Forgot Password ───────────────────────────────────────────────────────────

@app.route("/api/forgot-password", methods=["POST", "OPTIONS"])
def forgot_password():
    data  = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email or not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
    finally: cur.close(); conn.close()

    if not user:
        return jsonify({"ok": True, "message": "If this email exists, a reset code has been sent.", "code": ""})

    code = str(random.randint(100000, 999999))
    reset_tokens[email] = {"token": code, "expires": datetime.now(timezone.utc) + timedelta(minutes=15)}
    print(f"[RESET CODE] {email} → {code}", flush=True)
    return jsonify({"ok": True, "message": "Reset code generated.", "code": code})


@app.route("/api/verify-reset-token", methods=["POST", "OPTIONS"])
def verify_reset_token():
    data  = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    token = (data.get("token") or "").strip()
    entry = reset_tokens.get(email)
    if not entry:
        return jsonify({"ok": False, "error": "No reset request found."}), 400
    if datetime.now(timezone.utc) > entry["expires"]:
        del reset_tokens[email]
        return jsonify({"ok": False, "error": "Code expired. Please request a new one."}), 400
    if entry["token"] != token:
        return jsonify({"ok": False, "error": "Invalid code."}), 400
    return jsonify({"ok": True})


@app.route("/api/reset-password", methods=["POST", "OPTIONS"])
def reset_password():
    data     = request.get_json(force=True, silent=True) or {}
    email    = (data.get("email")    or "").strip().lower()
    token    = (data.get("token")    or "").strip()
    password = (data.get("password") or "")
    if not password or len(password) < 8:
        return jsonify({"ok": False, "error": "Password must be at least 8 characters."}), 400
    entry = reset_tokens.get(email)
    if not entry or entry["token"] != token:
        return jsonify({"ok": False, "error": "Invalid or expired code."}), 400
    if datetime.now(timezone.utc) > entry["expires"]:
        del reset_tokens[email]
        return jsonify({"ok": False, "error": "Code expired."}), 400
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("UPDATE users SET password_hash=%s WHERE email=%s",
                    (generate_password_hash(password), email)); conn.commit()
    finally: cur.close(); conn.close()
    del reset_tokens[email]
    return jsonify({"ok": True, "message": "Password reset successfully."})

# ── Admin ─────────────────────────────────────────────────────────────────────

@app.route("/api/admin/appointments")
def admin_appointments():
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM appointments ORDER BY created_at DESC")
        rows = cur.fetchall()
    finally: cur.close(); conn.close()
    return jsonify({"ok": True, "appointments": [dict(r) for r in rows]})


@app.route("/api/admin/contacts")
def admin_contacts():
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM contacts ORDER BY created_at DESC")
        rows = cur.fetchall()
    finally: cur.close(); conn.close()
    return jsonify({"ok": True, "contacts": [dict(r) for r in rows]})

# ── Error handlers ────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(_):    return jsonify({"ok": False, "error": "Not found."}), 404
@app.errorhandler(405)
def not_allowed(_):  return jsonify({"ok": False, "error": "Method not allowed."}), 405
@app.errorhandler(500)
def server_error(e): return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)