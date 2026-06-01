const PLAN_LIMITS = {
  free: {
    name: "Free",
    price: 0,
    billing: "monthly",
    maxAgents: 1,
    maxListings: 3,
    features: ["1 Agent", "3 Listings", "Basic Dashboard", "Email Support"],
    popular: false,
    active: true,
  },
  basic: {
    name: "Starter",
    price: 4999,
    billing: "monthly",
    maxAgents: 3,
    maxListings: 20,
    features: ["3 Agents", "20 Listings", "Basic Analytics", "Email Support"],
    popular: false,
    active: true,
  },
  pro: {
    name: "Pro",
    price: 14999,
    billing: "monthly",
    maxAgents: 15,
    maxListings: 150,
    features: ["15 Agents", "150 Listings", "Advanced Analytics", "Priority Support", "Featured Listings"],
    popular: true,
    active: true,
  },
  enterprise: {
    name: "Enterprise",
    price: 39999,
    billing: "monthly",
    maxAgents: 999,
    maxListings: 999,
    features: ["Unlimited Agents", "Unlimited Listings", "Full Analytics", "Dedicated Support", "Custom Branding", "API Access"],
    popular: false,
    active: true,
  },
};

const getPlan = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

const getPlanList = () =>
  Object.entries(PLAN_LIMITS).map(([id, plan]) => ({
    id,
    ...plan,
  }));

module.exports = { PLAN_LIMITS, getPlan, getPlanList };
