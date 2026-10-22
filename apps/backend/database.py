import os
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

# Try importing Firestore if available
try:
    from firebase_config import db as firestore_db
except Exception:
    firestore_db = None

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "finwise.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Payments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            txnid TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_email TEXT,
            user_name TEXT,
            user_phone TEXT,
            billing_address TEXT,
            billing_city TEXT,
            billing_state TEXT,
            billing_pincode TEXT,
            billing_country TEXT DEFAULT 'India',
            plan_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            product_name TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'INR',
            status TEXT NOT NULL DEFAULT 'pending',
            mode TEXT NOT NULL DEFAULT 'TEST',
            payu_id TEXT,
            bank_ref_num TEXT,
            error_message TEXT,
            raw_response TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')

    # Ensure all billing address columns exist in case table was created previously
    try:
        cursor.execute("PRAGMA table_info(payments)")
        existing_cols = {row[1] for row in cursor.fetchall()}
        for col_name, col_type in [
            ("billing_address", "TEXT"),
            ("billing_city", "TEXT"),
            ("billing_state", "TEXT"),
            ("billing_pincode", "TEXT"),
            ("billing_country", "TEXT DEFAULT 'India'"),
            ("receipt_number", "TEXT"),
            ("payment_method", "TEXT DEFAULT 'PayU Gateway'")
        ]:
            if col_name not in existing_cols:
                cursor.execute(f"ALTER TABLE payments ADD COLUMN {col_name} {col_type}")
    except Exception as e:
        print(f"Database schema migration warning: {e}")

    # User entitlements table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_entitlements (
            user_id TEXT PRIMARY KEY,
            user_email TEXT,
            tier TEXT NOT NULL DEFAULT 'FOUNDATION',
            plan_id TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            purchased_items TEXT NOT NULL DEFAULT '[]',
            expires_at TEXT,
            cancelled_at TEXT,
            cancellation_reason TEXT,
            auto_renew INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')

    # Migration for user_entitlements columns
    try:
        cursor.execute("PRAGMA table_info(user_entitlements)")
        existing_ent_cols = {row[1] for row in cursor.fetchall()}
        for col_name, col_type in [
            ("cancelled_at", "TEXT"),
            ("cancellation_reason", "TEXT"),
            ("auto_renew", "INTEGER DEFAULT 1")
        ]:
            if col_name not in existing_ent_cols:
                cursor.execute(f"ALTER TABLE user_entitlements ADD COLUMN {col_name} {col_type}")
    except Exception as e:
        print(f"User entitlements schema migration warning: {e}")

    # Daily feature usage tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_usage (
            user_id TEXT NOT NULL,
            usage_date TEXT NOT NULL,
            mentor_queries INTEGER NOT NULL DEFAULT 0,
            scam_scans INTEGER NOT NULL DEFAULT 0,
            emotion_scans INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (user_id, usage_date)
        )
    ''')

    conn.commit()
    conn.close()

# Auto-initialize database on import
init_db()

def create_payment(payment: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow().isoformat()
    payment_record = {
        "txnid": payment["txnid"],
        "user_id": payment["user_id"],
        "user_email": payment.get("user_email", ""),
        "user_name": payment.get("user_name", ""),
        "user_phone": payment.get("user_phone", ""),
        "billing_address": payment.get("billing_address") or None,
        "billing_city": payment.get("billing_city") or None,
        "billing_state": payment.get("billing_state") or None,
        "billing_pincode": payment.get("billing_pincode") or None,
        "billing_country": payment.get("billing_country") or None,
        "plan_id": payment["plan_id"],
        "item_type": payment.get("item_type", "plan"),
        "product_name": payment["product_name"],
        "amount": float(payment["amount"]),
        "currency": payment.get("currency", "INR"),
        "status": payment.get("status", "pending"),
        "mode": payment.get("mode", "TEST"),
        "payu_id": payment.get("payu_id") or None,
        "bank_ref_num": payment.get("bank_ref_num") or None,
        "error_message": payment.get("error_message", ""),
        "raw_response": payment.get("raw_response", ""),
        "receipt_number": payment.get("receipt_number"),
        "payment_method": payment.get("payment_method", "PayU Gateway"),
        "created_at": payment.get("created_at", now),
        "updated_at": now
    }

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO payments (
            txnid, user_id, user_email, user_name, user_phone,
            billing_address, billing_city, billing_state, billing_pincode, billing_country,
            plan_id, item_type, product_name, amount, currency, status, mode,
            payu_id, bank_ref_num, error_message, raw_response, receipt_number, payment_method,
            created_at, updated_at
        ) VALUES (
            :txnid, :user_id, :user_email, :user_name, :user_phone,
            :billing_address, :billing_city, :billing_state, :billing_pincode, :billing_country,
            :plan_id, :item_type, :product_name, :amount, :currency, :status, :mode,
            :payu_id, :bank_ref_num, :error_message, :raw_response, :receipt_number, :payment_method,
            :created_at, :updated_at
        )
    ''', payment_record)
    conn.commit()
    conn.close()

    # Mirror to Firestore if available
    if firestore_db:
        try:
            firestore_db.collection("payments").document(payment["txnid"]).set(payment_record)
        except Exception as e:
            print(f"Firestore payment sync skipped: {e}")

    return payment_record

