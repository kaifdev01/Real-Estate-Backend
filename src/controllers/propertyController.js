const Property   = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const AppError   = require("../utils/AppError");
const { propertyQuerySchema } = require("../validators/propertyValidators");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildSortQuery = (sort) => {
  switch (sort) {
    case "price_asc":  return { price: 1 };
    case "price_desc": return { price: -1 };
    case "oldest":     return { createdAt: 1 };
    default:           return { createdAt: -1 };
  }
};

// ─── GET /api/properties — Public listing with filters + pagination ────────────

exports.getProperties = asyncHandler(async (req, res) => {
  const parsed = propertyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const msg = (parsed.error.issues || parsed.error.errors || []).map((e) => e.message).join(", ");
    throw new AppError(msg || "Invalid query parameters.", 400);
  }

  const {
    page, limit, city, category, listingType,
    minPrice, maxPrice, beds, minSize, maxSize,
    sort, featured,
  } = parsed.data;

  const filter = { status: "approved" };

  if (city)        filter.city        = { $regex: city, $options: "i" };
  if (category)    filter.category    = category;
  if (listingType) filter.listingType = listingType;
  if (beds !== undefined) filter.beds = beds;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (minSize !== undefined || maxSize !== undefined) {
    filter.size = {};
    if (minSize !== undefined) filter.size.$gte = minSize;
    if (maxSize !== undefined) filter.size.$lte = maxSize;
  }
  if (featured) filter.featuredUntil = { $gt: new Date() };

  const skip  = (page - 1) * limit;
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort(buildSortQuery(sort))
    .skip(skip)
    .limit(limit)
    .populate("agentId", "firstName lastName email phone")
    .populate("tenantId", "name slug logo")
    .lean();

  res.json({
    success: true,
    data: { properties },
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ─── GET /api/properties/:slug — Public single property ───────────────────────

exports.getPropertyBySlug = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ slug: req.params.slug, status: "approved" })
    .populate("agentId", "firstName lastName email phone")
    .populate("tenantId", "name slug logo")
    .lean();

  if (!property) throw new AppError("Property not found.", 404);

  // Increment view count (fire and forget)
  Property.findByIdAndUpdate(property._id, { $inc: { views: 1 } }).exec();

  res.json({ success: true, data: { property } });
});

// ─── POST /api/properties — Agent creates a draft ─────────────────────────────

exports.createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({
    ...req.body,
    agentId:  req.userId,
    tenantId: req.user.tenantId || req.tenantId || null,
    status:   "draft",
  });

  res.status(201).json({
    success: true,
    message: "Property created as draft.",
    data: { property },
  });
});

// ─── PUT /api/properties/:id — Agent updates own draft/rejected property ──────

exports.updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, agentId: req.userId });
  if (!property) throw new AppError("Property not found.", 404);

  if (!["draft", "rejected"].includes(property.status)) {
    throw new AppError("Only draft or rejected properties can be edited.", 400);
  }

  Object.assign(property, req.body);
  await property.save();

  res.json({ success: true, message: "Property updated.", data: { property } });
});

// ─── DELETE /api/properties/:id — Agent deletes own draft ─────────────────────

exports.deleteProperty = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };

  if (req.user.role === "agency_admin") {
    filter.tenantId = req.user.tenantId;
  } else {
    filter.agentId = req.userId;
  }

  // Only non-live properties can be deleted
  filter.status = { $in: ["draft", "rejected", "archived"] };

  const property = await Property.findOneAndDelete(filter);
  if (!property) throw new AppError("Property not found or cannot be deleted.", 404);

  res.json({ success: true, message: "Property deleted." });
});

// ─── PATCH /api/properties/:id/submit — Agent submits draft for review ────────

exports.submitProperty = asyncHandler(async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, agentId: req.userId });
  if (!property) throw new AppError("Property not found.", 404);

  if (!["draft", "rejected"].includes(property.status)) {
    throw new AppError("Only draft or rejected properties can be submitted.", 400);
  }

  if (!property.images || property.images.length === 0) {
    throw new AppError("At least one image is required before submitting.", 400);
  }

  property.status          = "submitted";
  property.rejectionReason = undefined;
  await property.save();

  res.json({ success: true, message: "Property submitted for review.", data: { property } });
});

// ─── PATCH /api/properties/:id/review — Agency admin approves or rejects ──────

exports.reviewProperty = asyncHandler(async (req, res) => {
  const { action, rejectionReason } = req.body;

  const property = await Property.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!property) throw new AppError("Property not found.", 404);

  if (property.status !== "submitted") {
    throw new AppError("Only submitted properties can be reviewed.", 400);
  }

  if (action === "approve") {
    property.status = "approved";
    property.rejectionReason = undefined;
  } else {
    property.status          = "rejected";
    property.rejectionReason = rejectionReason;
  }

  await property.save();

  res.json({
    success: true,
    message: `Property ${action === "approve" ? "approved" : "rejected"}.`,
    data: { property },
  });
});

// ─── GET /api/properties/agent/my — Agent's own listings ──────────────────────

exports.getMyProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { agentId: req.userId };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    data: { properties },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// ─── GET /api/properties/agency/all — Agency admin sees all tenant listings ───

exports.getTenantProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { tenantId: req.tenantId };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("agentId", "firstName lastName email")
    .lean();

  res.json({
    success: true,
    data: { properties },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// ─── GET /api/properties/admin/all — Super admin sees all properties ───────────

exports.getAllProperties = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, tenantId } = req.query;
  const filter = {};
  if (status)   filter.status   = status;
  if (tenantId) filter.tenantId = tenantId;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Property.countDocuments(filter);

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("agentId", "firstName lastName email")
    .populate("tenantId", "name slug")
    .lean();

  res.json({
    success: true,
    data: { properties },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});
