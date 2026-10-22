import os
import re
import hashlib
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import database
from indian_states import normalize_and_validate_state, INDIAN_STATES_AND_UTS

try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))
except ImportError:
    pass

def get_merchant_key() -> str:
    key = os.getenv("PAYU_MERCHANT_KEY", "").strip()
    return key if key else "em3wn5"

def get_merchant_salt() -> str:
    salt = os.getenv("PAYU_MERCHANT_SALT", "").strip()
    if salt:
        return salt
    key = get_merchant_key()
    if key == "gtKFFx":
        return "4R38IvwIV57FwVpsgOvTXBdLE4HUXFW"
    return "RF9zjjch2K5nieugFDrxQQPKEkUUK2EZ"

def get_frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000").strip()

# Always enforce PayU test mode URL
PAYU_MODE = "TEST"
PAYU_BASE_URL = "https://test.payu.in"
PAYU_PAYMENT_URL = f"{PAYU_BASE_URL}/_payment"

# Official Pricing Catalog matching FinWise pricing
PLAN_CATALOG: Dict[str, Dict[str, Any]] = {
    "PREMIUM_MONTHLY": {
        "id": "PREMIUM_MONTHLY",
        "tier": "PREMIUM",
        "name": "FinWise Premium Monthly",
        "amount": 299.00,
        "currency": "INR",
        "item_type": "plan",
        "period": "month",
        "description": "Unlimited AI Mentor, Scam Detection, Emotion AI, Trading Labs & Simulator"
    },
    "PREMIUM_YEARLY": {
        "id": "PREMIUM_YEARLY",
        "tier": "PREMIUM",
        "name": "FinWise Premium Yearly",
        "amount": 2799.00,
        "currency": "INR",
        "item_type": "plan",
        "period": "year",
        "description": "Full FinWise Ecosystem with 22% annual discount"
    },
    "STUDENT_MONTHLY": {
        "id": "STUDENT_MONTHLY",
        "tier": "STUDENT",
        "name": "FinWise Student Monthly",
        "amount": 149.00,
        "currency": "INR",
        "item_type": "plan",
        "period": "month",
        "description": "Unlimited Learning Modules, Story Simulations, Student Challenges"
    },
    "STUDENT_YEARLY": {
        "id": "STUDENT_YEARLY",
        "tier": "STUDENT",
        "name": "FinWise Student Yearly",
        "amount": 1399.00,
        "currency": "INR",
        "item_type": "plan",
        "period": "year",
        "description": "Annual student subscription with full academy access"
    },
    "TRADING_LABS_PASS": {
        "id": "TRADING_LABS_PASS",
        "tier": "FOUNDATION",
        "name": "Trading Labs Pass",
        "amount": 199.00,
        "currency": "INR",
        "item_type": "lab",
        "period": "lifetime",
        "description": "Unlock Stock Market Basics Lab, Candlestick Analysis, and Virtual Trading"
    }
}

def get_plan(plan_id: str) -> Optional[Dict[str, Any]]:
    # Case-insensitive or normalized lookup
    clean_id = plan_id.strip().upper()
    return PLAN_CATALOG.get(clean_id)

def generate_request_hash(
    key: str,
    txnid: str,
    amount: float,
    productinfo: str,
    firstname: str,
    email: str,
    salt: str,
    udf1: str = "",
    udf2: str = "",
    udf3: str = "",
    udf4: str = "",
    udf5: str = ""
) -> str:
    """
    Computes PayU SHA-512 request hash:
    sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
    """
    formatted_amount = f"{amount:.2f}"
    # udf6 through udf10 are empty
    elements = [
        key, txnid, formatted_amount, productinfo, firstname, email,
        udf1, udf2, udf3, udf4, udf5,
        "", "", "", "", "", # udf6 - udf10
        salt
    ]
    hash_sequence = "|".join(elements)
    return hashlib.sha512(hash_sequence.encode("utf-8")).hexdigest().lower()

