import nodemailer from "nodemailer";
import Email from "../models/Email.js";

// Cấu hình email transporter
const createTransporter = () => {
  // Nếu có SMTP config trong env
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: sử dụng Gmail (cần enable "Less secure app access")
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
  });
};

/**
 * Gửi mã xác nhận reset password
 */
export const sendPasswordResetCode = async (email, code, token) => {
  const emailRecord = {
    to: email,
    from:
      process.env.EMAIL_FROM || "Social Network <noreply@socialnetwork.com>",
    subject: "Mã xác nhận đặt lại mật khẩu",
    type: "password_reset",
    metadata: { code, token },
  };

  try {
    // Demo mode: If no email config, just log the code
    if (
      !process.env.SMTP_HOST &&
      (!process.env.EMAIL_USER ||
        process.env.EMAIL_USER === "your-email@gmail.com")
    ) {
      const resetLink = `${
        process.env.CLIENT_URL || "http://localhost:5174"
      }/reset-password/${token}`;
      console.log("📧 [DEMO MODE] Password reset code for", email, ":", code);
      console.log("⚠️  Email service not configured. Using demo mode.");
      console.log("🔑 Use this code:", code);
      console.log("🔗 Reset link:", resetLink);

      // Log to database
      await Email.create({
        ...emailRecord,
        status: "demo",
        content: `Code: ${code}, Token: ${token}`,
        sentAt: new Date(),
      });

      return { success: true, messageId: "demo-mode", demo: true };
    }

    const transporter = createTransporter();
    const resetLink = `${
      process.env.CLIENT_URL || "http://localhost:5174"
    }/reset-password/${token}`;

    const mailOptions = {
      from: emailRecord.from,
      to: email,
      subject: emailRecord.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p>Xin chào,</p>
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Bạn có thể sử dụng mã xác nhận hoặc click vào link bên dưới:</p>
              
              <div class="code">${code}</div>
              
              <p style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Đặt lại mật khẩu</a>
              </p>
              
              <p style="font-size: 12px; color: #666;">Hoặc copy link này: <a href="${resetLink}">${resetLink}</a></p>
              
              <div class="warning">
                <strong>⚠️ Lưu ý:</strong>
                <ul>
                  <li>Mã này chỉ có hiệu lực trong <strong>15 phút</strong></li>
                  <li>Không chia sẻ mã này với bất kỳ ai</li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                </ul>
              </div>
              
              <p>Trân trọng,<br><strong>Social Network Team</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động. Vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Mã xác nhận đặt lại mật khẩu của bạn là: ${code}
        
        Hoặc truy cập link: ${resetLink}
        
        Mã này có hiệu lực trong 15 phút.
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);

    // Log to database
    await Email.create({
      ...emailRecord,
      status: "sent",
      messageId: info.messageId,
      content: `Code: ${code}, Link: ${resetLink}`,
      sentAt: new Date(),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);

    // Log failed email to database
    try {
      await Email.create({
        ...emailRecord,
        status: "failed",
        error: error.message,
      });
    } catch (dbError) {
      console.error("Failed to log email error:", dbError);
    }

    return { success: false, error: error.message };
  }
};

/**
 * Generate random 6-digit code
 */
export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
