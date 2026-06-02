const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: false, index: true },
        planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: false },
        planSnapshot: { type: mongoose.Schema.Types.Mixed }, // copy of plan at time of subscription
        billingInterval: { type: String, enum: ["monthly", "yearly", "one-time"], default: "monthly" },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        nextBillingDate: { type: Date },
        status: { type: String, enum: ["active", "expired", "cancelled", "pending", "trialing", "suspended"], default: "pending" },
        trialEndsAt: { type: Date },
        paymentProvider: { type: String },
        paymentMeta: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

userSubscriptionSchema.index({ userId: 1, tenantId: 1 });

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);
