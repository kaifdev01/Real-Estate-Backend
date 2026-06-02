const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const protect = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");
const validate = require("../middleware/validate");
const { z } = require("zod");

router.use(protect, requireRole("super_admin"));

router.get("/overview", controller.getOverview);
router.get("/tenants", controller.getTenants);
router.get("/agents", controller.getAgents);
router.post("/tenants", controller.createTenant);
router.patch("/tenants/:id", controller.updateTenant);
router.patch("/agents/:id", controller.updateAgentSubscription);
router.delete("/tenants/:id", controller.deleteTenant);
router.get("/plans", controller.getPlans);
router.post("/plans", validate(z.object({ name: z.string().min(1) })), controller.createPlan);
router.patch("/plans/:id", controller.updatePlan);
router.delete("/plans/:id", controller.deletePlan);
router.get("/settings", controller.getSettings);
router.get("/audit-logs", controller.getAuditLogs);

// ─── Featured Properties Approval ───────────────────────────────────────────
router.get("/featured-properties", controller.getFeaturedPropertiesForApproval);
router.patch(
    "/featured-properties/:id/approve",
    controller.approveFeaturedProperty
);
router.patch(
    "/featured-properties/:id/reject",
    validate(z.object({ rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters") })),
    controller.rejectFeaturedProperty
);

module.exports = router;
