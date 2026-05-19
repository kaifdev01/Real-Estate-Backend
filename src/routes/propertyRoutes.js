const express     = require("express");
const router      = express.Router();
const controller  = require("../controllers/propertyController");
const protect     = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");
const tenantGuard = require("../middleware/tenantGuard");
const validate    = require("../middleware/validate");
const {
  createPropertySchema,
  updatePropertySchema,
  approvePropertySchema,
} = require("../validators/propertyValidators");

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/", controller.getProperties);

// ─── Agent — own listings (static, must be before /:slug) ────────────────────
router.get(
  "/agent/my",
  protect, requireRole("agent", "agency_admin"),
  controller.getMyProperties
);

// ─── Agency Admin — all tenant listings (static, must be before /:slug) ───────
router.get(
  "/agency/all",
  protect, requireRole("agency_admin"), tenantGuard,
  controller.getTenantProperties
);

// ─── Super Admin — platform-wide (static, must be before /:slug) ─────────────
router.get(
  "/admin/all",
  protect, requireRole("super_admin"),
  controller.getAllProperties
);

// ─── Public single property (dynamic — must be last GET) ─────────────────────
router.get("/:slug", controller.getPropertyBySlug);

// ─── Agent — create / update / delete / submit ────────────────────────────────
router.post(
  "/",
  protect, requireRole("agent", "agency_admin"),
  validate(createPropertySchema),
  controller.createProperty
);

router.put(
  "/:id",
  protect, requireRole("agent", "agency_admin"),
  validate(updatePropertySchema),
  controller.updateProperty
);

router.delete(
  "/:id",
  protect, requireRole("agent", "agency_admin"),
  controller.deleteProperty
);

router.patch(
  "/:id/submit",
  protect, requireRole("agent", "agency_admin"),
  controller.submitProperty
);

// ─── Agency Admin — approve / reject ─────────────────────────────────────────
router.patch(
  "/:id/review",
  protect, requireRole("agency_admin"), tenantGuard,
  validate(approvePropertySchema),
  controller.reviewProperty
);

module.exports = router;
