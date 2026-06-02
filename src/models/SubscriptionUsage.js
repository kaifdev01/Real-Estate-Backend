const mongoose = require("mongoose");

const subscriptionUsageSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, // user or tenant
        ownerType: { type: String, enum: ["user", "tenant"], default: "user" },
        feature: { type: String, required: true },
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 0 },
        periodStart: { type: Date },
        periodEnd: { type: Date },
    },
    { timestamps: true }
);

subscriptionUsageSchema.index({ ownerId: 1, feature: 1 });

module.exports = mongoose.model("SubscriptionUsage", subscriptionUsageSchema);
