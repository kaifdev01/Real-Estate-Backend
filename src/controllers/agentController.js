const User       = require("../models/User");
const Property   = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const AppError   = require("../utils/AppError");

// ─── GET /api/agents — Public list of all agents ─────────────────────────────

exports.getAgents = asyncHandler(async (req, res) => {
  const { city, specialty, search, page = 1, limit = 20 } = req.query;

  const filter = { role: "agent", status: "active", isVerified: true };

  if (city)    filter.city = { $regex: city, $options: "i" };
  if (specialty) filter.specialties = { $in: [new RegExp(specialty, "i")] };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { city:      { $regex: search, $options: "i" } },
      { specialties: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);

  const agents = await User.find(filter)
    .select("firstName lastName email phone city bio specialties languages experience responseTime avatar role createdAt")
    .sort({ experience: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Attach property counts
  const agentIds = agents.map((a) => a._id);
  const counts = await Property.aggregate([
    { $match: { agentId: { $in: agentIds } } },
    { $group: { _id: "$agentId", total: { $sum: 1 }, approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));

  const result = agents.map((a) => {
    const c = countMap[a._id.toString()] || { total: 0, approved: 0 };
    return { ...a, totalListings: c.total, activeListings: c.approved };
  });

  res.json({
    success: true,
    data: { agents: result },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// ─── GET /api/agents/:id — Public agent profile ───────────────────────────────

exports.getAgentById = asyncHandler(async (req, res) => {
  const agent = await User.findOne({
    _id: req.params.id,
    role: "agent",
    status: "active",
    isVerified: true,
  })
    .select("firstName lastName email phone city bio specialties languages experience responseTime avatar role createdAt")
    .lean();

  if (!agent) throw new AppError("Agent not found.", 404);

  // Approved listings
  const listings = await Property.find({ agentId: agent._id, status: "approved" })
    .select("title city area price listingType category images slug beds baths size views")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  // Stats
  const [totalDeals, activeListings] = await Promise.all([
    Property.countDocuments({ agentId: agent._id, status: { $in: ["approved", "archived"] } }),
    Property.countDocuments({ agentId: agent._id, status: "approved" }),
  ]);

  res.json({
    success: true,
    data: {
      agent: {
        ...agent,
        totalDeals,
        activeListings,
      },
      listings,
    },
  });
});

// ─── PATCH /api/agents/profile — Agent updates own profile ───────────────────

exports.updateAgentProfile = asyncHandler(async (req, res) => {
  const allowed = ["bio", "city", "specialties", "languages", "experience", "responseTime", "avatar", "phone"];
  const updates = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found.", 404);

  res.json({ success: true, message: "Profile updated.", data: { user: user.toPublicJSON() } });
});
