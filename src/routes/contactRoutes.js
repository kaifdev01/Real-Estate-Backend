const express = require("express");
const router = express.Router();
const controller = require("../controllers/contactController");
const validate = require("../middleware/validate");
const { sendContactFormSchema } = require("../validators/contactValidators");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post(
    "/",
    validate(sendContactFormSchema),
    controller.sendContactForm
);

module.exports = router;
