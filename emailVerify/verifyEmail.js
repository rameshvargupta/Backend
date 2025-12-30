import nodemailer from "nodemailer";
import "dotenv/config";

export const verifyEmail = async (token, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Ecart" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification",
      html: `
        <h3>Email Verification From Rameshvar Gupta Ecart Website</h3>
        <p>Click below to verify:</p>
        <a href="http://localhost:5173/verify/${token}">
          Verify Email
        </a>
      `
    });

    console.log("Verification email sent");

  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};