def generate_receipt_number(txnid: str, created_at: Optional[str] = None) -> str:
    """
    Generates a clean, deterministic internal receipt number from transaction ID.
    Format: FW-REC-YYYYMMDD-XXXXXX
    """
    clean_id = txnid.replace("FW_TEST_", "").replace("FW_", "")
    parts = clean_id.split("_")
    if len(parts) >= 2 and len(parts[0]) >= 8:
        date_part = parts[0][:8]
        hash_part = parts[1][:6].upper()
        return f"FW-REC-{date_part}-{hash_part}"

    import hashlib
    h = hashlib.sha256(txnid.encode()).hexdigest()[:6].upper()
    if created_at:
        try:
            d = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            return f"FW-REC-{d.strftime('%Y%m%d')}-{h}"
        except Exception:
            pass
    date_str = datetime.utcnow().strftime("%Y%m%d")
    return f"FW-REC-{date_str}-{h}"

def get_payment(txnid: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM payments WHERE txnid = ? OR receipt_number = ?', (txnid, txnid))
    row = cursor.fetchone()
    conn.close()
    if row:
        data = dict(row)
        if data.get("status") == "success" and not data.get("receipt_number"):
            receipt_num = generate_receipt_number(data["txnid"], data.get("created_at"))
            data["receipt_number"] = receipt_num
            conn2 = get_db_connection()
            c2 = conn2.cursor()
            c2.execute('UPDATE payments SET receipt_number = ? WHERE txnid = ?', (receipt_num, data["txnid"]))
            conn2.commit()
            conn2.close()
        return data
    
    # Try Firestore
    if firestore_db:
        try:
            doc = firestore_db.collection("payments").document(txnid).get()
            if doc.exists:
                return doc.to_dict()
        except Exception:
            pass
    return None

def update_payment_status(
    txnid: str,
    status: str,
    payu_id: Optional[str] = None,
    bank_ref_num: Optional[str] = None,
    error_message: Optional[str] = None,
    raw_response: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    existing = get_payment(txnid)
    if not existing:
        return None

    now = datetime.utcnow().isoformat()
    receipt_num = generate_receipt_number(txnid, existing.get("created_at")) if status == "success" else None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE payments
        SET status = ?,
            payu_id = COALESCE(?, payu_id),
            bank_ref_num = COALESCE(?, bank_ref_num),
            error_message = COALESCE(?, error_message),
            raw_response = COALESCE(?, raw_response),
            receipt_number = COALESCE(receipt_number, ?),
            updated_at = ?
        WHERE txnid = ?
    ''', (status, payu_id, bank_ref_num, error_message, raw_response, receipt_num, now, txnid))
    conn.commit()
    conn.close()

    updated = get_payment(txnid)

    # If successful, grant user entitlement
    if status == "success" and updated:
        grant_entitlement(
            user_id=updated["user_id"],
            user_email=updated.get("user_email", ""),
            plan_id=updated["plan_id"],
            item_type=updated.get("item_type", "plan"),
            item_id=updated.get("plan_id")
        )

    # Mirror to Firestore
    if firestore_db and updated:
        try:
            firestore_db.collection("payments").document(txnid).update({
                "status": status,
                "payu_id": payu_id or updated.get("payu_id"),
                "bank_ref_num": bank_ref_num or updated.get("bank_ref_num"),
                "error_message": error_message or updated.get("error_message"),
                "receipt_number": updated.get("receipt_number"),
                "updated_at": now
            })
        except Exception as e:
            print(f"Firestore payment update skipped: {e}")

    return updated

def get_user_payments(user_id: str, email: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if email:
        cursor.execute(
            'SELECT * FROM payments WHERE user_id = ? OR user_email = ? ORDER BY created_at DESC',
            (user_id, email)
        )
    else:
        cursor.execute(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        )
    rows = cursor.fetchall()
    conn.close()
    
    payments = []
    for r in rows:
        p = dict(r)
        if p.get("status") == "success" and not p.get("receipt_number"):
            p["receipt_number"] = generate_receipt_number(p["txnid"], p.get("created_at"))
        payments.append(p)
    return payments

def get_payment_receipt(identifier: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Retrieves verified payment receipt for a given txnid or receipt_number.
    - Rejects with ValueError if payment status is not 'success'.
    - Rejects with PermissionError if authenticated user_id does not match payment owner.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM payments 
        WHERE txnid = ? OR receipt_number = ?
    ''', (identifier, identifier))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    payment = dict(row)

    # Enforce status: Receipts are only issued for successfully verified payments
    if payment["status"] != "success":
        raise ValueError(f"Cannot generate payment receipt for transaction with status '{payment['status']}'. Receipts are only available for confirmed successful payments.")

    # Enforce user authorization if user_id is provided
    if user_id and payment["user_id"] != user_id:
        raise PermissionError("Access denied: You do not have permission to view or download this receipt.")

    # Ensure receipt number is populated
    if not payment.get("receipt_number"):
        receipt_num = generate_receipt_number(payment["txnid"], payment.get("created_at"))
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('UPDATE payments SET receipt_number = ? WHERE txnid = ?', (receipt_num, payment["txnid"]))
        conn.commit()
        conn.close()
        payment["receipt_number"] = receipt_num

    return payment

def get_public_receipt_verification(identifier: str) -> Dict[str, Any]:
    """
    Public receipt verification endpoint.
    Returns MINIMAL, NON-SENSITIVE confirmation that the receipt is genuine:
    - receipt_number, masked txnid, issue_date, plan_name, amount, currency, status='PAID'
    - masked customer name and email
    Never exposes addresses, phone numbers, secret tokens, or payment credentials.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM payments 
        WHERE txnid = ? OR receipt_number = ?
    ''', (identifier, identifier))
    row = cursor.fetchone()
    conn.close()

    if not row or row["status"] != "success":
        return {
            "valid": False,
            "error": "No verified payment record found for this receipt identifier."
        }

    payment = dict(row)

    # Mask name: 'Parteek Garg' -> 'P****** G***'
    raw_name = (payment.get("user_name") or "Customer").strip()
    name_parts = raw_name.split()
    masked_name_parts = []
    for part in name_parts:
        if len(part) <= 2:
            masked_name_parts.append(part[0] + "*")
        else:
            masked_name_parts.append(part[0] + "*" * (len(part) - 2) + part[-1])
    masked_name = " ".join(masked_name_parts)

    # Mask email: 'gargparteek1907@gmail.com' -> 'g***7@gmail.com'
    raw_email = (payment.get("user_email") or "").strip()
    if "@" in raw_email:
        user_part, domain_part = raw_email.split("@", 1)
        if len(user_part) <= 2:
            masked_email = user_part[0] + "*@" + domain_part
        else:
            masked_email = user_part[0] + "*" * (len(user_part) - 2) + user_part[-1] + "@" + domain_part
    else:
        masked_email = "—"

    receipt_num = payment.get("receipt_number") or generate_receipt_number(payment["txnid"], payment.get("created_at"))

    return {
        "valid": True,
        "receipt_number": receipt_num,
        "txnid": payment["txnid"],
        "issue_date": payment["created_at"],
        "plan_name": payment["product_name"],
        "amount": payment["amount"],
        "currency": payment.get("currency", "INR"),
        "status": "PAID",
        "payment_method": payment.get("payment_method", "PayU Gateway"),
        "customer_name_masked": masked_name,
        "customer_email_masked": masked_email,
        "verification_issuer": "FinWise AI Secure Payment Gateway",
        "verified_at": datetime.utcnow().isoformat()
    }

def get_user_entitlement(user_id: str, email: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user_entitlements WHERE user_id = ?', (user_id,))
    row = cursor.fetchone()
    
    if not row and email:
        cursor.execute('SELECT * FROM user_entitlements WHERE user_email = ?', (email,))
        row = cursor.fetchone()
        
    conn.close()

    if row:
        data = dict(row)
        try:
            data["purchased_items"] = json.loads(data.get("purchased_items", "[]"))
        except Exception:
            data["purchased_items"] = []

        # Check if paid subscription period has expired
        expires_at_str = data.get("expires_at")
        if expires_at_str:
            try:
                exp_dt = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
                now_dt = datetime.utcnow()
                if exp_dt.tzinfo is not None:
                    from datetime import timezone
                    now_dt = datetime.now(timezone.utc)

                if now_dt > exp_dt:
                    # Paid period has expired
                    data["status"] = "expired"
                    data["auto_renew"] = 0
                    if data.get("tier") in ["PREMIUM", "STUDENT"]:
                        data["tier"] = "FOUNDATION"
                    
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE user_entitlements
                        SET status = 'expired', tier = ?, auto_renew = 0, updated_at = ?
                        WHERE user_id = ?
                    ''', (data["tier"], datetime.utcnow().isoformat(), user_id))
                    conn.commit()
                    conn.close()
            except Exception as e:
                print(f"Error checking entitlement expiration: {e}")

        return data

    # Default Foundation Entitlement
    now = datetime.utcnow().isoformat()
    default_entitlement = {
        "user_id": user_id,
        "user_email": email or "",
        "tier": "FOUNDATION",
        "plan_id": "FOUNDATION",
        "status": "active",
        "purchased_items": [],
        "expires_at": None,
        "cancelled_at": None,
        "cancellation_reason": None,
        "auto_renew": 0,
        "created_at": now,
        "updated_at": now
    }
    return default_entitlement

def get_latest_successful_payment(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM payments 
        WHERE user_id = ? AND status = 'success'
        ORDER BY created_at DESC 
        LIMIT 1
    ''', (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def cancel_subscription(user_id: str, reason: Optional[str] = None, feedback: Optional[str] = None) -> Dict[str, Any]:
    ent = get_user_entitlement(user_id)
    plan_id = ent.get("plan_id", "") if ent else ""
    if plan_id == "TRADING_LABS_PASS":
        raise ValueError("The Trading Labs Pass is a lifetime one-time unlock and does not have recurring renewal charges.")

    if not ent or ent.get("tier") == "FOUNDATION" or not plan_id or plan_id == "FOUNDATION":
        raise ValueError("No active paid subscription found to cancel.")

    current_status = ent.get("status", "active")
    if current_status in ["cancels_at_period_end", "cancelled"]:
        # Idempotent: subscription already flagged for cancellation
        return {
            "success": True,
            "status": "cancels_at_period_end",
            "message": "Your subscription is already scheduled for cancellation at the end of the billing period.",
            "expires_at": ent.get("expires_at"),
            "cancelled_at": ent.get("cancelled_at"),
            "auto_renew": False,
            "plan_id": plan_id
        }

    if current_status == "expired":
        raise ValueError("Subscription has already expired.")

    now_iso = datetime.utcnow().isoformat()
    combined_reason = reason or "User requested cancellation"
    if feedback and feedback.strip():
        combined_reason = f"{combined_reason} - Feedback: {feedback.strip()}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user_entitlements
        SET status = 'cancels_at_period_end',
            auto_renew = 0,
            cancelled_at = ?,
            cancellation_reason = ?,
            updated_at = ?
        WHERE user_id = ?
    ''', (now_iso, combined_reason, now_iso, user_id))
    conn.commit()
    conn.close()

    # Mirror to Firestore if available
    if firestore_db:
        try:
            firestore_db.collection("users").document(user_id).set({
                "subscription_status": "cancels_at_period_end",
                "auto_renew": False,
                "cancelled_at": now_iso,
                "cancellation_reason": combined_reason
            }, merge=True)
        except Exception as e:
            print(f"Firestore cancel update error: {e}")

    return {
        "success": True,
        "status": "cancels_at_period_end",
        "message": "Your subscription renewal has been cancelled. You will maintain full premium access until your billing period ends.",
        "expires_at": ent.get("expires_at"),
        "cancelled_at": now_iso,
        "auto_renew": False,
        "plan_id": plan_id
    }

def reactivate_subscription(user_id: str) -> Dict[str, Any]:
    ent = get_user_entitlement(user_id)
    if not ent:
        raise ValueError("Subscription not found.")

    if ent.get("status") != "cancels_at_period_end":
        if ent.get("status") == "active":
            return {"success": True, "status": "active", "message": "Subscription is already active."}
        raise ValueError(f"Cannot reactivate subscription in '{ent.get('status')}' status. Please select a plan to subscribe.")

    # Verify not yet expired
    expires_at_str = ent.get("expires_at")
    if expires_at_str:
        exp_dt = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
        now_dt = datetime.utcnow()
        if exp_dt.tzinfo is not None:
            from datetime import timezone
            now_dt = datetime.now(timezone.utc)
        if now_dt > exp_dt:
            raise ValueError("This subscription has already expired. Please subscribe to start a new billing period.")

    now_iso = datetime.utcnow().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user_entitlements
        SET status = 'active',
            auto_renew = 1,
            cancelled_at = NULL,
            cancellation_reason = NULL,
            updated_at = ?
        WHERE user_id = ?
    ''', (now_iso, user_id))
    conn.commit()
    conn.close()

    if firestore_db:
        try:
            firestore_db.collection("users").document(user_id).set({
                "subscription_status": "active",
                "auto_renew": True,
                "cancelled_at": None,
                "cancellation_reason": None
            }, merge=True)
        except Exception as e:
            print(f"Firestore reactivate error: {e}")

    return {
        "success": True,
        "status": "active",
        "message": "Your subscription has been reactivated successfully.",
        "expires_at": ent.get("expires_at")
    }

def get_subscription_details(user_id: str, email: Optional[str] = None) -> Dict[str, Any]:
    ent = get_user_entitlement(user_id, email)
    latest_payment = get_latest_successful_payment(user_id)

    tier = ent.get("tier", "FOUNDATION")
    plan_id = ent.get("plan_id", "FOUNDATION")
    status = ent.get("status", "active")
    expires_at = ent.get("expires_at")
    created_at = ent.get("created_at")
    cancelled_at = ent.get("cancelled_at")
    cancellation_reason = ent.get("cancellation_reason")
    auto_renew = bool(ent.get("auto_renew", 1 if status == "active" and tier != "FOUNDATION" else 0))

    # Pricing Catalog Info
    from payment_service import PLAN_CATALOG
    plan_meta = PLAN_CATALOG.get(plan_id or "", {})
    plan_name = plan_meta.get("name")
    if not plan_name:
        if tier == "PREMIUM":
            plan_name = "FinWise Premium"
        elif tier == "STUDENT":
            plan_name = "FinWise Student Academic Pass"
        else:
            plan_name = "Free Foundation Plan"

    amount = plan_meta.get("amount", 0.0)
    period = plan_meta.get("period", "month" if tier != "FOUNDATION" else "free")
    is_lifetime = (plan_id == "TRADING_LABS_PASS" or period == "lifetime")
    is_paid = (tier in ["PREMIUM", "STUDENT"] or is_lifetime)

    can_cancel = (is_paid and not is_lifetime and status in ["active"])
    can_reactivate = (status == "cancels_at_period_end")

    activated_at = latest_payment.get("created_at") if latest_payment else created_at

    return {
        "has_subscription": is_paid,
        "tier": tier,
        "plan_id": plan_id,
        "plan_name": plan_name,
        "status": status,
        "amount": amount,
        "currency": "INR",
        "period": period,
        "billing_model": "fixed_period_renewal",
        "is_lifetime": is_lifetime,
        "created_at": created_at,
        "activated_at": activated_at,
        "expires_at": expires_at,
        "cancelled_at": cancelled_at,
        "cancellation_reason": cancellation_reason,
        "auto_renew": auto_renew and status == "active",
        "can_cancel": can_cancel,
        "can_reactivate": can_reactivate,
        "latest_payment": latest_payment
    }


def grant_entitlement(
    user_id: str,
    user_email: str,
    plan_id: str,
    item_type: str = "plan",
    item_id: Optional[str] = None
) -> Dict[str, Any]:
    current = get_user_entitlement(user_id, user_email)
    now = datetime.utcnow()
    now_iso = now.isoformat()
    
    purchased_items = set(current.get("purchased_items", []))
    if item_id:
        purchased_items.add(item_id)

    # Determine Tier & Duration based on plan_id
    tier = current.get("tier", "FOUNDATION")
    expires_at = current.get("expires_at")

    if "PREMIUM" in plan_id:
        tier = "PREMIUM"
        # 1 month or 1 year
        if "YEARLY" in plan_id:
            expires_at = (now + timedelta(days=365)).isoformat()
        else:
            expires_at = (now + timedelta(days=30)).isoformat()
    elif "STUDENT" in plan_id:
        tier = "STUDENT"
        if "YEARLY" in plan_id:
            expires_at = (now + timedelta(days=365)).isoformat()
        else:
            expires_at = (now + timedelta(days=30)).isoformat()
    elif "LABS" in plan_id or item_type == "lab":
        purchased_items.add("lab1")
        purchased_items.add("lab2")
        purchased_items.add("simulator")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO user_entitlements (
            user_id, user_email, tier, plan_id, status, purchased_items, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, COALESCE((SELECT created_at FROM user_entitlements WHERE user_id = ?), ?), ?)
    ''', (
        user_id,
        user_email or current.get("user_email", ""),
        tier,
        plan_id,
        json.dumps(list(purchased_items)),
        expires_at,
        user_id,
        now_iso,
        now_iso
    ))
    conn.commit()
    conn.close()

    updated = {
        "user_id": user_id,
        "user_email": user_email,
        "tier": tier,
        "plan_id": plan_id,
        "status": "active",
        "purchased_items": list(purchased_items),
        "expires_at": expires_at,
        "updated_at": now_iso
    }

    # Mirror to Firestore
    if firestore_db:
        try:
            firestore_db.collection("users").document(user_id).set({
                "tier": tier,
                "plan_id": plan_id,
                "subscription_status": "active",
                "subscription_expires_at": expires_at,
                "purchased_items": list(purchased_items)
            }, merge=True)
        except Exception as e:
            print(f"Firestore entitlement sync skipped: {e}")

    return updated

def get_daily_usage(user_id: str) -> Dict[str, int]:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM daily_usage WHERE user_id = ? AND usage_date = ?', (user_id, today))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "mentor_queries": row["mentor_queries"],
            "scam_scans": row["scam_scans"],
            "emotion_scans": row["emotion_scans"],
            "date": today
        }
    return {
        "mentor_queries": 0,
        "scam_scans": 0,
        "emotion_scans": 0,
        "date": today
    }

def record_daily_usage(user_id: str, feature: str) -> int:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    column = "mentor_queries"
    if feature == "scam":
        column = "scam_scans"
    elif feature == "emotion":
        column = "emotion_scans"

    cursor.execute(f'''
        INSERT INTO daily_usage (user_id, usage_date, {column})
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, usage_date) DO UPDATE SET
            {column} = {column} + 1
    ''', (user_id, today))
    conn.commit()

    cursor.execute(f'SELECT {column} FROM daily_usage WHERE user_id = ? AND usage_date = ?', (user_id, today))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else 1

def check_feature_access(user_id: str, feature_id: str) -> Dict[str, Any]:
    entitlement = get_user_entitlement(user_id)
    tier = entitlement.get("tier", "FOUNDATION")
    purchased = entitlement.get("purchased_items", [])
    usage = get_daily_usage(user_id)

    # 1. Premium & Student have full access to learning modules
    if feature_id in ["l8", "l9", "l10", "hard_lessons"]:
        if tier in ["PREMIUM", "STUDENT"] or feature_id in purchased:
            return {"allowed": True, "tier": tier}
        return {
            "allowed": False,
            "tier": tier,
            "reason": "Hard learning modules require a Student or Premium subscription.",
            "required_tier": "STUDENT"
        }

    # 2. Live Trading Labs & Simulator
    if feature_id in ["lab1", "lab2", "simulator", "trading_labs"]:
        if tier in ["PREMIUM"] or feature_id in purchased or "TRADING_LABS_PASS" in purchased:
            return {"allowed": True, "tier": tier}
        return {
            "allowed": False,
            "tier": tier,
            "reason": "Live Trading Labs and Virtual Market Simulator require a Premium subscription or Trading Labs Pass.",
            "required_tier": "PREMIUM"
        }

    # 3. AI Mentor Queries (Free: 5/day, Premium/Student: Unlimited)
    if feature_id == "ai_mentor":
        if tier in ["PREMIUM", "STUDENT"]:
            return {"allowed": True, "tier": tier, "remaining": -1}
        used = usage["mentor_queries"]
        if used < 5:
            return {"allowed": True, "tier": tier, "remaining": 5 - used}
        return {
            "allowed": False,
            "tier": tier,
            "remaining": 0,
            "reason": "You have used your 5 free AI Mentor questions for today. Upgrade to Premium for unlimited questions.",
            "required_tier": "PREMIUM"
        }

    # 4. Scam Scans (Free: 5/day, Premium: Unlimited)
    if feature_id == "scam_detector":
        if tier in ["PREMIUM"]:
            return {"allowed": True, "tier": tier, "remaining": -1}
        used = usage["scam_scans"]
        if used < 5:
            return {"allowed": True, "tier": tier, "remaining": 5 - used}
        return {
            "allowed": False,
            "tier": tier,
            "remaining": 0,
            "reason": "You have reached your limit of 5 free scam scans today. Upgrade to Premium for unlimited threat detection.",
            "required_tier": "PREMIUM"
        }

    # 5. Emotion AI (Free: 1 trial scan/day, Premium/Student: Unlimited)
    if feature_id == "emotion_ai":
        if tier in ["PREMIUM", "STUDENT"]:
            return {"allowed": True, "tier": tier, "remaining": -1}
        used = usage["emotion_scans"]
        if used < 1:
            return {"allowed": True, "tier": tier, "remaining": 1 - used}
        return {
            "allowed": False,
            "tier": tier,
            "remaining": 0,
            "reason": "Emotion Analysis is a Premium feature. Upgrade to Premium or Student to unlock continuous psychological insights.",
            "required_tier": "PREMIUM"
        }

    return {"allowed": True, "tier": tier}

def dev_reset_user_billing(user_id: str, email: Optional[str] = None) -> Dict[str, Any]:
    """
    Developer Test Reset:
    Immediately cancels and wipes active subscriptions, resets user entitlements to FOUNDATION,
    and deletes all payment records for the user from the database so checkout can be tested again.
    """
    now_iso = datetime.utcnow().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Delete all payments for this user (by user_id or email)
    if email and email.strip():
        cursor.execute("DELETE FROM payments WHERE user_id = ? OR user_email = ?", (user_id, email.strip()))
    else:
        cursor.execute("DELETE FROM payments WHERE user_id = ?", (user_id,))
    deleted_payments = cursor.rowcount

    # 2. Reset user_entitlements to FOUNDATION
    cursor.execute('''
        INSERT OR REPLACE INTO user_entitlements (
            user_id, user_email, tier, plan_id, status, purchased_items,
            expires_at, cancelled_at, cancellation_reason, auto_renew,
            created_at, updated_at
        ) VALUES (
            ?, ?, 'FOUNDATION', 'FOUNDATION', 'active', '[]',
            NULL, ?, 'Developer test reset', 0,
            ?, ?
        )
    ''', (user_id, email or "", now_iso, now_iso, now_iso))

    # 3. Clear daily usage records for testing
    cursor.execute("DELETE FROM daily_usage WHERE user_id = ?", (user_id,))

    conn.commit()
    conn.close()

    # 3. Mirror to Firestore if available
    if firestore_db:
        try:
            firestore_db.collection("users").document(user_id).set({
                "tier": "FOUNDATION",
                "subscription_plan": "FOUNDATION",
                "subscription_status": "inactive",
                "subscription_expires_at": None,
                "auto_renew": False,
                "cancelled_at": now_iso
            }, merge=True)
        except Exception as e:
            print(f"Firestore dev reset error: {e}")

    return {
        "success": True,
        "message": "Subscription cancelled and payment history cleared for testing.",
        "deleted_payments": deleted_payments,
        "tier": "FOUNDATION",
        "status": "active"
    }

