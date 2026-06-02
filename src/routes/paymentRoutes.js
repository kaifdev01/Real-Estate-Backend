const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const protect = require("../middleware/protect");

router.get("/plans", paymentController.getPlans);
router.post("/checkout", paymentController.createCheckout);
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhookHandler);
router.get("/history", protect, paymentController.getHistory);

module.exports = router;
