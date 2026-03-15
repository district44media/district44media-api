require("dotenv").config()

const express = require("express")
const cors = require("cors")
const Stripe = require("stripe")

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "D44M API running" })
})

app.post("/create-checkout", async (req, res) => {
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
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      success_url: "https://district44media.com/success",
      cancel_url: "https://district44media.com/cancel",
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error("Stripe error:", error.message)
    res.status(500).json({ error: "Unable to create checkout session" })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})