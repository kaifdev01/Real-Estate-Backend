const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");
const { createCheckoutSession, recordTransaction, verifyStripeEvent } = require("../services/paymentService");
const { assignPlanToUser, assignPlanToTenant, findPlan, getAllPlans } = require("../services/subscriptionService");
const PaymentTransaction = require("../models/PaymentTransaction");
const UserSubscription = require("../models/UserSubscription");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

exports.getPlans = asyncHandler(async (req, res) => {
    const plans = await getAllPlans();
    res.json({ success: true, data: { plans } });
});

exports.createCheckout = asyncHandler(async (req, res) => {
    let {
        currency = "usd",
        planSlug,
        successUrl,
        cancelUrl,
        billingInterval = "monthly",
        userId,
        tenantId,
        customerEmail,
        customerName,
    } = req.body;

    if (!planSlug || !successUrl || !cancelUrl) {
        throw new AppError("Missing required fields.", 400);
    }

    const plan = await findPlan(planSlug);
    if (!plan) {
        throw new AppError("Selected plan is invalid.", 400);
    }

    if (!userId && !tenantId) {
        throw new AppError("User or tenant identifier is required.", 400);
    }

    if (!["monthly", "yearly"].includes(billingInterval)) {
        throw new AppError("Billing interval must be monthly or yearly.", 400);
    }

    let checkoutUser = null;
    let checkoutTenant = null;

    if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new AppError("Checkout user identifier is invalid.", 400);
        }
        checkoutUser = await User.findById(userId).lean();
        if (!checkoutUser) {
            throw new AppError("Checkout user was not found.", 404);
        }
    }

    if (tenantId) {
        if (!mongoose.isValidObjectId(tenantId)) {
            throw new AppError("Checkout tenant identifier is invalid.", 400);
        }
        checkoutTenant = await Tenant.findById(tenantId).lean();
        if (!checkoutTenant) {
            throw new AppError("Checkout tenant was not found.", 404);
        }
        if (checkoutUser?.tenantId && checkoutUser.tenantId.toString() !== tenantId.toString()) {
            throw new AppError("Checkout user does not belong to this agency.", 403);
        }
    }

    const planAmount = billingInterval === "yearly" ? plan.priceYearly || plan.priceMonthly : plan.priceMonthly;
    const amount = Number(planAmount || 0);
    const planName = plan.name || planSlug;

    if (!amount || amount <= 0) {
        if (tenantId) {
            await assignPlanToTenant(tenantId, planSlug, {
                status: "active",
                billingInterval,
                paymentProvider: "stripe",
            });
        } else {
            await assignPlanToUser(userId, planSlug, {
                status: "active",
                billingInterval,
                paymentProvider: "stripe",
            });
        }

        return res.json({ success: true, data: { message: "Free plan activated or no payment required." } });
    }

    try {
        const session = await createCheckoutSession({
            amount,
            currency,
            successUrl,
            cancelUrl,
            metadata: { planSlug, planName, billingInterval, userId, tenantId },
            customerEmail: customerEmail || checkoutUser?.email || checkoutTenant?.email,
            customerName: customerName || [checkoutUser?.firstName, checkoutUser?.lastName].filter(Boolean).join(" ") || checkoutTenant?.name,
        });

        await recordTransaction({
            userId,
            tenantId,
            amount,
            currency: currency.toUpperCase(),
            provider: "stripe",
            providerId: session.id,
            status: "pending",
            metadata: { planSlug, billingInterval, userId, tenantId, stripeSubscriptionId: session.subscription },
        });

        return res.json({ success: true, data: { url: session.url, id: session.id } });
    } catch (e) {
        throw new AppError(e.message || "Payment initialization failed.", 500);
    }
});

exports.webhookHandler = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event = req.body;

    if (process.env.STRIPE_SECRET && process.env.STRIPE_WEBHOOK_SECRET) {
        try {
            event = await verifyStripeEvent(req.rawBody || req.body, sig);
        } catch (err) {
            console.warn("Stripe webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    const type = event.type;

    if (type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata || {};

        await PaymentTransaction.findOneAndUpdate(
            { providerId: session.id },
            {
                status: session.payment_status === "paid" ? "success" : "pending",
                metadata: { ...metadata, sessionId: session.id },
            }
        );

        if (session.payment_status === "paid") {
            if (metadata.tenantId) {
                await assignPlanToTenant(metadata.tenantId, metadata.planSlug, {
                    status: "active",
                    billingInterval: metadata.billingInterval || "monthly",
                    paymentProvider: "stripe",
                    paymentMeta: { sessionId: session.id },
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    nextBillingDate: session.expires_at ? new Date(session.expires_at * 1000) : null,
                });
            } else if (metadata.userId) {
                await assignPlanToUser(metadata.userId, metadata.planSlug, {
                    status: "active",
                    billingInterval: metadata.billingInterval || "monthly",
                    paymentProvider: "stripe",
                    paymentMeta: { sessionId: session.id },
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    nextBillingDate: session.expires_at ? new Date(session.expires_at * 1000) : null,
                });
            }
        }
    }

    if (type === "invoice.payment_succeeded") {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const nextBillingDate = invoice.lines?.data?.[0]?.period?.end ? new Date(invoice.lines.data[0].period.end * 1000) : null;

        const updatedTx = await PaymentTransaction.findOneAndUpdate(
            { providerId: invoice.payment_intent },
            {
                status: "success",
                metadata: {
                    invoiceId: invoice.id,
                    subscriptionId,
                    nextBillingDate,
                    stripeCustomerId: invoice.customer,
                },
            },
            { new: true }
        );

        if (!updatedTx) {
            await PaymentTransaction.create({
                amount: invoice.total / 100,
                currency: (invoice.currency || "usd").toUpperCase(),
                provider: "stripe",
                providerId: invoice.id,
                status: "success",
                metadata: {
                    invoiceId: invoice.id,
                    subscriptionId,
                    nextBillingDate,
                    stripeCustomerId: invoice.customer,
                },
            });
        }

        await UserSubscription.findOneAndUpdate(
            { "paymentMeta.stripeSubscriptionId": subscriptionId },
            { status: "active", nextBillingDate },
            { new: true }
        );
    }

    if (type === "payment_intent.payment_failed" || type === "checkout.session.async_payment_failed") {
        const payload = event.data.object;
        await PaymentTransaction.findOneAndUpdate(
            { providerId: payload.id },
            { status: "failed", metadata: { ...payload.last_payment_error } }
        );
    }

    res.json({ received: true });
});

exports.getHistory = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const txs = await PaymentTransaction.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { transactions: txs } });
});
