import nodemailer from "nodemailer";

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
export const sendPasswordResetCode = async (email, code) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from:
        process.env.EMAIL_FROM || "Social Network <noreply@socialnetwork.com>",
      to: email,
      subject: "Mã xác nhận đặt lại mật khẩu",
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
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Sử dụng mã xác nhận bên dưới:</p>
              
              <div class="code">${code}</div>
              
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
        
        Mã này có hiệu lực trong 15 phút.
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate random 6-digit code
 */
export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
