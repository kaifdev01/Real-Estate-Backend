require("dotenv").config();
const express    = require("express");
const helmet     = require("helmet");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose   = require("mongoose");

const authRoutes        = require("./src/routes/authRoutes");
const propertyRoutes    = require("./src/routes/propertyRoutes");
const agentRoutes       = require("./src/routes/agentRoutes");
const uploadRoutes      = require("./src/routes/uploadRoutes");
const inquiryRoutes     = require("./src/routes/inquiryRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const adminRoutes       = require("./src/routes/adminRoutes");
const subscriptionPlanRoutes = require("./src/routes/subscriptionPlanRoutes");
const paymentRoutes     = require("./src/routes/paymentRoutes");
const errorHandler      = require("./src/middleware/errorHandler");
const AppError     = require("./src/utils/AppError");
const { seedDefaultPlans } = require("./src/utils/subscriptionPlans");

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

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         authLimiter, authRoutes);
app.use("/api/properties",               propertyRoutes);
app.use("/api/agents",                   agentRoutes);
app.use("/api/upload",                   uploadRoutes);
app.use("/api/inquiries",                inquiryRoutes);
app.use("/api/appointments",             appointmentRoutes);
app.use("/api/subscription-plans",       subscriptionPlanRoutes);
app.use("/api/payments",                 paymentRoutes);
app.use("/api/admin",                    adminRoutes);

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
  .then(async () => {
    console.log("Connected to MongoDB");
    await seedDefaultPlans();
    console.log("Subscription plans synced");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
