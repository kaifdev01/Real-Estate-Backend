const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"LuxEstate" <${process.env.NODEMAILER_USER}>`,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = (email, code) =>
  sendMail({
    to: email,
    subject: "Verify your LuxEstate account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#1A3C5E">Verify Your Email</h2>
        <p>Use the code below to verify your account. It expires in <strong>15 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#C9A84C;text-align:center;padding:24px 0">${code}</div>
        <p style="color:#888;font-size:12px">If you didn't create an account, ignore this email.</p>
      </div>`,
  });

const sendWelcomeEmail = (email, name) =>
  sendMail({
    to: email,
    subject: "Welcome to LuxEstate",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#1A3C5E">Welcome, ${name}!</h2>
        <p>Your account has been verified. Start exploring premium properties today.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C9A84C;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Browse Properties</a>
      </div>`,
  });

const sendPasswordResetEmail = (email, otp) =>
  sendMail({
    to: email,
    subject: "Reset your LuxEstate password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#1A3C5E">Password Reset</h2>
        <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#C9A84C;text-align:center;padding:24px 0">${otp}</div>
        <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>`,
  });

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
