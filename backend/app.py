"""
HealthCare+ — Flask Backend  v4.0  (JWT, PostgreSQL, APK-safe, SSLCommerz Payment)
Endpoints:
  GET  /api/health
  POST /api/register
  POST /api/login
  POST /api/logout
  GET  /api/me
  POST /api/appointment
  POST /api/contact
  POST /api/forgot-password
  POST /api/verify-reset-token
  POST /api/reset-password
  POST /api/payment/initiate
  POST /api/payment/success
  POST /api/payment/fail
  POST /api/payment/cancel
  GET  /api/admin/appointments
  GET  /api/admin/contacts
"""

from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re, os, random, psycopg2, psycopg2.extras, jwt, requests, uuid
from datetime import datetime, timedelta, timezone

# ── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)

SECRET_KEY     = os.environ.get("SECRET_KEY", "change-this-in-render-env-vars")
DATABASE_URL   = os.environ.get("DATABASE_URL")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

# SSLCommerz credentials — set these in Render environment variables
SSLC_STORE_ID   = os.environ.get("SSLC_STORE_ID",   "healt6a16b774b080d")
SSLC_STORE_PASS = os.environ.get("SSLC_STORE_PASS",  "healt6a16b774b080d@ssl")
SSLC_SANDBOX    = os.environ.get("SSLC_SANDBOX",     "true").lower() == "true"

SSLC_BASE_URL = (
    "https://sandbox.sslcommerz.com"
    if SSLC_SANDBOX else
    "https://securepay.sslcommerz.com"
)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://healthcare-plus-vn1y.vercel.app")
BACKEND_URL  = os.environ.get("BACKEND_URL",  "https://healthcare-plus-api.onrender.com")

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
    conn = get_db()
    cur  = conn.cursor()

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
            tran_id        TEXT,
            payment_status TEXT DEFAULT 'pending',
            created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Add new columns if they don't exist (for existing databases)
    try:
        cur.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tran_id TEXT")
        cur.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'")
        conn.commit()
    except Exception:
        conn.rollback()

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

    conn.commit()
    cur.close()
    conn.close()


init_db()

# ── In-memory reset token store ───────────────────────────────────────────────
reset_tokens = {}

# ── Helpers ───────────────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))


def make_token(user_id: int, email: str, remember: bool = False) -> str:
    days = 30 if remember else 1
    payload = {
        "sub":   user_id,
        "email": email,
        "exp":   datetime.now(timezone.utc) + timedelta(days=days),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def current_user_id():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    payload = decode_token(auth[7:])
    return payload["sub"] if payload else None

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

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"ok": True, "service": "HealthCare+ API", "version": "4.0.0"})


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
            """INSERT INTO users (first_name, last_name, email, phone, dob, password_hash)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING id""",
            (first_name, last_name, email, phone, dob, generate_password_hash(password))
        )
        user_id = cur.fetchone()["id"]
        conn.commit()
    finally:
        cur.close(); conn.close()

    token = make_token(user_id, email)
    return jsonify({
        "ok":    True,
        "token": token,
        "user":  {"id": user_id, "first_name": first_name,
                  "last_name": last_name, "email": email},
        "message": "Account created successfully!"
    })


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
                return jsonify({"ok": False, "error": "Password is required."}), 400
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            if not user or not check_password_hash(user["password_hash"], password):
                return jsonify({"ok": False, "error": "Invalid email or password."}), 401
        else:
            return jsonify({"ok": False, "error": "Unsupported login method."}), 400
    finally:
        cur.close(); conn.close()

    token = make_token(user["id"], email, remember_me)
    return jsonify({
        "ok":    True,
        "token": token,
        "user":  {"id": user["id"], "first_name": user["first_name"],
                  "last_name": user["last_name"], "email": email},
    })


# ── Me ────────────────────────────────────────────────────────────────────────

@app.route("/api/me", methods=["GET"])
def me():
    uid = current_user_id()
    if not uid:
        return jsonify({"ok": False, "error": "Not authenticated."}), 401

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id,first_name,last_name,email,phone,dob FROM users WHERE id=%s", (uid,)
        )
        user = cur.fetchone()
    finally:
        cur.close(); conn.close()

    if not user:
        return jsonify({"ok": False, "error": "User not found."}), 404
    return jsonify({"ok": True, "user": dict(user)})


