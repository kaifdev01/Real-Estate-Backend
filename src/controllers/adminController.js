const Tenant           = require("../models/Tenant");
const User             = require("../models/User");
const Property         = require("../models/Property");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const asyncHandler     = require("../utils/asyncHandler");
const AppError         = require("../utils/AppError");
const { getPlan, getPlanList, planToPayload } = require("../utils/subscriptionPlans");

const relativeTimestamp = (doc) => doc.updatedAt || doc.createdAt || new Date();

const formatTenant = async (tenant) => {
  const [agents, listings] = await Promise.all([
    User.countDocuments({ tenantId: tenant._id, role: "agent" }),
    Property.countDocuments({ tenantId: tenant._id }),
  ]);
  return {
    id: tenant._id, name: tenant.name, email: tenant.email, phone: tenant.phone || "",
    plan: tenant.subscription?.plan || "free", status: tenant.status,
    agents, listings,
    maxAgents: tenant.settings?.maxAgents,
    maxListings: tenant.settings?.maxListings,
    maxFeaturedListings: tenant.settings?.maxFeaturedListings,
    joined: tenant.createdAt,
  };
};

const formatAgentSubscription = async (agent) => {
  const listings   = await Property.countDocuments({ agentId: agent._id, status: { $nin: ["archived"] } });
  const tenantPlan = agent.tenantId?.subscription?.plan;
  const plan       = agent.subscription?.plan || tenantPlan || "free";
  const planConfig = await getPlan(plan, agent.tenantId ? "agency" : "agent");
  return {
    id: agent._id, firstName: agent.firstName, lastName: agent.lastName,
    email: agent.email, phone: agent.phone || "",
    tenant: agent.tenantId?.name || null, status: agent.status, plan,
    subscription: { plan, status: agent.subscription?.status || "active", startDate: agent.subscription?.startDate, endDate: agent.subscription?.endDate },
    settings: { maxListings: agent.settings?.maxListings ?? planConfig.maxListings, maxFeaturedListings: agent.settings?.maxFeaturedListings ?? planConfig.maxFeaturedListings },
    listings, joined: agent.createdAt,
  };
};

exports.getOverview = asyncHandler(async (req, res) => {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalTenants, activeListings, newSignups, recentProperties, recentUsers] = await Promise.all([
    Tenant.countDocuments(),
    Property.countDocuments({ status: "approved" }),
    User.countDocuments({ createdAt: { $gte: since30 } }),
    Property.find().sort({ updatedAt: -1 }).limit(8).populate("tenantId", "name").lean(),
    User.find({ role: { $in: ["agency_admin", "agent"] } }).sort({ createdAt: -1 }).limit(8).populate("tenantId", "name").lean(),
  ]);

  const activity = [
    ...recentProperties.map((p) => ({ id: `property-${p._id}`, message: `${p.title} is ${p.status}`, target: p.tenantId?.name || p.city || "Property", type: p.status === "rejected" ? "error" : p.status === "submitted" ? "warning" : "info", createdAt: relativeTimestamp(p) })),
    ...recentUsers.map((u) => ({ id: `user-${u._id}`, message: `${u.firstName} ${u.lastName} joined as ${u.role.replace("_", " ")}`, target: u.tenantId?.name || "Platform", type: "success", createdAt: u.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  res.json({ success: true, data: { stats: { totalTenants, activeListings, newSignups }, activity } });
});

exports.getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  const data = await Promise.all(tenants.map(formatTenant));
  res.json({ success: true, data: { tenants: data } });
});

exports.createTenant = asyncHandler(async (req, res) => {
  const { name, email, phone, plan = "free" } = req.body;
  if (!name || !email) throw new AppError("Agency name and email are required.", 400);
  const slugBase  = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const slug      = await Tenant.exists({ slug: slugBase }) ? `${slugBase}-${Date.now()}` : slugBase;
  const planConfig = await getPlan(plan, "agency");
  const tenant = await Tenant.create({
    name, slug, email, phone, status: "trial",
    subscription: { plan, startDate: new Date() },
    settings: { maxAgents: planConfig.maxAgents, maxListings: planConfig.maxListings, maxFeaturedListings: planConfig.maxFeaturedListings },
  });
  res.status(201).json({ success: true, message: "Tenant created.", data: { tenant: await formatTenant(tenant) } });
});

exports.updateTenant = asyncHandler(async (req, res) => {
  const allowed = ["name", "email", "phone", "status"];
  const updates = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
  if (req.body.plan !== undefined) {
    const plan = await getPlan(req.body.plan, "agency");
    updates.subscription = { plan: req.body.plan, startDate: new Date() };
    updates.settings = { maxAgents: plan.maxAgents, maxListings: plan.maxListings, maxFeaturedListings: plan.maxFeaturedListings };
  }
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!tenant) throw new AppError("Tenant not found.", 404);
  res.json({ success: true, message: "Tenant updated.", data: { tenant: await formatTenant(tenant) } });
});

exports.deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
  if (!tenant) throw new AppError("Tenant not found.", 404);
  res.json({ success: true, message: "Tenant cancelled.", data: { tenant: await formatTenant(tenant) } });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).populate("tenantId", "name").lean();
  res.json({ success: true, data: { users } });
});

