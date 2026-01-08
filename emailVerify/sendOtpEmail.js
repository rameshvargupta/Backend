
import nodemailer from "nodemailer";
import "dotenv/config";

export const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"GT Shop" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `${purpose}`,
    html: `
      <h4>${purpose}</h4>
      <p>Your OTP is <b style="font-size:18px">${otp}</b></p>
      <p>Valid for 5 minutes</p>
    `
  });
};
