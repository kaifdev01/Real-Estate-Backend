const PaymentTransaction = require("../models/PaymentTransaction");
let stripe = null;
if (process.env.STRIPE_SECRET) {
    try {
        stripe = require("stripe")(process.env.STRIPE_SECRET);
    } catch (e) {
        console.warn("Stripe not configured or package missing.");
    }
}

function getStripe() {
    if (!stripe) throw new Error("Stripe not configured");
    return stripe;
}

async function getStripeCustomer({ email, name, metadata = {} }) {
    const stripeClient = getStripe();
    if (!email) throw new Error("Customer email is required");

    const existing = await stripeClient.customers.list({ email, limit: 1 });
    if (existing.data.length) return existing.data[0];

    return stripeClient.customers.create({ email, name, metadata });
}

async function createCheckoutSession({ amount, currency = "usd", successUrl, cancelUrl, metadata = {}, lineItems = [], customerEmail, customerName }) {
    const stripeClient = getStripe();
    const customer = customerEmail ? await getStripeCustomer({ email: customerEmail, name: customerName, metadata }) : undefined;

    const recurring = metadata.billingInterval && ["monthly", "yearly"].includes(metadata.billingInterval);
    const stripeInterval = metadata.billingInterval === "yearly" ? "year" : "month";
    const sessionPayload = {
        payment_method_types: ["card"],
        line_items: lineItems.length
            ? lineItems
            : [{
                price_data: {
                    currency,
                    product_data: { name: metadata.planName || "Subscription" },
                    unit_amount: amount,
                    ...(recurring ? { recurring: { interval: stripeInterval } } : {}),
                },
                quantity: 1,
            }],
        mode: recurring ? "subscription" : "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        customer: customer?.id,
        ...(!customer && customerEmail ? { customer_email: customerEmail } : {}),
    };

    const session = await stripeClient.checkout.sessions.create(sessionPayload);
    return session;
}

async function verifyStripeEvent(rawBody, signature) {
    const stripeClient = getStripe();
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook secret not configured");
    return stripeClient.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

async function recordTransaction({ userId, tenantId, amount, currency = "USD", provider = "stripe", providerId = null, status = "pending", metadata = {} }) {
    const tx = await PaymentTransaction.create({ userId, tenantId, amount, currency, provider, providerId, status, metadata });
    return tx.toObject();
}

module.exports = { createCheckoutSession, recordTransaction, verifyStripeEvent };
