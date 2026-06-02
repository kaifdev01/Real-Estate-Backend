const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { getPlan, getPlanList } = require("../utils/subscriptionPlans");

const formatTenant = async (tenant) => {
  const [agents, listings] = await Promise.all([
    User.countDocuments({ tenantId: tenant._id, role: "agent" }),
    Property.countDocuments({ tenantId: tenant._id }),
  ]);

  return {
    id: tenant._id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone || "",
    plan: tenant.subscription?.plan || "free",
    status: tenant.status,
    agents,
    listings,
    maxAgents: tenant.settings?.maxAgents,
    maxListings: tenant.settings?.maxListings,
    joined: tenant.createdAt,
  };
};

const formatAgent = async (agent) => ({
  id: agent._id,
  firstName: agent.firstName,
  lastName: agent.lastName,
  email: agent.email,
  phone: agent.phone || "",
  tenant: agent.tenantId?.name || null,
  status: agent.status,
  plan: agent.subscription?.plan || "free",
  settings: agent.settings || { maxListings: 0 },
  joined: agent.createdAt,
});

const relativeTimestamp = (doc) => doc.updatedAt || doc.createdAt || new Date();

exports.getOverview = asyncHandler(async (req, res) => {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalTenants, activeListings, newSignups, revenueAgg, recentTenants, recentProperties, recentUsers] = await Promise.all([
    Tenant.countDocuments(),
    Property.countDocuments({ status: "approved" }),
    User.countDocuments({ createdAt: { $gte: since30 } }),
    Property.aggregate([
      { $match: { status: { $in: ["sold", "rented", "closed"] } } },
      { $group: { _id: null, revenue: { $sum: "$price" } } },
    ]),
    Tenant.find().sort({ createdAt: -1 }).limit(5).lean(),
    Property.find().sort({ updatedAt: -1 }).limit(8).populate("tenantId", "name").lean(),
    User.find({ role: { $in: ["agency_admin", "agent"] } }).sort({ createdAt: -1 }).limit(8).populate("tenantId", "name").lean(),
  ]);

  const propertyActivity = recentProperties.map((property) => ({
    id: `property-${property._id}`,
    message: `${property.title} is ${property.status}`,
    target: property.tenantId?.name || property.city || "Property",
    type: property.status === "rejected" ? "error" : property.status === "submitted" ? "warning" : "info",
    createdAt: relativeTimestamp(property),
  }));

  const userActivity = recentUsers.map((user) => ({
    id: `user-${user._id}`,
    message: `${user.firstName} ${user.lastName} joined as ${user.role.replace("_", " ")}`,
    target: user.tenantId?.name || "Platform",
    type: "success",
    createdAt: user.createdAt,
  }));

  res.json({
    success: true,
    data: {
      stats: {
        totalTenants,
        activeListings,
        monthlyRevenue: revenueAgg[0]?.revenue || 0,
        newSignups,
      },
      recentTenants,
      activity: [...propertyActivity, ...userActivity]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    },
  });
});

exports.getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  const data = await Promise.all(tenants.map(formatTenant));
  res.json({ success: true, data: { tenants: data } });
});

exports.getAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: "agent" })
    .populate("tenantId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const data = await Promise.all(agents.map(formatAgent));
  res.json({ success: true, data: { agents: data } });
});

exports.updateAgentSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!plan) {
    throw new AppError("Plan is required.", 400);
  }

  const validPlans = ["free", "basic", "pro", "enterprise"];
  if (!validPlans.includes(plan)) {
    throw new AppError("Invalid plan selected.", 400);
  }

  const planConfig = getPlan(plan);
  const updates = {
    subscription: { plan, startDate: new Date() },
    settings: { maxListings: planConfig.maxListings },
  };

  const agent = await User.findOneAndUpdate(
    { _id: req.params.id, role: "agent" },
    updates,
    { new: true, runValidators: true }
  );

  if (!agent) throw new AppError("Agent not found.", 404);

  res.json({ success: true, message: "Agent subscription updated.", data: { agent: agent.toPublicJSON() } });
});

exports.updateTenant = asyncHandler(async (req, res) => {
  const allowed = ["name", "email", "phone", "status"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (req.body.plan !== undefined) {
    const plan = getPlan(req.body.plan);
    updates.subscription = { plan: req.body.plan, startDate: new Date() };
    updates.settings = { maxAgents: plan.maxAgents, maxListings: plan.maxListings };
  }

  const tenant = await Tenant.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!tenant) throw new AppError("Tenant not found.", 404);

  res.json({ success: true, message: "Tenant updated.", data: { tenant: await formatTenant(tenant) } });
});

exports.createTenant = asyncHandler(async (req, res) => {
  const { name, email, phone, plan = "free" } = req.body;
  if (!name || !email) throw new AppError("Agency name and email are required.", 400);

  const slugBase = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const slug = await Tenant.exists({ slug: slugBase }) ? `${slugBase}-${Date.now()}` : slugBase;
  const planConfig = getPlan(plan);

  const tenant = await Tenant.create({
    name,
    slug,
    email,
    phone,
    status: "trial",
    subscription: { plan, startDate: new Date() },
    settings: { maxAgents: planConfig.maxAgents, maxListings: planConfig.maxListings },
  });

  res.status(201).json({ success: true, message: "Tenant created.", data: { tenant: await formatTenant(tenant) } });
});

exports.deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
  if (!tenant) throw new AppError("Tenant not found.", 404);
  res.json({ success: true, message: "Tenant cancelled.", data: { tenant: await formatTenant(tenant) } });
});

const SubscriptionPlan = require("../models/SubscriptionPlan");

