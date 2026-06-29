require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const { PLAN_CATALOG } = require("./catalog/plans");

const app = express();
const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");
const FRONTEND_INDEX = path.join(FRONTEND_DIST, "index.html");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_RANK = {
  club: 0,
  privilege: 1,
  elite: 2,
  supreme: 3,
};

const PREMIUM_PLAN_TYPES = ["privilege", "elite", "supreme"];
const VALID_DISCOUNT_SELECTIONS = new Set([
  "founder",
  "referral",
  "ambassador_coupon",
  "welcome",
  "none",
]);

function isPremiumPlan(internalPlanType) {
  return PREMIUM_PLAN_TYPES.includes(internalPlanType);
}

function computeDiscount(profile, internalPlanType) {
  if (!isPremiumPlan(internalPlanType)) {
    return {
      discountType: null,
      discountPercent: 0,
    };
  }

  if (
    Number(profile?.founder_discount_count) > 0 &&
    Number(profile?.founder_discount_percent) > 0
  ) {
    return {
      discountType: "founder",
      discountPercent: Number(profile.founder_discount_percent),
    };
  }

  if (
    profile?.has_referral_discount === true &&
    profile?.referral_discount_used === false
  ) {
    return {
      discountType: "referral",
      discountPercent: 25,
    };
  }

  return {
    discountType: null,
    discountPercent: 0,
  };
}

function applyDiscount(amount, discountPercent) {
  const discounted = amount * (1 - discountPercent / 100);
  return Math.round(discounted * 100) / 100;
}

async function validateAmbassadorCoupon(couponId, userId) {
  const { data, error } = await supabase
    .from("ambassador_coupons")
    .select("id, ambassador_user_id, status, discount_percent")
    .eq("id", couponId)
    .maybeSingle();

  if (error) {
    console.error("❌ Failed to load ambassador coupon:", error.message);
    return { ok: false, error: "coupon_lookup_failed" };
  }

  if (!data) {
    return { ok: false, error: "coupon_not_found" };
  }

  if (data.ambassador_user_id !== userId) {
    return { ok: false, error: "coupon_user_mismatch" };
  }

  if (data.status !== "available") {
    return { ok: false, error: "coupon_not_available" };
  }

  if (Number(data.discount_percent) !== 20) {
    return { ok: false, error: "invalid_coupon_percent" };
  }

  return { ok: true };
}

async function resolveCheckoutDiscount(
  profile,
  internalPlanType,
  selectedDiscountType,
  ambassadorCouponId,
  userId
) {
  if (selectedDiscountType == null || selectedDiscountType === "") {
    return computeDiscount(profile, internalPlanType);
  }

  const selection = String(selectedDiscountType).trim().toLowerCase();

  if (!VALID_DISCOUNT_SELECTIONS.has(selection)) {
    return { error: "invalid_discount_selection", status: 400 };
  }

  if (ambassadorCouponId && selection !== "ambassador_coupon") {
    return { error: "invalid_discount_selection", status: 400 };
  }

  if (selection === "none") {
    return { discountType: null, discountPercent: 0 };
  }

  if (!isPremiumPlan(internalPlanType)) {
    return { error: "discount_not_allowed_for_plan", status: 400 };
  }

  if (selection === "founder") {
    if (
      !(
        Number(profile?.founder_discount_count) > 0 &&
        Number(profile?.founder_discount_percent) > 0
      )
    ) {
      return { error: "discount_not_eligible", status: 400 };
    }

    return {
      discountType: "founder",
      discountPercent: Number(profile.founder_discount_percent),
    };
  }

  if (selection === "referral") {
    if (
      !(
        profile?.has_referral_discount === true &&
        profile?.referral_discount_used === false
      )
    ) {
      return { error: "discount_not_eligible", status: 400 };
    }

    return {
      discountType: "referral",
      discountPercent: 25,
    };
  }

  if (selection === "ambassador_coupon") {
    if (!ambassadorCouponId) {
      return { error: "missing_ambassador_coupon_id", status: 400 };
    }

    const validation = await validateAmbassadorCoupon(ambassadorCouponId, userId);
    if (!validation.ok) {
      return { error: validation.error, status: 400 };
    }

    return {
      discountType: "ambassador_coupon",
      discountPercent: 20,
      ambassadorCouponId,
    };
  }

  if (selection === "welcome") {
    if (
      profile?.is_founder_by_city === true ||
      profile?.is_founder === true
    ) {
      return { error: "discount_not_eligible", status: 400 };
    }

    if (Number(profile?.welcome_discount_count) <= 0) {
      return { error: "discount_not_eligible", status: 400 };
    }

    return {
      discountType: "welcome",
      discountPercent: 25,
    };
  }

  return { error: "invalid_discount_selection", status: 400 };
}

