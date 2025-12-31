import nodemailer from "nodemailer";
import "dotenv/config";

export const sendResetOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <h3>Password Reset OTP</h3>
      <p>Your OTP is <b>${otp}</b></p>
      <p>Valid for 5 minutes</p>
    `
  });
};