def calculate_response_hash(
    salt: str,
    status: str,
    key: str,
    txnid: str,
    amount: str,
    productinfo: str,
    firstname: str,
    email: str,
    udf1: str = "",
    udf2: str = "",
    udf3: str = "",
    udf4: str = "",
    udf5: str = "",
    additional_charges: str = ""
) -> str:
    """
    Computes PayU reverse SHA-512 response hash.
    Formula with additionalCharges:
      sha512(additionalCharges|salt|status||||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    Formula without additionalCharges:
      sha512(salt|status||||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    """
    if additional_charges:
        elements = [
            additional_charges, salt, status,
            "", "", "", "", "", # udf10 - udf6
            udf5, udf4, udf3, udf2, udf1,
            email, firstname, productinfo, amount, txnid, key
        ]
    else:
        elements = [
            salt, status,
            "", "", "", "", "", # udf10 - udf6
            udf5, udf4, udf3, udf2, udf1,
            email, firstname, productinfo, amount, txnid, key
        ]
    return hashlib.sha512("|".join(elements).encode("utf-8")).hexdigest().lower()

def verify_response_hash(params: Dict[str, Any], salt: str) -> bool:
    """
    Verifies PayU SHA-512 reverse response hash.
    Tolerates PayU string normalization (e.g. whitespace preservation, stripping).
    """
    key = str(params.get("key", "")).strip()
    txnid = str(params.get("txnid", "")).strip()
    amount = str(params.get("amount", "")).strip()
    firstname = str(params.get("firstname", "")).strip()
    email = str(params.get("email", "")).strip()
    status = str(params.get("status", "")).strip()
    received_hash = str(params.get("hash", "")).strip().lower()

    udf1 = str(params.get("udf1", "")).strip()
    udf2 = str(params.get("udf2", "")).strip()
    udf3 = str(params.get("udf3", "")).strip()
    udf4 = str(params.get("udf4", "")).strip()
    udf5 = str(params.get("udf5", "")).strip()
    additional_charges = str(params.get("additionalCharges", "")).strip()

    raw_pinfo = str(params.get("productinfo", ""))
    stripped_pinfo = raw_pinfo.strip()
    clean_spaces_pinfo = " ".join(raw_pinfo.split())

    candidates = [raw_pinfo]
    if stripped_pinfo not in candidates:
        candidates.append(stripped_pinfo)
    if clean_spaces_pinfo not in candidates:
        candidates.append(clean_spaces_pinfo)

    for pinfo in candidates:
        calculated_hash = calculate_response_hash(
            salt=salt,
            status=status,
            key=key,
            txnid=txnid,
            amount=amount,
            productinfo=pinfo,
            firstname=firstname,
            email=email,
            udf1=udf1,
            udf2=udf2,
            udf3=udf3,
            udf4=udf4,
            udf5=udf5,
            additional_charges=additional_charges
        )
        if calculated_hash == received_hash:
            return True

    return False

def validate_contact_details(name: str, email: str, phone: str) -> Dict[str, str]:
    errors = {}
    name_clean = (name or "").strip()
    if not name_clean or len(name_clean) < 2:
        errors["user_name"] = "Full name must be at least 2 characters long."
    elif len(name_clean) > 70:
        errors["user_name"] = "Full name cannot exceed 70 characters."
    elif not re.match(r"^[a-zA-Z\s.'-]+$", name_clean):
        errors["user_name"] = "Full name contains invalid characters."

    email_clean = (email or "").strip()
    if not email_clean or not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email_clean):
        errors["user_email"] = "Please provide a valid email address."

    phone_clean = (phone or "").strip().replace(" ", "").replace("-", "")
    if not phone_clean or not re.match(r"^[6-9]\d{9}$", phone_clean):
        errors["user_phone"] = "Please enter a valid 10-digit Indian mobile number."

    return errors

def validate_indian_billing_address(
    address: str,
    city: str,
    state_name: str,
    pincode: str,
    country: str = "India"
) -> Dict[str, str]:
    errors = {}
    
    # Street Address: Required; at least 5 characters after trimming; max 120 chars; allowed formats
    addr_clean = (address or "").strip()
    if not addr_clean or len(addr_clean) < 5:
        errors["billing_address"] = "Street address must be at least 5 characters long."
    elif len(addr_clean) > 120:
        errors["billing_address"] = "Street address cannot exceed 120 characters."
    elif not re.match(r"^[a-zA-Z0-9\s,./#'\-&()]+$", addr_clean):
        errors["billing_address"] = "Street address contains invalid characters."

    # City: Required; 2–60 characters after trimming; allowed chars
    city_clean = (city or "").strip()
    if not city_clean or len(city_clean) < 2:
        errors["billing_city"] = "City must be at least 2 characters long."
    elif len(city_clean) > 60:
        errors["billing_city"] = "City cannot exceed 60 characters."
    elif not re.match(r"^[a-zA-Z\s.-]+$", city_clean):
        errors["billing_city"] = "City contains invalid characters."

    # State / UT: Required; validated against official 36 Indian states and union territories
    matched_state = normalize_and_validate_state(state_name)
    if not matched_state:
        errors["billing_state"] = "Please select a valid Indian State or Union Territory from the approved list."

    # PIN Code: Required; exactly six digits; ^[1-9][0-9]{5}$
    pin_clean = (pincode or "").strip()
    if not pin_clean or not re.match(r"^[1-9][0-9]{5}$", pin_clean):
        errors["billing_pincode"] = "PIN Code must be exactly 6 digits and cannot start with 0."

    # Country: Default to India; validate on server
    country_clean = (country or "India").strip()
    if country_clean.lower() != "india":
        errors["billing_country"] = "Only Indian billing addresses are supported."

    return errors

