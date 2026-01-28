import nodemailer from "nodemailer";

export const sendInvoiceEmail = async (userEmail, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "GT Shop <support@gtshop.com>",
    to: userEmail,
    subject: "Your GT Shop Invoice",
    text: "Thank you for shopping with GT Shop!",
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBuffer,
      },
    ],
  });
};
