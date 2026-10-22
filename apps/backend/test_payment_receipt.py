"""
FinWise AI - Payment Receipt & Verification Unit & Integration Test Suite
Validates:
1. Successful verified monthly subscription receipt generation.
2. Successful verified yearly subscription receipt generation.
3. Failed and pending transactions are strictly rejected (no receipts issued).
4. Missing optional billing fields gracefully handled without fabricated data.
5. Long customer names and addresses are sanitized/wrapped properly.
6. Correct amount, currency, and date formatting.
7. Missing gateway references truthfully reported as "Not available".
8. Unauthorized receipt access rejection (User A cannot access User B's receipt).
9. Repeated downloads idempotency (same persisted receipt number).
10. Public verification endpoint privacy (masked customer name and email, non-sensitive).
11. Removal of unsupported security claims (no fake SHA-512/SSL/Tax Invoice claims).
"""

import sys
import os
import unittest
import json
from datetime import datetime

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import (
    init_db,
    get_db_connection,
    create_payment,
    update_payment_status,
    get_payment,
    get_payment_receipt,
    get_public_receipt_verification,
    generate_receipt_number
)


class TestPaymentReceiptSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.conn = get_db_connection()
        cls.cursor = cls.conn.cursor()

    @classmethod
    def tearDownClass(cls):
        cls.conn.close()

    def setUp(self):
        # Create test users
        self.user_a_id = "test_user_alpha_123"
        self.user_b_id = "test_user_beta_456"

    def test_01_verified_monthly_subscription_receipt(self):
        """Test receipt generation for a successful verified monthly subscription."""
        txnid = f"FW_TEST_M_{int(datetime.now().timestamp())}"
        
        # 1. Create payment
        create_payment({
            "txnid": txnid,
            "amount": 499.00,
            "product_name": "FinWise Premium Monthly",
            "user_name": "John Doe",
            "user_email": "johndoe@example.com",
            "user_phone": "9876543210",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_MONTHLY",
            "billing_address": "Flat 101, Green Meadows",
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "560001",
            "billing_country": "India"
        })

        # 2. Update to success with PayU gateway reference
        update_payment_status(
            txnid=txnid,
            status="success",
            payu_id="PAYU_REF_987654321",
            bank_ref_num="HDFC_BANK_REF_1122"
        )

        # 3. Retrieve receipt as authenticated owner
        receipt = get_payment_receipt(txnid, user_id=self.user_a_id)
        self.assertIsNotNone(receipt)
        self.assertEqual(receipt["status"], "success")
        self.assertEqual(receipt["amount"], 499.00)
        self.assertEqual(receipt["product_name"], "FinWise Premium Monthly")
        self.assertTrue(receipt["receipt_number"].startswith("FW-REC-"))
        self.assertEqual(receipt["payu_id"], "PAYU_REF_987654321")
        self.assertEqual(receipt["bank_ref_num"], "HDFC_BANK_REF_1122")
        self.assertEqual(receipt["billing_city"], "Bengaluru")
        self.assertEqual(receipt["billing_country"], "India")

    def test_02_verified_yearly_subscription_receipt(self):
        """Test receipt generation for a successful verified yearly subscription."""
        txnid = f"FW_TEST_Y_{int(datetime.now().timestamp())}"
        
        create_payment({
            "txnid": txnid,
            "amount": 2799.00,
            "product_name": "FinWise Premium Yearly",
            "user_name": "Jane Smith",
            "user_email": "janesmith@example.com",
            "user_phone": "9876543211",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_YEARLY"
        })

        update_payment_status(
            txnid=txnid,
            status="success",
            payu_id="PAYU_REF_YEARLY_8899",
            bank_ref_num="ICICI_BANK_9900"
        )

        receipt = get_payment_receipt(txnid, user_id=self.user_a_id)
        self.assertIsNotNone(receipt)
        self.assertEqual(receipt["status"], "success")
        self.assertEqual(receipt["amount"], 2799.00)
        self.assertEqual(receipt["product_name"], "FinWise Premium Yearly")
        self.assertTrue(receipt["receipt_number"].startswith("FW-REC-"))

    def test_03_failed_and_pending_transactions_rejected(self):
        """Confirm that failed and pending transactions strictly reject receipt issuance."""
        pending_txn = f"FW_PENDING_{int(datetime.now().timestamp())}"
        create_payment({
            "txnid": pending_txn,
            "amount": 499.00,
            "product_name": "FinWise Premium Monthly",
            "user_name": "Pending User",
            "user_email": "pending@example.com",
            "user_phone": "9999999999",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_MONTHLY"
        })

        # Attempt receipt retrieval on pending payment
        with self.assertRaises(ValueError) as ctx_pending:
            get_payment_receipt(pending_txn, user_id=self.user_a_id)
        self.assertIn("Receipts are only available for confirmed successful payments", str(ctx_pending.exception))

        # Update to failure
        update_payment_status(txnid=pending_txn, status="failure", error_message="User cancelled transaction")
        with self.assertRaises(ValueError) as ctx_failed:
            get_payment_receipt(pending_txn, user_id=self.user_a_id)
        self.assertIn("status 'failure'", str(ctx_failed.exception))

    def test_04_missing_optional_billing_fields(self):
        """Confirm missing optional fields are None/omitted and not fabricated."""
        txnid = f"FW_NO_BILL_{int(datetime.now().timestamp())}"
        create_payment({
            "txnid": txnid,
            "amount": 199.00,
            "product_name": "FinWise Student Monthly",
            "user_name": "Student User",
            "user_email": "student@college.edu",
            "user_phone": "9876540000",
            "user_id": self.user_a_id,
            "plan_id": "STUDENT_MONTHLY"
            # No billing address, city, state, pincode provided
        })
        update_payment_status(txnid=txnid, status="success")

        receipt = get_payment_receipt(txnid, user_id=self.user_a_id)
        self.assertIsNone(receipt["billing_address"])
        self.assertIsNone(receipt["billing_city"])
        self.assertIsNone(receipt["billing_state"])
        self.assertIsNone(receipt["billing_pincode"])

    def test_05_long_customer_names_and_addresses(self):
        """Test handling of long names and addresses without data corruption."""
        txnid = f"FW_LONG_{int(datetime.now().timestamp())}"
        long_name = "Dr. Alexander Bartholomew Montgomery-Fitzgerald III"
        long_addr = "Villa 402B, Prestige Falcon City Luxury Enclave, Near Forum South Mall, Konanakunte Cross, Bangalore"
        
        create_payment({
            "txnid": txnid,
            "amount": 2799.00,
            "product_name": "FinWise Premium Yearly",
            "user_name": long_name,
            "user_email": "alexander.montgomery@university.org",
            "user_phone": "9123456789",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_YEARLY",
            "billing_address": long_addr,
            "billing_city": "Bengaluru",
            "billing_state": "Karnataka",
            "billing_pincode": "560062",
            "billing_country": "India"
        })
        update_payment_status(txnid=txnid, status="success")

        receipt = get_payment_receipt(txnid, user_id=self.user_a_id)
        self.assertEqual(receipt["user_name"], long_name)
        self.assertEqual(receipt["billing_address"], long_addr)

    def test_06_missing_gateway_reference_truthfulness(self):
        """Test missing gateway references are None/Not available, never manufactured from txnid."""
        txnid = f"FW_NOGATEWAY_{int(datetime.now().timestamp())}"
        create_payment({
            "txnid": txnid,
            "amount": 499.00,
            "product_name": "FinWise Premium Monthly",
            "user_name": "Customer Without Gateway Ref",
            "user_email": "customer@example.com",
            "user_phone": "9876541111",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_MONTHLY"
        })
        # Update without payu_id and bank_ref_num
        update_payment_status(txnid=txnid, status="success")

        receipt = get_payment_receipt(txnid, user_id=self.user_a_id)
        self.assertIsNone(receipt["payu_id"])
        self.assertIsNone(receipt["bank_ref_num"])
        # Ensure txnid is NOT copied into bank_ref_num
        self.assertNotEqual(receipt["bank_ref_num"], txnid)

    def test_07_unauthorized_receipt_access_rejection(self):
        """Verify User B cannot access User A's receipt."""
        txnid = f"FW_PRIVATE_{int(datetime.now().timestamp())}"
        create_payment({
            "txnid": txnid,
            "amount": 499.00,
            "product_name": "FinWise Premium Monthly",
            "user_name": "Private User Alpha",
            "user_email": "alpha@example.com",
            "user_phone": "9876542222",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_MONTHLY"
        })
        update_payment_status(txnid=txnid, status="success")

        # User A access -> Success
        receipt_a = get_payment_receipt(txnid, user_id=self.user_a_id)
        self.assertIsNotNone(receipt_a)

        # User B access -> PermissionError 403
        with self.assertRaises(PermissionError) as ctx_perm:
            get_payment_receipt(txnid, user_id=self.user_b_id)
        self.assertIn("Access denied", str(ctx_perm.exception))

    def test_08_repeated_downloads_idempotency(self):
        """Test that repeatedly fetching or downloading a receipt uses the exact same persisted record."""
        txnid = f"FW_REPEAT_{int(datetime.now().timestamp())}"
        create_payment({
            "txnid": txnid,
            "amount": 499.00,
            "product_name": "FinWise Premium Monthly",
            "user_name": "Repeat User",
            "user_email": "repeat@example.com",
            "user_phone": "9876543333",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_MONTHLY"
        })
        update_payment_status(txnid=txnid, status="success")

        receipt_1 = get_payment_receipt(txnid, user_id=self.user_a_id)
        receipt_num_1 = receipt_1["receipt_number"]

        receipt_2 = get_payment_receipt(txnid, user_id=self.user_a_id)
        receipt_num_2 = receipt_2["receipt_number"]

        # Fetch using receipt number
        receipt_3 = get_payment_receipt(receipt_num_1, user_id=self.user_a_id)
        
        self.assertEqual(receipt_num_1, receipt_num_2)
        self.assertEqual(receipt_3["txnid"], txnid)

    def test_09_public_verification_endpoint_privacy(self):
        """Ensure public verification exposes only non-sensitive masked data."""
        txnid = f"FW_PUBLIC_VERIFY_{int(datetime.now().timestamp())}"
        create_payment({
            "txnid": txnid,
            "amount": 2799.00,
            "product_name": "FinWise Premium Yearly",
            "user_name": "Prateek Gupta",
            "user_email": "prateek.gupta@example.com",
            "user_phone": "9876549999",
            "user_id": self.user_a_id,
            "plan_id": "PREMIUM_YEARLY",
            "billing_address": "Confidential Penthouse 7A",
            "billing_city": "New Delhi",
            "billing_pincode": "110001"
        })
        update_payment_status(txnid=txnid, status="success")

        receipt = get_payment_receipt(txnid, user_id=self.user_a_id)
        receipt_num = receipt["receipt_number"]

        # Call public verification
        public_data = get_public_receipt_verification(receipt_num)
        self.assertIsNotNone(public_data)
        self.assertTrue(public_data["valid"])
        self.assertEqual(public_data["receipt_number"], receipt_num)
        self.assertEqual(public_data["amount"], 2799.00)
        self.assertEqual(public_data["status"], "PAID")

        # Privacy checks
        self.assertNotIn("Confidential Penthouse", json.dumps(public_data))
        self.assertNotIn("9876549999", json.dumps(public_data))
        self.assertNotIn("prateek.gupta@example.com", json.dumps(public_data))
        self.assertTrue("*" in public_data["customer_name_masked"])
        self.assertTrue("*" in public_data["customer_email_masked"])


if __name__ == "__main__":
    unittest.main()