async function releaseAmbassadorCouponForCheckout(checkoutId) {
  const { data, error } = await supabase.rpc("release_ambassador_coupon", {
    p_checkout_id: checkoutId,
  });

  if (error) {
    console.error("❌ release_ambassador_coupon RPC failed:", error.message);
    return { ok: false, error: error.message };
  }

  return data ?? { ok: true };
}

async function handlePlatformCheckoutSessionEnded(session, endReason) {
  const metadata = session.metadata || {};

  if (metadata.source !== "platform") {
    return;
  }

  const checkoutId = metadata.checkout_id;
  if (!checkoutId) {
    console.error("❌ Missing checkout_id in Stripe metadata for", endReason);
    return;
  }

  const { data: checkoutRecord, error: checkoutFetchError } = await supabase
    .from("platform_checkouts")
    .select("id, status, discount_type")
    .eq("id", checkoutId)
    .maybeSingle();

  if (checkoutFetchError) {
    console.error(
      "❌ Failed to load platform checkout for release:",
      checkoutFetchError.message
    );
    return;
  }

  if (!checkoutRecord || checkoutRecord.status === "paid") {
    return;
  }

  if (checkoutRecord.discount_type === "ambassador_coupon") {
    await releaseAmbassadorCouponForCheckout(checkoutId);
  }

  const { error: checkoutCancelError } = await supabase
    .from("platform_checkouts")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", checkoutId)
    .eq("status", "pending");

  if (checkoutCancelError) {
    console.error(
      "❌ Failed to mark checkout as cancelled:",
      checkoutCancelError.message
    );
  }
}

