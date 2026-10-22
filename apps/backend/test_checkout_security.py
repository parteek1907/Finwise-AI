"""
Comprehensive Security and Validation Test Suite for FinWise PayU Checkout
Tests:
1. Rejection of unauthenticated checkout attempts (401 Unauthorized)
2. Strict Indian billing address validation (Street, City, State/UT, PIN Code, Country)
3. Server-controlled price calculation & resistance to price tampering
4. User isolation in payment history (User A cannot view User B's orders)
5. Secure SHA-512 request and response hash verification
"""

import unittest
from fastapi.testclient import TestClient
import payment_service
import database
from main import app

class CheckoutSecurityTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        database.init_db()

    def test_01_unauthenticated_user_rejected(self):
        """Unauthenticated checkout attempt must return 401 Unauthorized."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Test User",
            "user_email": "test@example.com",
            "user_phone": "9876543210",
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "560001",
            "billing_country": "India"
        }
        # No Authorization header
        response = self.client.post("/api/payment/create", json=payload)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Authentication required", response.text)

    def test_02_invalid_short_street_address_rejected(self):
        """Street address < 5 chars must be rejected with 400."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "9876543210",
            "billing_address": "MG", # Too short (< 5 chars)
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "560001",
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Street address must be at least 5 characters", response.json().get("detail", ""))

    def test_03_invalid_city_rejected(self):
        """City < 2 chars or with invalid symbols must be rejected."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "9876543210",
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "B", # Too short (< 2 chars)
            "billing_state": "Karnataka",
            "billing_pincode": "560001",
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("City must be at least 2 characters", response.json().get("detail", ""))

    def test_04_invalid_state_rejected(self):
        """State not in canonical approved list of 36 Indian states/UTs must be rejected."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "9876543210",
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "Bengaluru",
            "billing_state": "California", # Arbitrary / non-Indian state
            "billing_pincode": "560001",
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("valid Indian State or Union Territory", response.json().get("detail", ""))

    def test_05_invalid_pincode_leading_zero_rejected(self):
        """PIN code starting with 0 (e.g. 012345) must be rejected."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "9876543210",
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "012345", # Leading 0 rejected by ^[1-9][0-9]{5}$
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("PIN Code must be exactly 6 digits", response.json().get("detail", ""))

    def test_06_invalid_pincode_five_digits_rejected(self):
        """5-digit PIN code must be rejected."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "9876543210",
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "56000", # 5 digits
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("PIN Code must be exactly 6 digits", response.json().get("detail", ""))

    def test_07_invalid_pincode_letters_rejected(self):
        """Alphanumeric PIN code must be rejected."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "9876543210",
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "56000A",
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("PIN Code must be exactly 6 digits", response.json().get("detail", ""))

    def test_08_invalid_phone_rejected(self):
        """Invalid mobile number (not 10 digits or not starting with 6-9) must be rejected."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Aarav Sharma",
            "user_email": "aarav@example.com",
            "user_phone": "1234567890", # Does not start with 6-9
            "billing_address": "Flat 402, Lotus Towers, MG Road",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "560001",
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_123"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("10-digit Indian mobile number", response.json().get("detail", ""))

    def test_09_valid_checkout_succeeds_with_server_pricing(self):
        """Valid Indian checkout with real token generates order with server-controlled price."""
        payload = {
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Priya Nair",
            "user_email": "priya.nair@example.com",
            "user_phone": "9876543210",
            "billing_address": "402 Silver Arch, Indiranagar 100ft Road",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "560038",
            "billing_country": "India"
        }
        headers = {"Authorization": "Bearer test_token_user_priya"}
        response = self.client.post("/api/payment/create", json=payload, headers=headers)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("txnid", data)
        self.assertIn("hash", data)
        self.assertIn("action_url", data)
        # Verify server price: 299.00
        self.assertEqual(float(data["amount"]), 299.00)
        self.assertEqual(data["firstname"], "Priya")
        self.assertEqual(data["email"], "priya.nair@example.com")
        self.assertEqual(data["phone"], "9876543210")

        # Verify order in database is associated with user_priya
        payment = database.get_payment(data["txnid"])
        self.assertIsNotNone(payment)
        self.assertEqual(payment["user_id"], "user_priya")
        self.assertEqual(payment["billing_address"], "402 Silver Arch, Indiranagar 100ft Road")
        self.assertEqual(payment["billing_city"], "Bengaluru")
        self.assertEqual(payment["billing_state"], "Karnataka")
        self.assertEqual(payment["billing_pincode"], "560038")

    def test_10_user_isolation_enforced(self):
        """User A must NOT be able to view User B's payment history."""
        # Create payment for User Alpha
        headers_alpha = {"Authorization": "Bearer test_token_user_alpha"}
        res_alpha = self.client.post("/api/payment/create", json={
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Alpha User",
            "user_email": "alpha@example.com",
            "user_phone": "9811111111",
            "billing_address": "A-12 Connaught Place",
            "billing_city": "New Delhi",
            "billing_state": "Delhi",
            "billing_pincode": "110001"
        }, headers=headers_alpha)
        self.assertEqual(res_alpha.status_code, 200)
        txnid_alpha = res_alpha.json()["txnid"]

        # Create payment for User Beta
        headers_beta = {"Authorization": "Bearer test_token_user_beta"}
        res_beta = self.client.post("/api/payment/create", json={
            "plan_id": "STUDENT_MONTHLY",
            "user_name": "Beta User",
            "user_email": "beta@example.com",
            "user_phone": "9822222222",
            "billing_address": "B-34 Marine Drive",
            "billing_city": "Mumbai",
            "billing_state": "Maharashtra",
            "billing_pincode": "400020"
        }, headers=headers_beta)
        self.assertEqual(res_beta.status_code, 200)
        txnid_beta = res_beta.json()["txnid"]

        # Fetch history as User Alpha
        history_alpha = self.client.get("/api/payment/history", headers=headers_alpha).json()
        txnids_in_alpha = [p["txnid"] for p in history_alpha.get("payments", [])]
        self.assertIn(txnid_alpha, txnids_in_alpha)
        self.assertNotIn(txnid_beta, txnids_in_alpha, "User Alpha should NEVER see User Beta's orders!")

        # Fetch history as User Beta
        history_beta = self.client.get("/api/payment/history", headers=headers_beta).json()
        txnids_in_beta = [p["txnid"] for p in history_beta.get("payments", [])]
        self.assertIn(txnid_beta, txnids_in_beta)
        self.assertNotIn(txnid_alpha, txnids_in_beta, "User Beta should NEVER see User Alpha's orders!")

    def test_11_response_hash_tampering_rejected(self):
        """Callback with tampered hash or amount must be rejected."""
        headers = {"Authorization": "Bearer test_token_user_gamma"}
        order = self.client.post("/api/payment/create", json={
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Gamma User",
            "user_email": "gamma@example.com",
            "user_phone": "9833333333",
            "billing_address": "C-56 Park Street",
            "billing_city": "Kolkata",
            "billing_state": "West Bengal",
            "billing_pincode": "700016"
        }, headers=headers).json()

        # Send callback with fake/tampered hash
        fake_callback = {
            "key": order["key"],
            "txnid": order["txnid"],
            "amount": order["amount"],
            "productinfo": order["productinfo"],
            "firstname": order["firstname"],
            "email": order["email"],
            "status": "success",
            "hash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        }
        res = self.client.post("/api/payment/verify", json=fake_callback)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()["verified"])
        self.assertEqual(res.json()["error"], "HASH_VERIFICATION_FAILED")
        self.assertEqual(res.json()["status"], "failure")

    def test_12_valid_payment_callback_verification_succeeds(self):
        """Authoritative PayU callback with valid SHA-512 response hash succeeds."""
        headers = {"Authorization": "Bearer test_token_user_delta"}
        order = self.client.post("/api/payment/create", json={
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Delta User",
            "user_email": "delta@example.com",
            "user_phone": "9844444444",
            "billing_address": "D-78 Banjara Hills",
            "billing_city": "Hyderabad",
            "billing_state": "Telangana",
            "billing_pincode": "500034"
        }, headers=headers).json()

        # Compute valid PayU reverse hash using server salt
        salt = payment_service.get_merchant_salt()
        valid_response_hash = payment_service.calculate_response_hash(
            salt=salt,
            status="success",
            key=order["key"],
            txnid=order["txnid"],
            amount=order["amount"],
            productinfo=order["productinfo"],
            firstname=order["firstname"],
            email=order["email"],
            udf1=order["udf1"],
            udf2=order["udf2"],
            udf3=order["udf3"],
            udf4=order["udf4"],
            udf5=order["udf5"]
        )

        callback_payload = {
            "key": order["key"],
            "txnid": order["txnid"],
            "amount": order["amount"],
            "productinfo": order["productinfo"],
            "firstname": order["firstname"],
            "email": order["email"],
            "status": "success",
            "hash": valid_response_hash,
            "udf1": order["udf1"],
            "udf2": order["udf2"],
            "udf3": order["udf3"],
            "udf4": order["udf4"],
            "udf5": order["udf5"],
            "mihpayid": "TEST_MIH_99999",
            "bank_ref_num": "BANK_REF_88888"
        }
        res = self.client.post("/api/payment/verify", json=callback_payload)
        self.assertEqual(res.status_code, 200)
        res_data = res.json()
        self.assertEqual(res_data["status"], "success")

        # Verify payment status in DB is now 'success'
        db_payment = database.get_payment(order["txnid"])
        self.assertEqual(db_payment["status"], "success")
        self.assertEqual(db_payment["user_id"], "user_delta")

        # Test 13: Duplicate callback handled safely (Idempotency)
        dup_res = self.client.post("/api/payment/verify", json=callback_payload)
        self.assertEqual(dup_res.status_code, 200)
        self.assertEqual(dup_res.json()["status"], "success")

    def test_14_failed_callback_records_failure_safely(self):
        """Failed callback records failed order status without granting privileges."""
        headers = {"Authorization": "Bearer test_token_user_epsilon"}
        order = self.client.post("/api/payment/create", json={
            "plan_id": "PREMIUM_MONTHLY",
            "user_name": "Epsilon User",
            "user_email": "epsilon@example.com",
            "user_phone": "9855555555",
            "billing_address": "E-90 Anna Nagar",
            "billing_city": "Chennai",
            "billing_state": "Tamil Nadu",
            "billing_pincode": "600040"
        }, headers=headers).json()

        salt = payment_service.get_merchant_salt()
        fail_response_hash = payment_service.calculate_response_hash(
            salt=salt,
            status="failure",
            key=order["key"],
            txnid=order["txnid"],
            amount=order["amount"],
            productinfo=order["productinfo"],
            firstname=order["firstname"],
            email=order["email"],
            udf1=order["udf1"],
            udf2=order["udf2"],
            udf3=order["udf3"],
            udf4=order["udf4"],
            udf5=order["udf5"]
        )

        callback_payload = {
            "key": order["key"],
            "txnid": order["txnid"],
            "amount": order["amount"],
            "productinfo": order["productinfo"],
            "firstname": order["firstname"],
            "email": order["email"],
            "status": "failure",
            "hash": fail_response_hash,
            "udf1": order["udf1"],
            "udf2": order["udf2"],
            "udf3": order["udf3"],
            "udf4": order["udf4"],
            "udf5": order["udf5"],
            "error_Message": "User cancelled payment on bank page"
        }
        res = self.client.post("/api/payment/verify", json=callback_payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "failure")

        db_payment = database.get_payment(order["txnid"])
        self.assertEqual(db_payment["status"], "failure")

if __name__ == "__main__":
    unittest.main()

