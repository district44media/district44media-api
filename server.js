require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const { PLAN_CATALOG } = require("./catalog/plans");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY);

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
  console.log("Customer email:", session.customer_email);
  console.log("Metadata:", metadata);

  if (metadata.source !== "platform") {
    console.log("ℹ️ Non-platform checkout, skipping platform activation logic.");
    break;
  }

  const userId = metadata.user_id;
  const listingId = metadata.listing_id || null;
  const internalPlanType = metadata.internal_plan_type;
  const durationDays = Number(metadata.duration_days);

  if (!userId || !internalPlanType || !Number.isFinite(durationDays) || durationDays <= 0) {
    console.error("❌ Missing or invalid platform metadata.");
    break;
  }

  // 1. Update provider_profiles.plan_type
  const { error: profileError } = await supabase
    .from("provider_profiles")
    .update({
      plan_type: internalPlanType,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (profileError) {
    console.error("❌ Failed to update provider_profiles:", profileError.message);
    throw profileError;
  }

  // 2. Load current listing expiry
  let listingQuery = supabase
    .from("listings")
    .select("id, premium_expiry")
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

  // 3. Extend premium_expiry from current expiry if still active, otherwise from now
  for (const listing of listingsData) {
    const now = new Date();
    const currentExpiry = listing.premium_expiry ? new Date(listing.premium_expiry) : null;

    const baseDate =
      currentExpiry && currentExpiry.getTime() > now.getTime()
        ? currentExpiry
        : now;

    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + durationDays);

    const { error: listingUpdateError } = await supabase
      .from("listings")
      .update({
        premium_expiry: newExpiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", listing.id);

    if (listingUpdateError) {
      console.error(
        `❌ Failed to update listing ${listing.id}:`,
        listingUpdateError.message
      );
      throw listingUpdateError;
    }
  }

  console.log("✅ Platform plan activated successfully.");
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

app.get("/", (req, res) => {
  res.send("D44M API running");
});

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
      return res.status(400).json({ error: "Minimum payment amount is €10." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
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
        amount_eur: parsedAmount.toString(),
      },
    });

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ error: "Unable to create checkout session" });
  }
});

app.post("/create-platform-checkout", async (req, res) => {
  try {
    const { user_id, listing_id, plan_code, locale } = req.body;

    if (!user_id || !plan_code) {
      return res.status(400).json({ error: "Missing required fields: user_id and plan_code." });
    }

    const plan = PLAN_CATALOG[plan_code];

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan_code." });
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
            unit_amount: Math.round(plan.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.district44media.com/success?flow=checkout&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.district44media.com/cancel?flow=checkout",
      metadata: {
        source: "platform",
        user_id: String(user_id),
        listing_id: listing_id ? String(listing_id) : "",
        plan_code: String(plan_code),
        internal_plan_type: String(plan.internalPlanType),
        duration_days: String(plan.durationDays),
        locale: locale ? String(locale) : "fr",
      },
    });

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("platform Stripe error:", error.message);
    return res.status(500).json({ error: "Unable to create platform checkout session" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});