def create_payment_order(
    user_id: str,
    user_email: str,
    user_name: str,
    user_phone: str,
    plan_id: str,
    billing_address: str,
    billing_city: str,
    billing_state: str,
    billing_pincode: str,
    billing_country: str = "India",
    return_url: Optional[str] = None
) -> Dict[str, Any]:
    if not user_id or not user_id.strip():
        raise ValueError("User must be authenticated to initiate payment.")

    plan = get_plan(plan_id)
    if not plan:
        raise ValueError(f"Invalid plan ID: {plan_id}. Must be one of: {list(PLAN_CATALOG.keys())}")

    # Validate contact and billing details without any hardcoded defaults
    contact_errors = validate_contact_details(user_name, user_email, user_phone)
    if contact_errors:
        first_err = list(contact_errors.values())[0]
        raise ValueError(f"Contact validation failed: {first_err}")

    address_errors = validate_indian_billing_address(
        billing_address, billing_city, billing_state, billing_pincode, billing_country
    )
    if address_errors:
        first_err = list(address_errors.values())[0]
        raise ValueError(f"Billing address validation failed: {first_err}")

    # Generate unique transaction ID
    now_str = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand_str = uuid.uuid4().hex[:6]
    txnid = f"FW_TEST_{now_str}_{rand_str}"

    amount = plan["amount"]
    productinfo = plan["name"]
    firstname = user_name.strip().split()[0]
    email = user_email.strip()
    phone = user_phone.strip().replace(" ", "").replace("-", "")
    normalized_state = normalize_and_validate_state(billing_state) or billing_state.strip()

    # UDF mapping for contextual callback tracking
    udf1 = user_id
    udf2 = plan["id"]
    udf3 = plan["item_type"]
    udf4 = plan["tier"]
    udf5 = return_url or f"{get_frontend_url()}/settings"

    # Callback endpoints
    surl = f"{get_frontend_url()}/api/payment/callback"
    furl = f"{get_frontend_url()}/api/payment/callback"

    key = get_merchant_key()
    salt = get_merchant_salt()

    # Calculate SHA-512 request hash using merchant salt (never sent to client)
    req_hash = generate_request_hash(
        key=key,
        txnid=txnid,
        amount=amount,
        productinfo=productinfo,
        firstname=firstname,
        email=email,
        salt=salt,
        udf1=udf1,
        udf2=udf2,
        udf3=udf3,
        udf4=udf4,
        udf5=udf5
    )

    # Persist pending record in database with verified billing details
    payment_record = {
        "txnid": txnid,
        "user_id": user_id,
        "user_email": email,
        "user_name": user_name.strip(),
        "user_phone": phone,
        "billing_address": billing_address.strip(),
        "billing_city": billing_city.strip(),
        "billing_state": normalized_state,
        "billing_pincode": billing_pincode.strip(),
        "billing_country": "India",
        "plan_id": plan["id"],
        "item_type": plan["item_type"],
        "product_name": productinfo,
        "amount": amount,
        "currency": "INR",
        "status": "pending",
        "mode": "TEST"
    }
    database.create_payment(payment_record)

    return {
        "action_url": PAYU_PAYMENT_URL,
        "mode": "TEST",
        "key": key,
        "txnid": txnid,
        "amount": f"{amount:.2f}",
        "productinfo": productinfo,
        "firstname": firstname,
        "email": email,
        "phone": phone,
        "surl": surl,
        "furl": furl,
        "hash": req_hash,
        "udf1": udf1,
        "udf2": udf2,
        "udf3": udf3,
        "udf4": udf4,
        "udf5": udf5,
        "plan": plan
    }

