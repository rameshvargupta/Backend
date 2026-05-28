import nodemailer from "nodemailer";
import "dotenv/config";

export const sendOtpEmail = async (
  email,
  otp,
  purpose = "Verification"
) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>GT_Shop OTP</title>
  </head>

  <body style="
    margin:0;
    padding:0;
    background:#0f172a;
    font-family:Arial,sans-serif;
  ">

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:40px 15px;">

          <!-- MAIN CARD -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="
              max-width:520px;
              background:#111827;
              border-radius:28px;
              overflow:hidden;
              border:1px solid rgba(255,255,255,0.08);
              box-shadow:0 20px 60px rgba(0,0,0,0.5);
            "
          >

            <!-- TOP GRADIENT -->
            <tr>
              <td style="
                height:6px;
                background:linear-gradient(90deg,#ec4899,#8b5cf6,#6366f1);
              ">
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding:45px 35px;">

                <!-- LOGO -->
                <div style="text-align:center;">

                  <div style="
                    width:72px;
                    height:72px;
                    margin:auto;
                    border-radius:22px;
                    background:linear-gradient(135deg,#ec4899,#6366f1);
                    text-align:center;
                    line-height:72px;
                    font-size:32px;
                    color:white;
                    font-weight:bold;
                    box-shadow:0 10px 30px rgba(236,72,153,0.4);
                  ">
                    GT
                  </div>

                  <h1 style="
                    color:white;
                    margin-top:18px;
                    margin-bottom:5px;
                    font-size:32px;
                    font-weight:800;
                    letter-spacing:0.5px;
                  ">
                    GT_Shop
                  </h1>

                  <p style="
                    color:#9ca3af;
                    font-size:14px;
                    margin:0;
                  ">
                    Premium Shopping Experience
                  </p>

                </div>

                <!-- TITLE -->
                <div style="margin-top:35px;text-align:center;">

                  <h2 style="
                    color:white;
                    font-size:28px;
                    margin-bottom:10px;
                  ">
                    ${purpose}
                  </h2>

                  <p style="
                    color:#cbd5e1;
                    font-size:15px;
                    line-height:26px;
                    margin:0;
                  ">
                    Use the verification code below to continue securely with your GT_Shop account.
                  </p>

                </div>

                <!-- OTP BOX -->
                <div style="
                  margin-top:35px;
                  text-align:center;
                ">

                  <div style="
                    display:inline-block;
                    padding:18px 35px;
                    border-radius:20px;
                    background:linear-gradient(135deg,#ec4899,#6366f1);
                    color:white;
                    font-size:38px;
                    font-weight:800;
                    letter-spacing:12px;
                    box-shadow:0 10px 35px rgba(99,102,241,0.35);
                  ">
                    ${otp}
                  </div>

                </div>

                <!-- VALID -->
                <div style="
                  margin-top:28px;
                  background:rgba(255,255,255,0.04);
                  border:1px solid rgba(255,255,255,0.06);
                  border-radius:18px;
                  padding:18px;
                ">

                  <table width="100%">
                    <tr>

                      <td width="40" valign="top">
                        <div style="
                          width:36px;
                          height:36px;
                          border-radius:12px;
                          background:#22c55e;
                          text-align:center;
                          line-height:36px;
                          color:white;
                          font-weight:bold;
                        ">
                          ✓
                        </div>
                      </td>

                      <td style="padding-left:10px;">

                        <p style="
                          color:white;
                          margin:0;
                          font-size:15px;
                          font-weight:600;
                        ">
                          OTP Valid for 5 Minutes
                        </p>

                        <p style="
                          color:#94a3b8;
                          margin-top:6px;
                          margin-bottom:0;
                          font-size:13px;
                          line-height:22px;
                        ">
                          Never share this code with anyone. GT_Shop will never ask for your OTP.
                        </p>

                      </td>

                    </tr>
                  </table>

                </div>

                <!-- FOOTER -->
                <div style="
                  margin-top:35px;
                  text-align:center;
                  border-top:1px solid rgba(255,255,255,0.08);
                  padding-top:25px;
                ">

                  <p style="
                    color:#64748b;
                    font-size:13px;
                    line-height:24px;
                    margin:0;
                  ">
                    This email was sent securely by
                    <span style="color:white;font-weight:700;">
                      GT_Shop
                    </span>
                  </p>

                  <p style="
                    color:#475569;
                    font-size:12px;
                    margin-top:12px;
                  ">
                    © ${new Date().getFullYear()} GT_Shop. All rights reserved.
                  </p>

                </div>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"GT_Shop" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `GT_Shop • ${purpose}`,
    html: htmlTemplate,
  });
};