exports.getPlans = asyncHandler(async (req, res) => {
  // Try DB-driven plans first; fallback to static plans
  const plans = await SubscriptionPlan.find({}).sort({ priceMonthly: 1 }).lean();
  if (plans && plans.length) {
    return res.json({ success: true, data: { plans } });
  }

  res.json({ success: true, data: { plans: getPlanList() } });
});

exports.createPlan = asyncHandler(async (req, res) => {
  const { name, slug, description, billing, priceMonthly, priceYearly, features, limits, active } = req.body;
  if (!name) throw new AppError("Plan name is required.", 400);
  const { createPlan } = require("../services/subscriptionService");
  const plan = await createPlan({ name, slug, description, billing, priceMonthly, priceYearly, features, limits, active });
  res.status(201).json({ success: true, message: "Plan created.", data: { plan } });
});

exports.updatePlan = asyncHandler(async (req, res) => {
  const { updatePlan } = require("../services/subscriptionService");
  const plan = await updatePlan(req.params.id, req.body);
  if (!plan) throw new AppError("Plan not found.", 404);
  res.json({ success: true, message: "Plan updated.", data: { plan } });
});

exports.deletePlan = asyncHandler(async (req, res) => {
  const { deletePlan } = require("../services/subscriptionService");
  await deletePlan(req.params.id);
  res.json({ success: true, message: "Plan deleted." });
});

exports.getSettings = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      settings: [
        { key: "platform_name", label: "Platform Name", value: "LuxEstate", type: "text" },
        { key: "support_email", label: "Support Email", value: process.env.NODEMAILER_USER || "support@luxestate.pk", type: "email" },
        { key: "max_images", label: "Max Images per Listing", value: "10", type: "number" },
        { key: "client_url", label: "Client URL", value: process.env.CLIENT_URL || "", type: "text" },
        { key: "api_env", label: "Environment", value: process.env.NODE_ENV || "development", type: "text" },
      ],
      flags: [
        { key: "featured_listings", label: "Featured Listings", description: "Allow agencies to promote listings", enabled: true },
        { key: "map_search", label: "Map Search", description: "Enable map-based property search", enabled: true },
        { key: "agent_registration", label: "Agent Self-Register", description: "Allow agents to register independently", enabled: true },
        { key: "buyer_inquiries", label: "Buyer Inquiries", description: "Enable inquiry system for buyers", enabled: true },
        { key: "visit_booking", label: "Visit Booking", description: "Allow buyers to book property visits", enabled: true },
        { key: "email_notifications", label: "Email Notifications", description: "Send automated email notifications", enabled: Boolean(process.env.NODEMAILER_USER) },
      ],
    },
  });
});

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const [tenants, users, properties] = await Promise.all([
    Tenant.find().sort({ updatedAt: -1 }).limit(15).lean(),
    User.find().sort({ updatedAt: -1 }).limit(15).populate("tenantId", "name").lean(),
    Property.find().sort({ updatedAt: -1 }).limit(15).populate("tenantId", "name").lean(),
  ]);

  const logs = [
    ...tenants.map((tenant) => ({
      id: `tenant-${tenant._id}`,
      action: `Tenant ${tenant.status}`,
      actor: "System",
      actorRole: "system",
      target: tenant.name,
      type: tenant.status === "suspended" || tenant.status === "cancelled" ? "suspend" : "update",
      ip: "server",
      timestamp: relativeTimestamp(tenant),
    })),
    ...users.map((user) => ({
      id: `user-${user._id}`,
      action: `${user.role.replace("_", " ")} ${user.status}`,
      actor: user.tenantId?.name || "Platform",
      actorRole: user.role,
      target: `${user.firstName} ${user.lastName}`,
      type: user.status === "active" ? "create" : "update",
      ip: "server",
      timestamp: relativeTimestamp(user),
    })),
    ...properties.map((property) => ({
      id: `property-${property._id}`,
      action: `Property ${property.status}`,
      actor: property.tenantId?.name || "Platform",
      actorRole: "agency_admin",
      target: property.title,
      type: property.status === "rejected" ? "delete" : "update",
      ip: "server",
      timestamp: relativeTimestamp(property),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);

  res.json({ success: true, data: { logs } });
});

// ─── GET /api/admin/featured-properties — Get featured properties awaiting approval ────

exports.getFeaturedPropertiesForApproval = asyncHandler(async (req, res) => {
  const properties = await Property.find({
    featured: true,
    status: "submitted",
  })
    .populate("agentId", "firstName lastName email phone")
    .populate("tenantId", "name slug logo")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: { properties } });
});

// ─── PATCH /api/admin/featured-properties/:id/approve — Super admin approves featured property ────

exports.approveFeaturedProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({
    _id: req.params.id,
    featured: true,
    status: "submitted",
  });

  if (!property) {
    throw new AppError("Featured property not found or not pending approval.", 404);
  }

  property.status = "approved";
  property.rejectionReason = undefined;
  await property.save();

  res.json({
    success: true,
    message: "Featured property approved and is now live.",
    data: { property },
  });
});

// ─── PATCH /api/admin/featured-properties/:id/reject — Super admin rejects featured property ────

exports.rejectFeaturedProperty = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new AppError("Rejection reason is required.", 400);
  }

  const property = await Property.findOne({
    _id: req.params.id,
    featured: true,
    status: "submitted",
  });

  if (!property) {
    throw new AppError("Featured property not found or not pending approval.", 404);
  }

  property.status = "rejected";
  property.rejectionReason = rejectionReason;
  await property.save();

  res.json({
    success: true,
    message: "Featured property rejected.",
    data: { property },
  });
});
