const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: false, default: null, index: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        provider: { type: String },
        providerId: { type: String },
        status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending" },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

paymentTransactionSchema.index({ userId: 1, providerId: 1 });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
