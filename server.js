require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook Stripe : DOIT être déclaré avant express.json()
app.post("/stripe-webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["stripe-signature"];

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

        console.log("✅ Payment successful");
        console.log("Session ID:", session.id);
        console.log("Customer email:", session.customer_email);
        console.log("Metadata:", session.metadata);

        // Ici plus tard tu pourras :
        // - enregistrer le paiement en base
        // - envoyer un email
        // - générer une facture
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
      success_url: "https://district44media.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://district44media.com/cancel",
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
      success_url: "https://district44media.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://district44media.com/cancel",
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});