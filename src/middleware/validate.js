const AppError = require("../utils/AppError");

/**
 * validate(schema) — Zod schema middleware factory.
 * Validates req.body against the provided Zod schema.
 * On failure, returns a 400 with all field-level error messages.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return next(new AppError(messages, 400));
  }
  req.body = result.data; // replace with parsed + coerced data
  next();
};

module.exports = validate;
