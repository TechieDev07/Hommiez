import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transport using SMTP credentials if provided in .env,
 * or fallback to ethereal / mock logger in development if no SMTP host is configured.
 */
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback: Logs OTP clearly to the terminal
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n========================================');
        console.log('📧 [DEV EMAIL SIMULATOR]');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
        console.log('========================================\n');
        return { messageId: 'dev-simulated-' + Date.now() };
      },
    };
  }

  return transporter;
};

/**
 * Send 6-digit OTP email for password reset
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const mailer = await getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Hommiez Support" <support@hommiez.com>',
    to: toEmail,
    subject: 'Hommiez Password Reset Verification Code',
    text: `Your password recovery code is: ${otp}\n\nThis OTP is valid for 5 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0F766E; margin: 0; font-size: 24px; font-weight: 800;">Hommiez</h2>
          <p style="color: #64748B; margin: 4px 0 0; font-size: 14px;">Student Housing & Campus Living</p>
        </div>
        <div style="padding: 20px 0; border-top: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9;">
          <p style="color: #0F172A; font-size: 15px; margin-bottom: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            We received a request to reset your Hommiez account password. Use the verification code below to proceed:
          </p>
          <div style="background-color: #F0FDFA; border: 2px dashed #0F766E; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F766E;">${otp}</span>
          </div>
          <p style="color: #64748B; font-size: 13px; line-height: 1.4; margin: 0;">
            ⏳ This code is valid for <strong>5 minutes</strong>. For your security, never share this code with anyone.
          </p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
};
