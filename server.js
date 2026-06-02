require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/authRoutes");
const propertyRoutes = require("./src/routes/propertyRoutes");
const agentRoutes = require("./src/routes/agentRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const inquiryRoutes = require("./src/routes/inquiryRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const AppError = require("./src/utils/AppError");

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,          // required for HttpOnly cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Device-Id"],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again later." },
});

app.use(globalLimiter);

// ─── Payments webhook (needs raw body) ───────────────────────────────────────
try {
  const paymentController = require("./src/controllers/paymentController");
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentController.webhookHandler);
} catch (e) {
  console.warn("Payment webhook not mounted:", e.message);
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
const paymentRoutes = require("./src/routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "Server is running.", env: process.env.NODE_ENV })
);

// 404 handler
app.all("*", (req, res, next) =>
  next(new AppError(`Route ${req.originalUrl} not found.`, 404))
);

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database + Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    try {
      // Seed default subscription plans if not present
      const { seedDefaultPlans } = require("./src/services/subscriptionService");
      seedDefaultPlans().catch((e) => console.warn("Plan seed warning:", e.message));
    } catch (e) {
      console.warn("Could not run plan seeder:", e.message);
    }
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
