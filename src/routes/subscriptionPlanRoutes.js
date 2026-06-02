const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { getPlanList } = require("../utils/subscriptionPlans");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const { scope } = req.query;
  const allowedScopes = ["agent", "agency"];

  if (scope && !allowedScopes.includes(scope)) {
    throw new AppError("Invalid plan scope.", 400);
  }

  const plans = (await getPlanList(scope)).filter((plan) => plan.active);

  res.json({
    success: true,
    data: { plans },
  });
}));

module.exports = router;
