const Appointment  = require("../models/Appointment");
const Property     = require("../models/Property");
const Availability = require("../models/Availability");
const asyncHandler = require("../utils/asyncHandler");
const AppError     = require("../utils/AppError");

// POST /api/appointments — buyer books appointment
exports.createAppointment = asyncHandler(async (req, res) => {
  const { propertyId, date, timeSlot, message } = req.body;
  if (!propertyId || !date || !timeSlot) {
    throw new AppError("propertyId, date and timeSlot are required.", 400);
  }

  const property = await Property.findOne({ _id: propertyId, status: "approved" });
  if (!property) throw new AppError("Property not found.", 404);

  const appointment = await Appointment.create({
    propertyId,
    tenantId: property.tenantId,
    agentId:  property.agentId,
    buyerId:  req.userId,
    date:     new Date(date),
    timeSlot,
    message,
  });

  res.status(201).json({ success: true, data: { appointment } });
});

// GET /api/appointments/agent — agent sees all their appointments
exports.getAgentAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { agentId: req.userId };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .sort({ date: 1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("buyerId",    "firstName lastName email phone")
    .populate("propertyId", "title slug images city area")
    .lean();

  res.json({
    success: true,
    data: { appointments },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// GET /api/appointments/buyer — buyer sees their appointments
exports.getBuyerAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { buyerId: req.userId };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .sort({ date: 1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("agentId",    "firstName lastName email phone")
    .populate("propertyId", "title slug images city area")
    .lean();

  res.json({
    success: true,
    data: { appointments },
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// PATCH /api/appointments/:id/status — agent approves / rejects / completes
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["approved", "rejected", "completed", "cancelled"];
  if (!allowed.includes(status)) throw new AppError("Invalid status.", 400);

  const appointment = await Appointment.findOne({ _id: req.params.id, agentId: req.userId });
  if (!appointment) throw new AppError("Appointment not found.", 404);

  appointment.status = status;
  await appointment.save();

  res.json({ success: true, data: { appointment } });
});

// PATCH /api/appointments/:id/reschedule — agent reschedules
exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, timeSlot, note } = req.body;
  if (!date || !timeSlot) throw new AppError("date and timeSlot are required.", 400);

  const appointment = await Appointment.findOne({ _id: req.params.id, agentId: req.userId });
  if (!appointment) throw new AppError("Appointment not found.", 404);

  appointment.status               = "rescheduled";
  appointment.rescheduledDate      = new Date(date);
  appointment.rescheduledTimeSlot  = timeSlot;
  appointment.rescheduleNote       = note;
  await appointment.save();

  res.json({ success: true, data: { appointment } });
});

// GET /api/appointments/availability/:agentId — public: get agent availability
exports.getAgentAvailability = asyncHandler(async (req, res) => {
  const slots = await Availability.find({
    agentId:  req.params.agentId,
    isActive: true,
  }).lean();

  res.json({ success: true, data: { slots } });
});

// PUT /api/appointments/availability — agent sets their availability
exports.setAvailability = asyncHandler(async (req, res) => {
  const { schedule } = req.body; // [{ dayOfWeek, slots, isActive }]
  if (!Array.isArray(schedule)) throw new AppError("schedule must be an array.", 400);

  const ops = schedule.map((s) => ({
    updateOne: {
      filter: { agentId: req.userId, dayOfWeek: s.dayOfWeek },
      update: { $set: { slots: s.slots, isActive: s.isActive, tenantId: req.user.tenantId || null } },
      upsert: true,
    },
  }));

  await Availability.bulkWrite(ops);
  const updated = await Availability.find({ agentId: req.userId }).lean();

  res.json({ success: true, data: { schedule: updated } });
});
