/**
 * Run this script once (node src/scripts/backfillSubscriptions.js) to populate
 * User.settings and create UserSubscription entries based on existing user.subscription.plan
 */
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");
const { assignPlanToUser, seedDefaultPlans } = require("../services/subscriptionService");

async function run() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB for subscription backfill.");
    await seedDefaultPlans();
    const users = await User.find({ role: { $in: ["agent", "agency_admin"] } });
    for (const u of users) {
        try {
            const plan = u.subscription?.plan || "free";
            await assignPlanToUser(u._id.toString(), plan, { status: "active" });
            console.log(`Backfilled ${u.email} -> ${plan}`);
        } catch (e) {
            console.warn(`Failed for ${u.email}:`, e.message);
        }
    }
    console.log("Done.");
    process.exit(0);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
