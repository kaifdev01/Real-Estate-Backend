const AppError = require("../utils/AppError");

/**
 * validate(schema) — Zod schema middleware factory.
 * Validates req.body against the provided Zod schema.
 * On failure, returns a 400 with all field-level error messages.
 */
const validate = (schema) => (req, res, next) => {
  console.log("[DEBUG] Validating request body:", JSON.stringify(req.body, null, 2));
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = (result.error.issues || result.error.errors || [])
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    console.log("[DEBUG] Validation error:", messages);
    return next(new AppError(messages || "Validation failed.", 400));
  }
  console.log("[DEBUG] Validation passed, parsed data:", JSON.stringify(result.data, null, 2));
  req.body = result.data;
  next();
};

module.exports = validate;
