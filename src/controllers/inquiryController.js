const Inquiry    = require("../models/Inquiry");
const Property   = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const AppError   = require("../utils/AppError");

// POST /api/inquiries — buyer sends inquiry
exports.createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, message } = req.body;
  if (!propertyId || !message) throw new AppError("propertyId and message are required.", 400);

  const property = await Property.findOne({ _id: propertyId, status: "approved" });
  if (!property) throw new AppError("Property not found.", 404);

  const inquiry = await Inquiry.create({
    propertyId,
    tenantId: property.tenantId,
    agentId:  property.agentId,
    buyerId:  req.userId,
    message,
  });

  // Increment property inquiry count
  Property.findByIdAndUpdate(propertyId, { $inc: { inquiries: 1 } }).exec();

  res.status(201).json({ success: true, data: { inquiry } });
});

// GET /api/inquiries/agent — agent sees all inquiries for their listings
exports.getAgentInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { agentId: req.userId };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Inquiry.countDocuments(filter);

  const inquiries = await Inquiry.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("buyerId",    "firstName lastName email phone")
    .populate("propertyId", "title slug images city")
    .lean();

  res.json({
    success: true,
    data: { inquiries },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// GET /api/inquiries/buyer — buyer sees their own inquiries
exports.getBuyerInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Inquiry.countDocuments({ buyerId: req.userId });

  const inquiries = await Inquiry.find({ buyerId: req.userId })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("agentId",    "firstName lastName email phone")
    .populate("propertyId", "title slug images city")
    .lean();

  res.json({
    success: true,
    data: { inquiries },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// POST /api/inquiries/:id/reply — agent or buyer adds a reply
exports.replyToInquiry = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw new AppError("message is required.", 400);

  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) throw new AppError("Inquiry not found.", 404);

  // Only the agent or the buyer involved can reply
  const isAgent = inquiry.agentId.toString() === req.userId;
  const isBuyer = inquiry.buyerId.toString() === req.userId;
  if (!isAgent && !isBuyer) throw new AppError("Not authorized.", 403);

  inquiry.replies.push({ senderId: req.userId, senderRole: req.user.role, message });
  inquiry.status = "replied";
  await inquiry.save();

  res.json({ success: true, data: { inquiry } });
});

// PATCH /api/inquiries/:id/close — agent closes inquiry
exports.closeInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, agentId: req.userId });
  if (!inquiry) throw new AppError("Inquiry not found.", 404);

  inquiry.status = "closed";
  await inquiry.save();

  res.json({ success: true, message: "Inquiry closed." });
});