exports.getAgents = asyncHandler(async (req, res) => {
  const agents = await User.find({ role: "agent" }).sort({ createdAt: -1 }).populate("tenantId", "name subscription").lean();
  const data = await Promise.all(agents.map(formatAgentSubscription));
  res.json({ success: true, data: { agents: data } });
});

exports.updateAgentSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!plan) throw new AppError("Plan is required.", 400);
  const planConfig = await getPlan(plan, "agent");
  const agent = await User.findOneAndUpdate(
    { _id: req.params.id, role: "agent" },
    { subscription: { plan, status: "active", startDate: new Date() }, settings: { maxListings: planConfig.maxListings, maxFeaturedListings: planConfig.maxFeaturedListings } },
    { new: true, runValidators: true }
  ).populate("tenantId", "name subscription");
  if (!agent) throw new AppError("Agent not found.", 404);
  res.json({ success: true, message: "Agent subscription updated.", data: { agent: await formatAgentSubscription(agent) } });
});

exports.getPlans = asyncHandler(async (req, res) => {
  const plans = await getPlanList(req.query.scope);
  res.json({ success: true, data: { plans } });
});

exports.createPlan = asyncHandler(async (req, res) => {
  const { name, slug, description, scope, billing, price, limits, features, flags, popular, active } = req.body;
  if (!name || !scope) throw new AppError("Plan name and scope are required.", 400);
  const finalSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const plan = await SubscriptionPlan.create({
    scope, slug: finalSlug, name, description: description || "", price: Number(price || 0),
    billing: billing || "monthly", limits: limits || {}, features: features || [],
    flags: flags || {}, popular: Boolean(popular), active: active !== false,
  });
  res.status(201).json({ success: true, message: "Plan created.", data: { plan: planToPayload(plan) } });
});

exports.updatePlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw new AppError("Plan not found.", 404);
  res.json({ success: true, message: "Plan updated.", data: { plan: planToPayload(plan) } });
});

exports.updatePlanStatus = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, { active: Boolean(req.body.active) }, { new: true });
  if (!plan) throw new AppError("Plan not found.", 404);
  res.json({ success: true, message: "Plan status updated.", data: { plan: planToPayload(plan) } });
});

exports.deletePlan = asyncHandler(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!plan) throw new AppError("Plan not found.", 404);
  res.json({ success: true, message: "Plan deleted." });
});

exports.getSettings = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      settings: [
        { key: "platform_name",  label: "Platform Name",          value: "LuxEstate",                                           type: "text"   },
        { key: "support_email",  label: "Support Email",           value: process.env.NODEMAILER_USER || "support@luxestate.pk", type: "email"  },
        { key: "max_images",     label: "Max Images per Listing",  value: "10",                                                  type: "number" },
        { key: "client_url",     label: "Client URL",              value: process.env.CLIENT_URL || "",                          type: "text"   },
        { key: "api_env",        label: "Environment",             value: process.env.NODE_ENV || "development",                 type: "text"   },
      ],
      flags: [
        { key: "featured_listings",   label: "Featured Listings",   description: "Allow agencies to promote listings",        enabled: true },
        { key: "agent_registration",  label: "Agent Self-Register", description: "Allow agents to register independently",    enabled: true },
        { key: "buyer_inquiries",     label: "Buyer Inquiries",     description: "Enable inquiry system for buyers",          enabled: true },
        { key: "visit_booking",       label: "Visit Booking",       description: "Allow buyers to book property visits",      enabled: true },
        { key: "email_notifications", label: "Email Notifications", description: "Send automated email notifications",        enabled: Boolean(process.env.NODEMAILER_USER) },
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
    ...tenants.map((t) => ({ id: `tenant-${t._id}`, action: `Tenant ${t.status}`, actor: "System", actorRole: "system", target: t.name, type: ["suspended","cancelled"].includes(t.status) ? "suspend" : "update", ip: "server", timestamp: relativeTimestamp(t) })),
    ...users.map((u) => ({ id: `user-${u._id}`, action: `${u.role.replace("_", " ")} ${u.status}`, actor: u.tenantId?.name || "Platform", actorRole: u.role, target: `${u.firstName} ${u.lastName}`, type: u.status === "active" ? "create" : "update", ip: "server", timestamp: relativeTimestamp(u) })),
    ...properties.map((p) => ({ id: `property-${p._id}`, action: `Property ${p.status}`, actor: p.tenantId?.name || "Platform", actorRole: "agency_admin", target: p.title, type: p.status === "rejected" ? "delete" : "update", ip: "server", timestamp: relativeTimestamp(p) })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);
  res.json({ success: true, data: { logs } });
});

exports.getFeaturedPropertiesForApproval = asyncHandler(async (req, res) => {
  const properties = await Property.find({ status: "submitted" })
    .populate("agentId", "firstName lastName email phone")
    .populate("tenantId", "name slug")
    .sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { properties } });
});

exports.approveFeaturedProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, { status: "approved", rejectionReason: undefined }, { new: true });
  if (!property) throw new AppError("Property not found.", 404);
  res.json({ success: true, message: "Property approved.", data: { property } });
});

exports.rejectFeaturedProperty = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason?.trim()) throw new AppError("Rejection reason is required.", 400);
  const property = await Property.findByIdAndUpdate(req.params.id, { status: "rejected", rejectionReason }, { new: true });
  if (!property) throw new AppError("Property not found.", 404);
  res.json({ success: true, message: "Property rejected.", data: { property } });
});
