import nodemailer from "nodemailer";
import "dotenv/config";

export const verifyEmail = async (token, email) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // ✅ FRONTEND URL
    const verifyUrl = `${process.env.CLIENT_URL}/verify/${token}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>

    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <title>GT_Shop Email Verification</title>
    </head>

    <body style="
      margin:0;
      padding:0;
      background:#020617;
      font-family:Arial,sans-serif;
    ">

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
      >
        <tr>
          <td
            align="center"
            style="padding:40px 15px;"
          >

            <!-- MAIN CARD -->
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                max-width:540px;
                background:#0f172a;
                border-radius:30px;
                overflow:hidden;
                border:1px solid rgba(255,255,255,0.08);
                box-shadow:0 20px 70px rgba(0,0,0,0.55);
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
                      width:78px;
                      height:78px;
                      margin:auto;
                      border-radius:24px;
                      background:linear-gradient(135deg,#ec4899,#6366f1);
                      text-align:center;
                      line-height:78px;
                      font-size:34px;
                      color:white;
                      font-weight:800;
                      box-shadow:0 10px 35px rgba(99,102,241,0.4);
                    ">
                      GT
                    </div>

                    <h1 style="
                      color:white;
                      margin-top:18px;
                      margin-bottom:5px;
                      font-size:34px;
                      font-weight:900;
                      letter-spacing:0.5px;
                    ">
                      GT_Shop
                    </h1>

                    <p style="
                      color:#94a3b8;
                      font-size:14px;
                      margin:0;
                    ">
                      Premium Shopping Experience
                    </p>

                  </div>

                  <!-- TITLE -->
                  <div style="
                    margin-top:38px;
                    text-align:center;
                  ">

                    <h2 style="
                      color:white;
                      font-size:30px;
                      margin-bottom:12px;
                    ">
                      Verify Your Email
                    </h2>

                    <p style="
                      color:#cbd5e1;
                      font-size:15px;
                      line-height:28px;
                      margin:0;
                    ">
                      Welcome to GT_Shop 🎉 <br/>
                      Please verify your email address to activate your account securely.
                    </p>

                  </div>

                  <!-- VERIFY BUTTON -->
                  <div style="
                    margin-top:40px;
                    text-align:center;
                  ">

                    <a
                      href="${verifyUrl}"
                      style="
                        display:inline-block;
                        padding:16px 34px;
                        background:linear-gradient(135deg,#ec4899,#6366f1);
                        color:white;
                        text-decoration:none;
                        border-radius:18px;
                        font-size:16px;
                        font-weight:700;
                        box-shadow:0 12px 30px rgba(99,102,241,0.35);
                      "
                    >
                      Verify Email Address
                    </a>

                  </div>

                  <!-- SECURITY INFO -->
                  <div style="
                    margin-top:35px;
                    background:rgba(255,255,255,0.04);
                    border:1px solid rgba(255,255,255,0.06);
                    border-radius:20px;
                    padding:20px;
                  ">

                    <table width="100%">
                      <tr>

                        <td width="42" valign="top">

                          <div style="
                            width:38px;
                            height:38px;
                            border-radius:12px;
                            background:#22c55e;
                            text-align:center;
                            line-height:38px;
                            color:white;
                            font-size:18px;
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
                            font-weight:700;
                          ">
                            Secure Verification
                          </p>

                          <p style="
                            color:#94a3b8;
                            margin-top:7px;
                            margin-bottom:0;
                            font-size:13px;
                            line-height:24px;
                          ">
                            This verification link is protected and helps keep your GT_Shop account secure.
                          </p>

                        </td>

                      </tr>
                    </table>

                  </div>

                  <!-- EXTRA NOTE -->
                  <div style="
                    margin-top:30px;
                    text-align:center;
                  ">

                    <p style="
                      color:#64748b;
                      font-size:13px;
                      line-height:24px;
                      margin:0;
                    ">
                      If you did not create this account,
                      you can safely ignore this email.
                    </p>

                  </div>

                  <!-- FOOTER -->
                  <div style="
                    margin-top:35px;
                    border-top:1px solid rgba(255,255,255,0.08);
                    padding-top:25px;
                    text-align:center;
                  ">

                    <p style="
                      color:#94a3b8;
                      font-size:13px;
                      line-height:24px;
                      margin:0;
                    ">
                      This secure email was sent by
                      <span style="
                        color:white;
                        font-weight:700;
                      ">
                        GT_Shop
                      </span>
                    </p>

                    <p style="
                      color:#475569;
                      font-size:12px;
                      margin-top:12px;
                    ">
                      © ${new Date().getFullYear()} GT_Shop.
                      All rights reserved.
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
      subject: "GT_Shop • Email Verification",
      html: htmlTemplate,
    });

    console.log("Verification email sent");

  } catch (error) {
    console.error(
      "Email send failed:",
      error.message
    );
  }
};