// Webhook Stripe : DOIT être déclaré avant express.json()
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
  const session = event.data.object;
  const metadata = session.metadata || {};

  console.log("✅ Payment successful");
  console.log("Session ID:", session.id);

  if (metadata.source !== "platform") {
    console.log("ℹ️ Non-platform checkout, skipping platform activation logic.");
    break;
  }

  const checkoutId = metadata.checkout_id;

  if (!checkoutId) {
    console.error("❌ Missing checkout_id in Stripe metadata.");
    break;
  }

  // 1. Load internal checkout record
  const { data: checkoutRecord, error: checkoutFetchError } = await supabase
    .from("platform_checkouts")
    .select(`
      id,
      user_id,
      listing_id,
      plan_code,
      duration_days,
      internal_plan_type,
      discount_type,
      discount_percent,
      ambassador_coupon_id,
      status
    `)
    .eq("id", checkoutId)
    .single();

  if (checkoutFetchError || !checkoutRecord) {
    console.error(
      "❌ Failed to load platform checkout:",
      checkoutFetchError?.message
    );
    break;
  }

  if (checkoutRecord.status === "paid") {
  console.log("ℹ️ Checkout already processed, skipping.");
  break;
}

  const userId = checkoutRecord.user_id;
  const listingId = checkoutRecord.listing_id || null;
  const internalPlanType = checkoutRecord.internal_plan_type;
  const durationDays = Number(checkoutRecord.duration_days);
  const discountType = checkoutRecord.discount_type;

  if (!userId || !internalPlanType || !Number.isFinite(durationDays) || durationDays <= 0) {
    console.error("❌ Invalid checkout record data.");
    break;
  }

  // 2. Mark checkout as paid
  const { error: checkoutPaidError } = await supabase
    .from("platform_checkouts")
    .update({
      status: "paid",
      provider_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      transaction_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", checkoutId);

  if (checkoutPaidError) {
    console.error("❌ Failed to mark checkout as paid:", checkoutPaidError.message);
    throw checkoutPaidError;
  }

  // 4. Consume discount only after successful payment
  if (discountType === "founder") {
    const { data: profileData, error: founderFetchError } = await supabase
      .from("provider_profiles")
      .select("founder_discount_count")
      .eq("user_id", userId)
      .single();

    if (founderFetchError) {
      console.error("❌ Failed to load founder discount count:", founderFetchError.message);
      throw founderFetchError;
    }

    const nextCount = Math.max(0, Number(profileData?.founder_discount_count || 0) - 1);

    const { error: founderUpdateError } = await supabase
      .from("provider_profiles")
      .update({
        founder_discount_count: nextCount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (founderUpdateError) {
      console.error("❌ Failed to decrement founder discount count:", founderUpdateError.message);
      throw founderUpdateError;
    }
  } else if (discountType === "referral") {
    const { error: referralUpdateError } = await supabase
      .from("provider_profiles")
      .update({
        referral_discount_used: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (referralUpdateError) {
      console.error("❌ Failed to consume referral discount:", referralUpdateError.message);
      throw referralUpdateError;
    }
  } else if (discountType === "ambassador_coupon") {
    const { data: consumeResult, error: consumeError } = await supabase.rpc(
      "consume_ambassador_coupon",
      { p_checkout_id: checkoutId }
    );

    if (consumeError) {
      console.error("❌ consume_ambassador_coupon RPC failed:", consumeError.message);
      throw consumeError;
    }

    if (consumeResult?.ok === false) {
      console.error("❌ consume_ambassador_coupon returned error:", consumeResult);
      throw new Error(consumeResult.error || "coupon_consume_failed");
    }
  } else if (discountType === "welcome") {
    const { data: profileData, error: welcomeFetchError } = await supabase
      .from("provider_profiles")
      .select("welcome_discount_count")
      .eq("user_id", userId)
      .single();

    if (welcomeFetchError) {
      console.error("❌ Failed to load welcome discount count:", welcomeFetchError.message);
      throw welcomeFetchError;
    }

    const nextCount = Math.max(0, Number(profileData?.welcome_discount_count || 0) - 1);

    const { error: welcomeUpdateError } = await supabase
      .from("provider_profiles")
      .update({
        welcome_discount_count: nextCount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (welcomeUpdateError) {
      console.error("❌ Failed to decrement welcome discount count:", welcomeUpdateError.message);
      throw welcomeUpdateError;
    }
  }

  // 5. Load current listing expiry
  let listingQuery = supabase
    .from("listings")
    .select("id, plan, premium_level, premium_expiry")
    .eq("owner_id", userId);

  if (listingId) {
    listingQuery = listingQuery.eq("id", listingId);
  }

  const { data: listingsData, error: listingsFetchError } = await listingQuery;

  if (listingsFetchError) {
    console.error("❌ Failed to load listings:", listingsFetchError.message);
    throw listingsFetchError;
  }

  if (!listingsData || listingsData.length === 0) {
    console.warn("⚠️ No listing found for platform payment activation.");
    break;
  }

  // 6. Apply renewal / pause logic
for (const listing of listingsData) {
  const now = new Date();
  const currentExpiry = listing.premium_expiry ? new Date(listing.premium_expiry) : null;

  const previousPlan =
    listing.premium_level ||
    (listing.plan === "free" ? "club" : listing.plan) ||
    "club";

  const hasActivePlan =
    currentExpiry && currentExpiry.getTime() > now.getTime();

  const isSamePlan = previousPlan === internalPlanType;

  const previousPlanRank = PLAN_RANK[previousPlan] ?? 0;
  const newPlanRank = PLAN_RANK[internalPlanType] ?? 0;

  const isUpgrade = newPlanRank > previousPlanRank;
  const isDowngrade = newPlanRank < previousPlanRank;

  console.log("🧠 DEBUG PLAN CHECK", {
    previousPlan,
    internalPlanType,
    hasActivePlan,
    isSamePlan,
    isUpgrade,
    isDowngrade,
    listingPlan: listing.plan,
    listingPremiumLevel: listing.premium_level,
    premiumExpiry: listing.premium_expiry,
  });

  // CAS 1 : même plan => prolongation
  if (hasActivePlan && isSamePlan) {
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + durationDays);

    const { error: listingUpdateError } = await supabase
      .from("listings")
      .update({
        updated_at: new Date().toISOString(),
        premium_expiry: newExpiry.toISOString(),
      })
      .eq("id", listing.id);

    if (listingUpdateError) {
      console.error(
        `❌ Failed to extend listing ${listing.id}:`,
        listingUpdateError.message
      );
      throw listingUpdateError;
    }

    continue;
  }

  // CAS 2 : downgrade => on garde le plan actif,
  // on stocke le plan acheté pour plus tard dans paused_plans
  if (hasActivePlan && isDowngrade) {
    const downgradeHours = Math.max(0, durationDays * 24);

    console.log("📦 STORING DOWNGRADE FOR LATER", {
      userId,
      listingId: listing.id,
      internalPlanType,
      downgradeHours,
    });

    const { error: pausedPlanError } = await supabase
      .from("paused_plans")
      .insert({
        user_id: userId,
        listing_id: listing.id,
        plan_type: internalPlanType,
        remaining_hours: downgradeHours,
      });

    if (pausedPlanError) {
      console.error("❌ DOWNGRADE PAUSED PLAN INSERT ERROR:", pausedPlanError);
      throw pausedPlanError;
    } else {
      console.log("✅ DOWNGRADE STORED IN PAUSED_PLANS");
    }

    // IMPORTANT : on ne touche pas au plan actif
    continue;
  }

  // CAS 3 : upgrade => on met l'ancien plan en pause, puis on active le nouveau
  let listingUpdates = {
    updated_at: new Date().toISOString(),
    plan: internalPlanType,
    premium_level: internalPlanType === "club" ? "" : internalPlanType,
    boosted: false,
  };

  if (hasActivePlan && isUpgrade) {
    console.log("⏸️ ENTERING UPGRADE PAUSE LOGIC");

    const remainingMs = currentExpiry.getTime() - now.getTime();
    const remainingHours = Math.max(
      0,
      Math.ceil(remainingMs / (1000 * 60 * 60))
    );

    console.log("🧠 PAUSE DETAILS", {
      userId,
      listingId: listing.id,
      previousPlan,
      remainingHours,
    });

    const { error: pausedPlanError } = await supabase
      .from("paused_plans")
      .insert({
        user_id: userId,
        listing_id: listing.id,
        plan_type: previousPlan,
        remaining_hours: remainingHours,
      });

    if (pausedPlanError) {
      console.error("❌ PAUSED PLAN INSERT ERROR:", pausedPlanError);
      throw pausedPlanError;
    } else {
      console.log("✅ PAUSED PLAN INSERTED");
    }

    const newExpiry = new Date(now);
    newExpiry.setDate(newExpiry.getDate() + durationDays);
    listingUpdates.premium_expiry = newExpiry.toISOString();
  } else {
      console.log("🔥 ENTERING CAS 4 (NO ACTIVE PLAN)");
    // CAS 4 : pas de plan actif => activation simple
     const baseDate =
    currentExpiry && currentExpiry.getTime() > now.getTime()
      ? currentExpiry
      : now;

  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + durationDays);

  console.log("📦 NEW EXPIRY CALCULATED", {
    baseDate,
    durationDays,
    newExpiry: newExpiry.toISOString(),
  });

  listingUpdates.premium_expiry = newExpiry.toISOString();
}
     console.log("📦 FINAL UPDATE PAYLOAD", listingUpdates);

  const { error: listingUpdateError } = await supabase
    .from("listings")
    .update(listingUpdates)
    .eq("id", listing.id);

  if (listingUpdateError) {
    console.error(
      `❌ Failed to update listing ${listing.id}:`,
      listingUpdateError.message
    );
    throw listingUpdateError;
  }
}

// 7. Sync provider_profiles.plan_type only AFTER listings logic is complete
const { error: profilePlanError } = await supabase
  .from("provider_profiles")
  .update({
    plan_type: internalPlanType,
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", userId);

if (profilePlanError) {
  console.error("❌ Failed to update provider_profiles.plan_type:", profilePlanError.message);
  throw profilePlanError;
}

  console.log("✅ Platform plan activated successfully.");
  break;
}

      case "checkout.session.expired": {
        const session = event.data.object;
        console.log("ℹ️ Checkout session expired:", session.id);
        await handlePlatformCheckoutSessionEnded(session, "expired");
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        console.log("ℹ️ Checkout async payment failed:", session.id);
        await handlePlatformCheckoutSessionEnded(session, "async_payment_failed");
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handling error:", error.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "D44M API running" });
});

app.get("/test-checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Digital promotion services",
              description: "Test payment",
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.district44media.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.district44media.com/cancel",
    });

    return res.redirect(session.url);
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ error: "Unable to create checkout session" });
  }
});

