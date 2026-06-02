const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const protect = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");

router.use(protect, requireRole("super_admin"));

router.get("/overview", controller.getOverview);
router.get("/tenants", controller.getTenants);
router.get("/users", controller.getUsers);
router.get("/agents", controller.getAgents);
router.patch("/agents/:id", controller.updateAgentSubscription);
router.post("/tenants", controller.createTenant);
router.patch("/tenants/:id", controller.updateTenant);
router.delete("/tenants/:id", controller.deleteTenant);
router.get("/plans", controller.getPlans);
router.post("/plans", controller.createPlan);
router.patch("/plans/:id", controller.updatePlan);
router.patch("/plans/:id/status", controller.updatePlanStatus);
router.delete("/plans/:id", controller.deletePlan);
router.get("/settings", controller.getSettings);
router.get("/audit-logs", controller.getAuditLogs);

module.exports = router;
