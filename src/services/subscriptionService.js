const SubscriptionPlan = require("../models/SubscriptionPlan");
const UserSubscription = require("../models/UserSubscription");
const User = require("../models/User");
const Tenant = require("../models/Tenant");
const { PLAN_LIMITS } = require("../utils/subscriptionPlans");

async function findPlan(identifier) {
    if (!identifier) return null;

    if (typeof identifier === "object" && identifier !== null && identifier.slug) {
        return identifier;
    }

    let plan = null;
    if (typeof identifier === "string" && /^[0-9a-fA-F]{24}$/.test(identifier)) {
        plan = await SubscriptionPlan.findById(identifier).lean();
    }
    if (!plan && typeof identifier === "string") {
        plan = await SubscriptionPlan.findOne({ slug: identifier }).lean();
    }
    if (!plan && typeof identifier === "string") {
        const p = PLAN_LIMITS[identifier];
        if (p) {
            plan = {
                slug: identifier,
                name: p.name,
                description: p.name,
                billing: p.billing || "monthly",
                priceMonthly: p.price || 0,
                priceYearly: (p.price || 0) * 12,
                features: p.features || [],
                limits: {
                    maxListings: p.maxListings || 0,
                    maxAgents: p.maxAgents || 0,
                    featuredListings: p.featuredListings || 0,
                    teamMembers: p.teamMembers || 0,
                },
                active: p.active !== false,
            };
        }
    }
    return plan;
}

async function getAllPlans() {
    const plans = await SubscriptionPlan.find({}).sort({ priceMonthly: 1 }).lean();
    if (plans && plans.length) return plans;
    // construct from static config
    return Object.entries(PLAN_LIMITS).map(([id, p]) => ({
        slug: id,
        name: p.name,
        description: p.name,
        billing: p.billing || "monthly",
        priceMonthly: p.price || 0,
        priceYearly: (p.price || 0) * 12,
        features: p.features || [],
        limits: { maxListings: p.maxListings || 0, maxAgents: p.maxAgents || 0, featuredListings: p.featuredListings || 0 },
        active: p.active !== false,
    }));
}

async function createPlan(data) {
    const slug = (data.slug || data.name || "plan").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const payload = { ...data, slug };
    const plan = await SubscriptionPlan.create(payload);
    return plan.toObject();
}

async function updatePlan(id, data) {
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    return plan;
}

async function deletePlan(id) {
    return SubscriptionPlan.findByIdAndDelete(id);
}

async function assignPlanToUser(userId, planIdOrSlug, opts = {}) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const plan = await findPlan(planIdOrSlug);
    if (!plan) throw new Error("Plan not found");

    const now = new Date();
    const sub = await UserSubscription.findOneAndUpdate(
        { userId },
        {
            userId,
            planId: plan._id || null,
            planSnapshot: plan,
            billingInterval: opts.billingInterval || plan.billing || "monthly",
            startDate: now,
            endDate: opts.endDate || null,
            nextBillingDate: opts.nextBillingDate || null,
            status: opts.status || "active",
            paymentProvider: opts.paymentProvider || "stripe",
            paymentMeta: opts.paymentMeta || {},
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update User subscription and settings for quick checks
    const updates = {
        subscription: {
            plan: plan.slug || plan.name || "custom",
            startDate: now,
            endDate: opts.endDate || null,
            stripeSubscriptionId: opts.stripeSubscriptionId || user.subscription?.stripeSubscriptionId,
            stripeCustomerId: opts.stripeCustomerId || user.subscription?.stripeCustomerId,
        },
        settings: {
            ...user.settings,
            maxListings: (plan.limits && plan.limits.maxListings) || user.settings?.maxListings || 0,
        },
    };

    await User.findByIdAndUpdate(userId, updates, { new: true });

    return sub.toObject();
}

async function assignPlanToTenant(tenantId, planIdOrSlug, opts = {}) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error("Tenant not found");

    const plan = await findPlan(planIdOrSlug);
    if (!plan) throw new Error("Plan not found");

    const now = new Date();
    const sub = await UserSubscription.findOneAndUpdate(
        { tenantId },
        {
            tenantId,
            planId: plan._id || null,
            planSnapshot: plan,
            billingInterval: opts.billingInterval || plan.billing || "monthly",
            startDate: now,
            endDate: opts.endDate || null,
            nextBillingDate: opts.nextBillingDate || null,
            status: opts.status || "active",
            paymentProvider: opts.paymentProvider || "stripe",
            paymentMeta: opts.paymentMeta || {},
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const updates = {
        subscription: {
            plan: plan.slug || plan.name || "custom",
            startDate: now,
            endDate: opts.endDate || null,
            stripeSubscriptionId: opts.stripeSubscriptionId || tenant.subscription?.stripeSubscriptionId,
            stripeCustomerId: opts.stripeCustomerId || tenant.subscription?.stripeCustomerId,
        },
        settings: {
            ...tenant.settings,
            maxAgents: (plan.limits && plan.limits.maxAgents) || tenant.settings?.maxAgents || 0,
            maxListings: (plan.limits && plan.limits.maxListings) || tenant.settings?.maxListings || 0,
        },
    };

    await Tenant.findByIdAndUpdate(tenantId, updates, { new: true });

    return sub.toObject();
}

async function seedDefaultPlans() {
    const count = await SubscriptionPlan.countDocuments();
    if (count > 0) return;

    const docs = Object.entries(PLAN_LIMITS).map(([slug, p]) => ({
        slug,
        name: p.name,
        description: p.name,
        billing: p.billing || "monthly",
        priceMonthly: p.price || 0,
        priceYearly: (p.price || 0) * 12,
        features: p.features || [],
        limits: { maxListings: p.maxListings || 0, maxAgents: p.maxAgents || 0 },
        active: p.active !== false,
    }));

    await SubscriptionPlan.insertMany(docs);
}

module.exports = { getAllPlans, createPlan, updatePlan, deletePlan, assignPlanToUser, assignPlanToTenant, findPlan, seedDefaultPlans };