# ── Appointment (direct, non-payment) ─────────────────────────────────────────

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

    uid = current_user_id()

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO appointments
               (user_id,full_name,email,phone,preferred_date,preferred_time,
                gender,reason,doctor,payment_method,total_fee,payment_status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (uid, full_name, email, phone, preferred_date, preferred_time,
             gender, reason, doctor, payment_method, total_fee, 'confirmed')
        )
        conn.commit()
    finally:
        cur.close(); conn.close()

    return jsonify({
        "ok": True,
        "message": f"Appointment booked with {doctor} on {preferred_date} at {preferred_time}."
    })


# ── Payment: Initiate ─────────────────────────────────────────────────────────

@app.route("/api/payment/initiate", methods=["POST", "OPTIONS"])
def payment_initiate():
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
    total_fee_str  = (data.get("total_fee")      or "0").strip()

    if not all([full_name, email, phone, preferred_date, preferred_time, doctor, payment_method]):
        return jsonify({"ok": False, "error": "Please fill in all required fields."}), 400
    if not valid_email(email):
        return jsonify({"ok": False, "error": "Invalid email address."}), 400

    # Parse amount (strip ৳ sign if present)
    amount_str = total_fee_str.replace("৳", "").strip()
    try:
        amount = float(amount_str)
    except ValueError:
        return jsonify({"ok": False, "error": "Invalid fee amount."}), 400

    uid     = current_user_id()
    tran_id = "HCPLUS-" + str(uuid.uuid4()).upper()[:16]

    # Save pending appointment to DB
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO appointments
               (user_id,full_name,email,phone,preferred_date,preferred_time,
                gender,reason,doctor,payment_method,total_fee,tran_id,payment_status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               RETURNING id""",
            (uid, full_name, email, phone, preferred_date, preferred_time,
             gender, reason, doctor, payment_method, total_fee_str, tran_id, 'pending')
        )
        conn.commit()
    finally:
        cur.close(); conn.close()

    # Build SSLCommerz payload
    payload = {
        "store_id":          SSLC_STORE_ID,
        "store_passwd":      SSLC_STORE_PASS,
        "total_amount":      str(amount),
        "currency":          "BDT",
        "tran_id":           tran_id,
        "success_url":       f"{BACKEND_URL}/api/payment/success",
        "fail_url":          f"{BACKEND_URL}/api/payment/fail",
        "cancel_url":        f"{BACKEND_URL}/api/payment/cancel",
        "ipn_url":           f"{BACKEND_URL}/api/payment/ipn",
        "cus_name":          full_name,
        "cus_email":         email,
        "cus_phone":         phone,
        "cus_add1":          "Dhaka, Bangladesh",
        "cus_city":          "Dhaka",
        "cus_country":       "Bangladesh",
        "product_name":      f"Doctor Appointment - {doctor}",
        "product_category":  "Healthcare",
        "product_profile":   "general",
        "shipping_method":   "NO",
        "num_of_item":       1,
        "emi_option":        0,
    }

    try:
        resp = requests.post(
            f"{SSLC_BASE_URL}/gwprocess/v4/api.php",
            data=payload,
            timeout=30,
        )
        resp.raise_for_status()
        result = resp.json()
    except Exception as e:
        return jsonify({"ok": False, "error": f"Payment gateway error: {str(e)}"}), 502

    if result.get("status") != "SUCCESS":
        return jsonify({
            "ok":    False,
            "error": result.get("failedreason", "Payment initiation failed.")
        }), 400

    return jsonify({
        "ok":              True,
        "GatewayPageURL":  result["GatewayPageURL"],
        "tran_id":         tran_id,
    })


# ── Payment: Success callback (POST from SSLCommerz) ─────────────────────────

@app.route("/api/payment/success", methods=["POST", "GET", "OPTIONS"])
def payment_success():
    data    = request.form or request.args
    tran_id = data.get("tran_id", "")
    val_id  = data.get("val_id", "")
    status  = data.get("status", "")

    if tran_id and status == "VALID":
        # Verify with SSLCommerz
        try:
            verify_resp = requests.get(
                f"{SSLC_BASE_URL}/validator/api/validationserverAPI.php",
                params={
                    "val_id":     val_id,
                    "store_id":   SSLC_STORE_ID,
                    "store_passwd": SSLC_STORE_PASS,
                    "format":     "json",
                },
                timeout=30,
            )
            v = verify_resp.json()
            verified = v.get("status") in ("VALID", "VALIDATED")
        except Exception:
            verified = False

        new_status = "confirmed" if verified else "pending"

        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE appointments SET payment_status=%s WHERE tran_id=%s",
                (new_status, tran_id)
            )
            conn.commit()
        finally:
            cur.close(); conn.close()

    return redirect(f"{FRONTEND_URL}/appointment/success?tran_id={tran_id}")


# ── Payment: Fail callback ────────────────────────────────────────────────────

@app.route("/api/payment/fail", methods=["POST", "GET", "OPTIONS"])
def payment_fail():
    data    = request.form or request.args
    tran_id = data.get("tran_id", "")

    if tran_id:
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE appointments SET payment_status='failed' WHERE tran_id=%s",
                (tran_id,)
            )
            conn.commit()
        finally:
            cur.close(); conn.close()

    return redirect(f"{FRONTEND_URL}/appointment/fail?tran_id={tran_id}")


# ── Payment: Cancel callback ──────────────────────────────────────────────────

@app.route("/api/payment/cancel", methods=["POST", "GET", "OPTIONS"])
def payment_cancel():
    data    = request.form or request.args
    tran_id = data.get("tran_id", "")

    if tran_id:
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE appointments SET payment_status='cancelled' WHERE tran_id=%s",
                (tran_id,)
            )
            conn.commit()
        finally:
            cur.close(); conn.close()

    return redirect(f"{FRONTEND_URL}/appointment/cancel?tran_id={tran_id}")


# ── Payment: IPN (Instant Payment Notification) ───────────────────────────────

@app.route("/api/payment/ipn", methods=["POST", "OPTIONS"])
def payment_ipn():
    data    = request.form or {}
    tran_id = data.get("tran_id", "")
    status  = data.get("status", "")

    if tran_id and status == "VALID":
        conn = get_db(); cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE appointments SET payment_status='confirmed' WHERE tran_id=%s",
                (tran_id,)
            )
            conn.commit()
        finally:
            cur.close(); conn.close()

    return jsonify({"ok": True})


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
        cur.execute(
            "INSERT INTO contacts (full_name,email,phone,subject,message) VALUES (%s,%s,%s,%s,%s)",
            (full_name, email, phone, subject, message)
        )
        conn.commit()
    finally:
        cur.close(); conn.close()

    return jsonify({"ok": True, "message": "Message received. We'll get back to you soon!"})


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
    finally:
        cur.close(); conn.close()

    if not user:
        return jsonify({"ok": True, "message": "If this email exists, a reset code has been sent.", "code": ""})

    code = str(random.randint(100000, 999999))
    reset_tokens[email] = {
        "token":   code,
        "expires": datetime.now(timezone.utc) + timedelta(minutes=15),
    }

    print(f"[RESET CODE] {email} → {code}", flush=True)

    return jsonify({
        "ok":      True,
        "message": "Reset code generated.",
        "code":    code,
    })


@app.route("/api/verify-reset-token", methods=["POST", "OPTIONS"])
def verify_reset_token():
    data  = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    token = (data.get("token") or "").strip()

    entry = reset_tokens.get(email)
    if not entry:
        return jsonify({"ok": False, "error": "No reset request found. Please request a new code."}), 400

    if datetime.now(timezone.utc) > entry["expires"]:
        del reset_tokens[email]
        return jsonify({"ok": False, "error": "Code has expired. Please request a new one."}), 400

    if entry["token"] != token:
        return jsonify({"ok": False, "error": "Invalid code. Please try again."}), 400

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
        return jsonify({"ok": False, "error": "Code has expired. Please request a new one."}), 400

    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE users SET password_hash = %s WHERE email = %s",
            (generate_password_hash(password), email)
        )
        conn.commit()
    finally:
        cur.close(); conn.close()

    del reset_tokens[email]
    return jsonify({"ok": True, "message": "Password reset successfully."})


# ── Admin ─────────────────────────────────────────────────────────────────────

@app.route("/api/admin/appointments")
def admin_appointments():
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM appointments ORDER BY created_at DESC")
        rows = cur.fetchall()
    finally:
        cur.close(); conn.close()
    return jsonify({"ok": True, "appointments": [dict(r) for r in rows]})


@app.route("/api/admin/contacts")
def admin_contacts():
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM contacts ORDER BY created_at DESC")
        rows = cur.fetchall()
    finally:
        cur.close(); conn.close()
    return jsonify({"ok": True, "contacts": [dict(r) for r in rows]})


# ── Error handlers ────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(_):    return jsonify({"ok": False, "error": "Not found."}), 404

@app.errorhandler(405)
def not_allowed(_):  return jsonify({"ok": False, "error": "Method not allowed."}), 405

@app.errorhandler(500)
def server_error(e): return jsonify({"ok": False, "error": str(e)}), 500


# ── Dev entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)