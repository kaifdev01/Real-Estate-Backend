const express     = require("express");
const router      = express.Router();
const controller  = require("../controllers/agentController");
const protect     = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");

// Public
router.get("/",    controller.getAgents);
router.get("/:id", controller.getAgentById);

// Agent updates own profile
router.patch("/profile", protect, requireRole("agent", "agency_admin"), controller.updateAgentProfile);

module.exports = router;
