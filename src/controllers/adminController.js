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

exports.getPlans = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { plans: getPlanList() } });
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
