const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, default: "" },
        billing: { type: String, enum: ["monthly", "yearly", "one-time"], default: "monthly" },
        priceMonthly: { type: Number, default: 0 },
        priceYearly: { type: Number, default: 0 },
        features: { type: [String], default: [] },
        limits: {
            maxListings: { type: Number, default: 0 },
            maxAgents: { type: Number, default: 0 },
            featuredListings: { type: Number, default: 0 },
            teamMembers: { type: Number, default: 0 },
        },
        metadata: { type: mongoose.Schema.Types.Mixed },
        active: { type: Boolean, default: true },
        tenantScoped: { type: Boolean, default: false }, // plan created for a specific tenant/agency
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

subscriptionPlanSchema.index({ slug: 1 });

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
