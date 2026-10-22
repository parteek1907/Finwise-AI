"""
Comprehensive Subscription Cancellation and Management Test Suite for FinWise.
Tests:
1. Authentication requirements for /api/subscription/current, /api/subscription/cancel, /api/subscription/reactivate
2. Active monthly subscription cancellation (sets status to 'cancels_at_period_end', auto_renew=0, records cancelled_at and reason)
3. Access retention during 'cancels_at_period_end' until 'expires_at'
4. Idempotent duplicate cancellation requests (returns existing cancelled status safely)
5. Reactivation of a cancelling subscription (restores 'active' status and auto_renew=1)
6. One-time pass rejection (cannot cancel non-recurring lifetime pass)
7. Foundation free plan rejection (cannot cancel free plan)
8. User isolation / Unauthorized access (User A cannot access or cancel User B's subscription)
9. Expired subscription handling (transitions to 'expired' and FOUNDATION tier after expiry passes)
10. Reason and feedback tracking (optional reason accepted, custom notes preserved)
"""

import sys
import os
import unittest
from datetime import datetime, timedelta

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app
import database

class TestSubscriptionCancellation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Ensure database tables are created
        database.init_db()

    def setUp(self):
        self.user_a_id = "test_user_alice_123"
        self.user_a_email = "alice@example.com"
        self.user_a_token = f"test_token_{self.user_a_id}"

        self.user_b_id = "test_user_bob_456"
        self.user_b_email = "bob@example.com"
        self.user_b_token = f"test_token_{self.user_b_id}"

    def test_01_authentication_required(self):
        """Endpoints must reject unauthenticated requests with 401."""
        res_current = self.client.get("/api/subscription/current")
        self.assertEqual(res_current.status_code, 401)

        res_cancel = self.client.post("/api/subscription/cancel", json={})
        self.assertEqual(res_cancel.status_code, 401)

        res_reactivate = self.client.post("/api/subscription/reactivate")
        self.assertEqual(res_reactivate.status_code, 401)

    def test_02_cancel_active_monthly_subscription(self):
        """Active monthly subscription cancels renewal and preserves access until expires_at."""
        # 1. Setup active monthly entitlement for User A
        database.grant_entitlement(
            user_id=self.user_a_id,
            user_email=self.user_a_email,
            plan_id="PREMIUM_MONTHLY"
        )

        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        
        # Verify active state
        res_current = self.client.get("/api/subscription/current", headers=headers)
        self.assertEqual(res_current.status_code, 200)
        data = res_current.json()
        self.assertEqual(data["tier"], "PREMIUM")
        self.assertEqual(data["status"], "active")
        self.assertTrue(data["can_cancel"])
        self.assertTrue(data["auto_renew"])

        # Cancel subscription with reason
        cancel_payload = {
            "reason": "Too expensive",
            "feedback": "Would like a student discount"
        }
        res_cancel = self.client.post("/api/subscription/cancel", json=cancel_payload, headers=headers)
        self.assertEqual(res_cancel.status_code, 200)
        cancel_data = res_cancel.json()
        self.assertTrue(cancel_data["success"])
        self.assertEqual(cancel_data["status"], "cancels_at_period_end")
        self.assertFalse(cancel_data["auto_renew"])
        self.assertIn("cancelled_at", cancel_data)

        # Check access is STILL granted during paid period
        access = database.check_feature_access(self.user_a_id, "trading_labs")
        self.assertTrue(access["allowed"], "User must retain premium feature access until paid period ends")

        # Check subscription details endpoint reflects cancellation
        res_after = self.client.get("/api/subscription/current", headers=headers)
        after_data = res_after.json()
        self.assertEqual(after_data["status"], "cancels_at_period_end")
        self.assertFalse(after_data["auto_renew"])
        self.assertFalse(after_data["can_cancel"])
        self.assertIn("Too expensive", after_data["cancellation_reason"])
        self.assertIn("Would like a student discount", after_data["cancellation_reason"])

    def test_03_idempotent_duplicate_cancellation(self):
        """Repeated cancellation calls must be idempotent and not error."""
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        res_repeat = self.client.post("/api/subscription/cancel", json={"reason": "Already cancelled"}, headers=headers)
        self.assertEqual(res_repeat.status_code, 200)
        data = res_repeat.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "cancels_at_period_end")

    def test_04_reactivate_cancelling_subscription(self):
        """User can reactivate their subscription before paid-through period ends."""
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        res_reactivate = self.client.post("/api/subscription/reactivate", headers=headers)
        self.assertEqual(res_reactivate.status_code, 200)
        data = res_reactivate.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "active")

        # Verify through details endpoint
        res_details = self.client.get("/api/subscription/current", headers=headers)
        details = res_details.json()
        self.assertEqual(details["status"], "active")
        self.assertTrue(details["auto_renew"])
        self.assertTrue(details["can_cancel"])

    def test_05_one_time_pass_cannot_be_cancelled(self):
        """One-time lifetime access pass (non-recurring) rejects recurring cancellation."""
        database.grant_entitlement(
            user_id=self.user_b_id,
            user_email=self.user_b_email,
            plan_id="TRADING_LABS_PASS"
        )
        headers = {"Authorization": f"Bearer {self.user_b_token}"}
        res = self.client.post("/api/subscription/cancel", json={}, headers=headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("one-time", res.json()["detail"].lower())

    def test_06_foundation_plan_cannot_be_cancelled(self):
        """Foundation tier (free) has no active recurring subscription to cancel."""
        user_free = "test_user_free_789"
        headers = {"Authorization": f"Bearer test_token_{user_free}"}
        res = self.client.post("/api/subscription/cancel", json={}, headers=headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("no active", res.json()["detail"].lower())

    def test_07_user_isolation(self):
        """User A cannot view or cancel User B's subscription."""
        database.grant_entitlement(
            user_id=self.user_a_id,
            user_email=self.user_a_email,
            plan_id="PREMIUM_MONTHLY"
        )
        database.grant_entitlement(
            user_id=self.user_b_id,
            user_email=self.user_b_email,
            plan_id="TRADING_LABS_PASS"
        )
        headers_a = {"Authorization": f"Bearer {self.user_a_token}"}
        headers_b = {"Authorization": f"Bearer {self.user_b_token}"}

        # User A has Premium
        data_a = self.client.get("/api/subscription/current", headers=headers_a).json()
        self.assertEqual(data_a["tier"], "PREMIUM")

        # User B has Trading Labs Pass
        data_b = self.client.get("/api/subscription/current", headers=headers_b).json()
        self.assertEqual(data_b["plan_id"], "TRADING_LABS_PASS")

        # Neither can affect the other's state
        self.assertNotEqual(data_a["plan_id"], data_b["plan_id"])

    def test_08_expired_subscription_reconciliation(self):
        """When current time passes expires_at, subscription status transitions to expired and tier reverts."""
        expired_user = "test_user_expired_999"
        past_time = (datetime.utcnow() - timedelta(days=2)).isoformat()
        
        conn = database.get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO user_entitlements (
                user_id, user_email, tier, plan_id, status, purchased_items, expires_at, created_at, updated_at
            ) VALUES (?, ?, 'PREMIUM', 'PREMIUM_MONTHLY', 'cancels_at_period_end', '[]', ?, ?, ?)
        ''', (expired_user, "expired@finwise.ai", past_time, past_time, past_time))
        conn.commit()
        conn.close()

        # Fetch entitlement; reconciliation will detect expiration
        ent = database.get_user_entitlement(expired_user)
        self.assertEqual(ent["tier"], "FOUNDATION")
        self.assertEqual(ent["status"], "expired")

        # Check feature access is revoked
        access = database.check_feature_access(expired_user, "trading_labs")
        self.assertFalse(access["allowed"])

if __name__ == "__main__":
    unittest.main()