app.post("/create-checkout", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      company,
      description,
      invoiceReference,
      amount,
    } = req.body;

    const parsedAmount = Number(amount);

    if (!email || !description || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Missing or invalid payment data." });
    }

    if (parsedAmount < 10) {
      return res.status(400).json({ error: "Minimum payment amount is CHF 10." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: "Digital promotion services",
              description: description,
            },
            unit_amount: Math.round(parsedAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.district44media.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.district44media.com/cancel",
      metadata: {
        first_name: firstName || "",
        last_name: lastName || "",
        company: company || "",
        invoice_reference: invoiceReference || "",
        service_description: description || "",
        amount_chf: parsedAmount.toString(),
      },
    });

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ error: "Unable to create checkout session" });
  }
});

app.post("/create-platform-checkout", async (req, res) => {
  let checkoutId = null;
  let reservedAmbassadorCoupon = false;

  try {
    const {
      user_id,
      listing_id,
      plan_code,
      locale,
      selected_discount_type,
      ambassador_coupon_id,
    } = req.body;

    if (!user_id || !plan_code) {
      return res
        .status(400)
        .json({ error: "Missing required fields: user_id and plan_code." });
    }

    const plan = PLAN_CATALOG[plan_code];

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan_code." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("provider_profiles")
      .select(`
        founder_discount_count,
        founder_discount_percent,
        has_referral_discount,
        referral_discount_used,
        welcome_discount_count,
        is_founder,
        is_founder_by_city
      `)
      .eq("user_id", user_id)
      .single();

    if (profileError) {
      console.error("❌ Failed to load provider profile:", profileError.message);
      return res.status(500).json({ error: "Unable to load provider profile" });
    }

    const discountResolution = await resolveCheckoutDiscount(
      profile,
      plan.internalPlanType,
      selected_discount_type,
      ambassador_coupon_id,
      user_id
    );

    if (discountResolution.error) {
      return res.status(discountResolution.status || 400).json({
        error: discountResolution.error,
      });
    }

    const { discountType, discountPercent } = discountResolution;
    const ambassadorCouponId = discountResolution.ambassadorCouponId || null;

    const originalAmount = Number(plan.amount);
    const finalAmount = applyDiscount(originalAmount, discountPercent);

    const { data: checkoutRecord, error: checkoutInsertError } = await supabase
      .from("platform_checkouts")
      .insert({
        user_id,
        listing_id: listing_id || null,
        plan_code,
        duration_days: plan.durationDays,
        internal_plan_type: plan.internalPlanType,
        original_amount: originalAmount,
        final_amount: finalAmount,
        discount_type: discountType,
        discount_percent: discountPercent,
        ambassador_coupon_id: null,
        status: "pending",
        provider_name: "stripe",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (checkoutInsertError || !checkoutRecord) {
      console.error(
        "❌ Failed to create platform checkout:",
        checkoutInsertError?.message
      );
      return res
        .status(500)
        .json({ error: "Unable to create internal checkout record" });
    }

    checkoutId = checkoutRecord.id;

    if (discountType === "ambassador_coupon") {
      const { data: reserveResult, error: reserveError } = await supabase.rpc(
        "reserve_ambassador_coupon",
        {
          p_coupon_id: ambassadorCouponId,
          p_checkout_id: checkoutId,
          p_ambassador_user_id: user_id,
        }
      );

      if (reserveError) {
        console.error("❌ reserve_ambassador_coupon RPC failed:", reserveError.message);
        await supabase.from("platform_checkouts").delete().eq("id", checkoutId);
        checkoutId = null;
        return res.status(400).json({ error: "coupon_not_available" });
      }

      if (!reserveResult?.ok) {
        console.error("❌ reserve_ambassador_coupon returned error:", reserveResult);
        await supabase.from("platform_checkouts").delete().eq("id", checkoutId);
        checkoutId = null;
        return res.status(400).json({
          error: reserveResult?.error || "coupon_not_available",
        });
      }

      reservedAmbassadorCoupon = true;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.stripeLabel,
              description: plan.stripeDescription,
            },
            unit_amount: Math.round(finalAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url:
        "https://www.district44media.com/success?flow=checkout&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.district44media.com/cancel?flow=checkout",
      metadata: {
        source: "platform",
        checkout_id: String(checkoutId),
      },
    });

    const { error: checkoutUpdateError } = await supabase
      .from("platform_checkouts")
      .update({
        provider_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", checkoutId);

    if (checkoutUpdateError) {
      console.error(
        "⚠️ Failed to save provider session id:",
        checkoutUpdateError.message
      );
    }

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("platform Stripe error:", error.message);

    if (checkoutId && reservedAmbassadorCoupon) {
      await releaseAmbassadorCouponForCheckout(checkoutId);
    }

    if (checkoutId) {
      await supabase
        .from("platform_checkouts")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", checkoutId)
        .eq("status", "pending");
    }

    return res
      .status(500)
      .json({ error: "Unable to create platform checkout session" });
  }
});

if (fs.existsSync(FRONTEND_INDEX)) {
  app.use(express.static(FRONTEND_DIST, { index: false }));
  app.get(/.*/, (req, res) => {
    res.sendFile(FRONTEND_INDEX);
  });
} else {
  console.log("frontend/dist is missing and API-only mode is active");
  app.get("/", (req, res) => {
    res.send("D44M API running");
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});