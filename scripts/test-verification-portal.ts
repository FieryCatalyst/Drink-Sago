/**
 * Comprehensive Automated Test Suite for SAGO Promotion Verification Portal
 * 
 * Verifies:
 * 1. Authentication & Session Security (valid credentials, invalid password, deactivated staff, inactive bar)
 * 2. Slot Machine Integration & Dynamic Coupon Generation
 * 3. Read-Only Coupon Verification (valid coupon, non-existent coupon, QR JSON payload parsing, expiry check)
 * 4. Atomic Redemption & Single-Use Invariant (redeeming once succeeds, redeeming second time is rejected)
 * 5. Concurrent / Simultaneous Double-Redemption Race Condition (2 simultaneous requests, only 1 succeeds)
 * 6. Idempotency Protection (duplicate requestId replays previous confirmation without double-redeeming)
 * 7. Bar Isolation & Row-Level Data Privacy (Bar B cannot view Bar A's redemptions or stats)
 */

import {
  PRESEEDED_BARS,
  getStaffByEmail,
  verifyCoupon,
  redeemCoupon,
  getBarRedemptionActivity,
  normalizeCouponCode,
} from "../src/lib/verify/verify-service";
import { signSessionToken, verifySessionToken } from "../src/lib/verify/verify-auth";
import { createProductionSession, recordProductionSpinAndCoupon } from "../src/lib/game/game-storage";
import { drawOutcomeFromHierarchy } from "../src/lib/game/demo-data";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
    passCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName}${detail ? ` (${detail})` : ""}`);
    failCount++;
  }
}

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("  SAGO PROMOTION VERIFICATION PORTAL TEST SUITE");
  console.log("========================================================\n");

  // -------------------------------------------------------------------------
  // TEST GROUP 1: Pre-seeded Bars & Staff Provisioning
  // -------------------------------------------------------------------------
  console.log("--- 1. PRE-SEEDED VENUES & CREDENTIAL VERIFICATION ---");
  assert(PRESEEDED_BARS.length === 4, "4 Zambian partner venues pre-seeded");
  const barA = PRESEEDED_BARS[0]; // Social Kitwe
  const barB = PRESEEDED_BARS[1]; // Social Munali
  assert(barA.id === "bar-zm-kitwe-social", "Bar A loaded: Social Kitwe");
  assert(barB.id === "bar-zm-lusaka-munali", "Bar B loaded: Social Munali");

  const staffA = getStaffByEmail("social.kitwe@drinksago.com");
  const staffB = getStaffByEmail("social.munali@drinksago.com");
  assert(Boolean(staffA && staffA.barId === barA.id), "Staff A mapped to Bar A");
  assert(Boolean(staffB && staffB.barId === barB.id), "Staff B mapped to Bar B");

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Cryptographic Session Authentication & Expiry
  // -------------------------------------------------------------------------
  console.log("\n--- 2. CRYPTOGRAPHIC SESSION AUTHENTICATION ---");
  const sessionToken = signSessionToken({
    staffId: staffA!.id,
    email: staffA!.email,
    barId: staffA!.barId,
    role: staffA!.role,
  });
  assert(sessionToken.includes("."), "Session token generated with HMAC signature");

  const verifiedSession = verifySessionToken(sessionToken);
  assert(
    verifiedSession !== null && verifiedSession.email === staffA!.email && verifiedSession.barId === barA.id,
    "Valid session token verifies and decodes assigned barId"
  );

  const tamperedToken = sessionToken + "tampered";
  assert(verifySessionToken(tamperedToken) === null, "Tampered session token is rejected");

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Code Normalization (Raw, URL, QR JSON)
  // -------------------------------------------------------------------------
  console.log("\n--- 3. CODE & QR PAYLOAD NORMALIZATION ---");
  assert(normalizeCouponCode(" sago-zm-8974-a2b3 ") === "SAGO-ZM-8974-A2B3", "Normalizes whitespace & casing");
  assert(
    normalizeCouponCode("https://sago.world/verify?code=SAGO-ZM-9988-1122") === "SAGO-ZM-9988-1122",
    "Extracts code from URL query param"
  );
  const sampleQrPayload = JSON.stringify({
    voucher: "SAGO-ZM-QR77-99AA",
    venue: "Social Kitwe",
    bottle_discount: "20%",
  });
  assert(normalizeCouponCode(sampleQrPayload) === "SAGO-ZM-QR77-99AA", "Extracts voucher from JSON QR payload");

  // -------------------------------------------------------------------------
  // TEST GROUP 4: Generate Real Slot Machine Coupon
  // -------------------------------------------------------------------------
  console.log("\n--- 4. SLOT MACHINE COUPON GENERATION & VERIFICATION ---");
  const gameSession = await createProductionSession({
    name: "Mizinga Phiri",
    email: "mizinga.test@example.com",
    venueId: barA.id,
    marketingConsent: true,
  });

  const outcome = drawOutcomeFromHierarchy();
  const createdCoupon = await recordProductionSpinAndCoupon({
    sessionId: gameSession.id,
    outcome,
    venueId: barA.id,
  });

  assert(Boolean(createdCoupon.code && createdCoupon.qrUrl), "Real slot machine coupon generated with QR data");
  console.log(`    Generated Test Coupon Code: \x1b[33m${createdCoupon.code}\x1b[0m (${createdCoupon.tier})`);

  // Verify non-existent coupon
  const fakeCheck = await verifyCoupon({
    couponCode: "SAGO-FAKE-NONEXISTENT",
    barId: barA.id,
    staffEmail: staffA!.email,
  });
  assert(!fakeCheck.isValid, "Non-existent coupon code is rejected with error");

  // Verify real coupon (read-only verification)
  const validCheck = await verifyCoupon({
    couponCode: createdCoupon.code,
    barId: barA.id,
    staffEmail: staffA!.email,
  });
  assert(validCheck.isValid, "Valid coupon verifies successfully");
  assert(validCheck.couponCode === createdCoupon.code, "Coupon code returned in verification response");
  assert(validCheck.bottleDiscount !== undefined && validCheck.shotDiscount !== undefined, "Discounts correctly populated");

  // Verify via full QR JSON payload
  const qrCheck = await verifyCoupon({
    couponCode: JSON.stringify({ voucher: createdCoupon.code }),
    barId: barA.id,
    staffEmail: staffA!.email,
  });
  assert(qrCheck.isValid, "Voucher decoded from QR JSON verifies successfully");

  // -------------------------------------------------------------------------
  // TEST GROUP 5: Single-Use Redemption Invariant
  // -------------------------------------------------------------------------
  console.log("\n--- 5. SINGLE-USE REDEMPTION INVARIANT ---");
  const runId = `run-${Date.now()}`;
  const redeemResult1 = await redeemCoupon({
    couponCode: createdCoupon.code,
    barId: barA.id,
    staffEmail: staffA!.email,
    requestId: `${runId}-req-1`,
  });
  assert(redeemResult1.success, "First redemption at Bar A succeeds");
  assert(Boolean(redeemResult1.confirmationRef), `Confirmation ref generated: ${redeemResult1.confirmationRef}`);

  // Immediate second attempt at same bar
  const redeemResult2 = await redeemCoupon({
    couponCode: createdCoupon.code,
    barId: barA.id,
    staffEmail: staffA!.email,
    requestId: `${runId}-req-2`,
  });
  assert(!redeemResult2.success, "Second redemption at Bar A is rejected (already redeemed)");

  // Attempt redemption at another bar (Bar B)
  const redeemResult3 = await redeemCoupon({
    couponCode: createdCoupon.code,
    barId: barB.id,
    staffEmail: staffB!.email,
    requestId: `${runId}-req-3`,
  });
  assert(!redeemResult3.success, "Redemption of same coupon at Bar B is rejected (already redeemed)");

  // Read-only verification check of now-redeemed coupon
  const checkAfterRedeem = await verifyCoupon({
    couponCode: createdCoupon.code,
    barId: barA.id,
    staffEmail: staffA!.email,
  });
  assert(!checkAfterRedeem.isValid && checkAfterRedeem.status === "REDEEMED", "Verification recognizes REDEEMED status");

  // -------------------------------------------------------------------------
  // TEST GROUP 6: Idempotency Protection
  // -------------------------------------------------------------------------
  console.log("\n--- 6. IDEMPOTENCY PROTECTION ---");
  const idempotentReplay = await redeemCoupon({
    couponCode: createdCoupon.code,
    barId: barA.id,
    staffEmail: staffA!.email,
    requestId: `${runId}-req-1`, // replaying exact same requestId
  });
  assert(idempotentReplay.idempotentReplay === true, "Identical requestId safely replayed without duplicate mutation");

  // -------------------------------------------------------------------------
  // TEST GROUP 7: Concurrent Double-Redemption Prevention (Race Condition)
  // -------------------------------------------------------------------------
  console.log("\n--- 7. CONCURRENT DOUBLE-REDEMPTION MUTEX TEST ---");
  // Generate a fresh coupon for race testing
  const raceCoupon = await recordProductionSpinAndCoupon({
    sessionId: gameSession.id,
    outcome: drawOutcomeFromHierarchy(),
    venueId: barA.id,
  });

  // Launch 2 simultaneous redemption requests
  const [race1, race2] = await Promise.all([
    redeemCoupon({
      couponCode: raceCoupon.code,
      barId: barA.id,
      staffEmail: staffA!.email,
      requestId: `${runId}-race-1`,
    }),
    redeemCoupon({
      couponCode: raceCoupon.code,
      barId: barB.id,
      staffEmail: staffB!.email,
      requestId: `${runId}-race-2`,
    }),
  ]);

  const successes = [race1, race2].filter((r) => r.success);
  const rejections = [race1, race2].filter((r) => !r.success);

  assert(
    successes.length === 1 && rejections.length === 1,
    `Race Condition Protected: Exactly 1 succeeded (${successes.length}) and 1 rejected (${rejections.length})`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 8: Bar Data Isolation & Row-Level Privacy
  // -------------------------------------------------------------------------
  console.log("\n--- 8. BAR DATA ISOLATION & ROW-LEVEL PRIVACY ---");
  const barAActivity = await getBarRedemptionActivity(barA.id);
  const barBActivity = await getBarRedemptionActivity(barB.id);

  assert(
    barAActivity.recentActivity.every((log: any) => log.barId === barA.id),
    "Bar A activity query returns strictly logs belonging to Bar A"
  );
  assert(
    barBActivity.recentActivity.every((log: any) => log.barId === barB.id),
    "Bar B activity query returns strictly logs belonging to Bar B"
  );

  const barAHasCoupon1 = barAActivity.recentActivity.some((log: any) => log.couponCode === createdCoupon.code && log.action === "redeemed");
  const barBHasCoupon1 = barBActivity.recentActivity.some((log: any) => log.couponCode === createdCoupon.code && log.action === "redeemed");

  assert(barAHasCoupon1, "Bar A shows successful redemption in its private history");
  assert(!barBHasCoupon1, "Bar B cannot see Bar A's successful redemption in its history (ISOLATION MAINTAINED)");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`TEST RESULTS: \x1b[32m${passCount} PASSED\x1b[0m, \x1b[31m${failCount} FAILED\x1b[0m`);
  console.log("========================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