def verify_and_process_callback(callback_data: Dict[str, Any]) -> Dict[str, Any]:
    txnid = callback_data.get("txnid", "").strip()
    if not txnid:
        raise ValueError("Missing txnid in callback payload")

    existing_payment = database.get_payment(txnid)
    if not existing_payment:
        raise ValueError(f"No payment record found for txnid: {txnid}")

    # Idempotency check: If already marked success, return cached success
    if existing_payment.get("status") == "success":
        entitlement = database.get_user_entitlement(existing_payment["user_id"])
        return {
            "verified": True,
            "status": "success",
            "message": "Payment already verified and active.",
            "payment": existing_payment,
            "entitlement": entitlement
        }

    # Verify signature
    is_valid_hash = verify_response_hash(callback_data, get_merchant_salt())
    raw_status = str(callback_data.get("status", "")).strip().lower()
    payu_id = callback_data.get("mihpayid") or callback_data.get("payuMoneyId") or ""
    bank_ref = callback_data.get("bank_ref_num") or callback_data.get("bankcode") or ""
    error_msg = callback_data.get("error_Message") or callback_data.get("unmappedstatus") or ""

    if not is_valid_hash:
        # Signature mismatch! Security violation or tampering
        database.update_payment_status(
            txnid=txnid,
            status="failure",
            error_message="Tampered signature: PayU response hash verification failed",
            raw_response=str(callback_data)
        )
        return {
            "verified": False,
            "status": "failure",
            "error": "HASH_VERIFICATION_FAILED",
            "message": "Payment signature verification failed. Access denied.",
            "payment": database.get_payment(txnid)
        }

    # Determine status
    if raw_status == "success":
        final_status = "success"
        error_msg = ""
    else:
        final_status = "failure"
        if not error_msg:
            error_msg = f"Payment status returned as {raw_status}"

    updated = database.update_payment_status(
        txnid=txnid,
        status=final_status,
        payu_id=str(payu_id),
        bank_ref_num=str(bank_ref),
        error_message=str(error_msg),
        raw_response=str(callback_data)
    )

    entitlement = database.get_user_entitlement(existing_payment["user_id"])

    return {
        "verified": True,
        "status": final_status,
        "message": "Payment processed successfully" if final_status == "success" else "Payment failed",
        "payment": updated,
        "entitlement": entitlement
    }

def simulate_test_callback(txnid: str, outcome: str = "success") -> Dict[str, Any]:
    """
    Simulates a PayU Test Callback for sandbox development and fast automated testing.
    Computes authentic PayU SHA-512 response hash with merchant salt.
    """
    payment = database.get_payment(txnid)
    if not payment:
        raise ValueError(f"Transaction {txnid} not found")

    status = "success" if outcome == "success" else "failure"
    amount = f"{payment['amount']:.2f}"
    productinfo = payment["product_name"]
    firstname = payment["user_name"].split()[0] if payment["user_name"] else "Learner"
    email = payment["user_email"]
    key = get_merchant_key()
    salt = get_merchant_salt()

    udf1 = payment["user_id"]
    udf2 = payment["plan_id"]
    udf3 = payment["item_type"]
    udf4 = "PREMIUM" if "PREMIUM" in payment["plan_id"] else "STUDENT"
    udf5 = f"{get_frontend_url()}/settings"

    # Compute reverse hash
    elements = [
        salt, status,
        "", "", "", "", "", # udf10 - udf6
        udf5, udf4, udf3, udf2, udf1,
        email, firstname, productinfo, amount, txnid, key
    ]
    res_hash = hashlib.sha512("|".join(elements).encode("utf-8")).hexdigest().lower()

    callback_params = {
        "txnid": txnid,
        "status": status,
        "amount": amount,
        "productinfo": productinfo,
        "firstname": firstname,
        "email": email,
        "key": key,
        "hash": res_hash,
        "udf1": udf1,
        "udf2": udf2,
        "udf3": udf3,
        "udf4": udf4,
        "udf5": udf5,
        "mihpayid": f"TEST_MIH_{uuid.uuid4().hex[:8]}",
        "bank_ref_num": f"TEST_BANK_{uuid.uuid4().hex[:8]}",
        "mode": "TEST_CARD"
    }
    if status == "failure":
        callback_params["error_Message"] = "Payment declined by issuing bank (Simulated Test Mode)"

    return verify_and_process_callback(callback_params)
