const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendContactFormEmail } = require("../services/emailService");

// ─── POST /api/contact — Public contact form submission ──────────────────────

exports.sendContactForm = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        throw new AppError("Missing required fields.", 400);
    }

    // Find all super admins to send email to
    const superAdmins = await User.find({ role: "super_admin" }).select("email firstName lastName");

    if (superAdmins.length === 0) {
        throw new AppError("Unable to process request. Please try again later.", 500);
    }

    // Send email to all super admins
    const emailPromises = superAdmins.map((admin) =>
        sendContactFormEmail(admin.email, {
            senderName: name,
            senderEmail: email,
            senderPhone: phone || "Not provided",
            subject,
            message,
            adminName: `${admin.firstName} ${admin.lastName}`,
        })
    );

    await Promise.all(emailPromises);

    res.status(201).json({
        success: true,
        message: "Your message has been sent. Our team will contact you soon.",
        data: { email },
    });
});
