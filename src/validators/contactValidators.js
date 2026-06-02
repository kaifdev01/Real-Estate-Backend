const { z } = require("zod");

const sendContactFormSchema = z.object({
    name: z.string().min(1, "Full name is required").trim(),
    email: z.email("Invalid email address").toLowerCase(),
    phone: z.string().optional(),
    subject: z.enum(["buy", "sell", "rent", "invest", "other"], {
        errorMap: () => ({ message: "Invalid subject. Choose from: buy, sell, rent, invest, other" }),
    }),
    message: z.string().min(10, "Message must be at least 10 characters").trim(),
});

module.exports = {
    sendContactFormSchema,
};
