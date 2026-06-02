const AppError = require("../utils/AppError");
const Property = require("../models/Property");

// Generic middleware factory to enforce numeric feature limits.
// options: { feature: 'listings', owner: 'user'|'tenant', getLimit: (req)=>number, getCount: async(req)=>number }
function requireFeatureLimit(options) {
    return async function (req, res, next) {
        try {
            const limit = typeof options.getLimit === "function" ? options.getLimit(req) : null;
            if (limit === null || limit === undefined) return next();

            const used = typeof options.getCount === "function" ? await options.getCount(req) : 0;
            if (used >= limit) {
                throw new AppError(`Your current plan allows ${limit} ${options.feature || "items"}. Upgrade your plan to add more.`, 403);
            }
            return next();
        } catch (err) {
            return next(err);
        }
    };
}

// Prebuilt listing limit middleware for convenience
const listingsLimit = requireFeatureLimit({
    feature: "listings",
    getLimit: (req) => {
        if (req.user && typeof req.user.settings?.maxListings === "number") return req.user.settings.maxListings;
        if (req.tenant && typeof req.tenant.settings?.maxListings === "number") return req.tenant.settings.maxListings;
        return null;
    },
    getCount: async (req) => {
        const filter = { status: { $nin: ["archived", "closed"] } };
        if (req.user && req.user.role === "agent") filter.agentId = req.userId;
        if (req.tenantId) filter.tenantId = req.tenantId;
        return Property.countDocuments(filter);
    },
});

module.exports = { requireFeatureLimit, listingsLimit };
