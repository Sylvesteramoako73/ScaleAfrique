import nodemailer from 'nodemailer';
import { config } from '../../config';
import { logger } from '../../config/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
});

function baseTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1B5E20, #2E7D32); padding: 32px; text-align: center; }
    .header h1 { color: #F9A825; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #A5D6A7; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; color: #1a1a2e; line-height: 1.7; }
    .body h2 { color: #1B5E20; font-size: 22px; margin-top: 0; }
    .btn { display: inline-block; background: #1B5E20; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; font-size: 16px; }
    .footer { background: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #666; }
    .divider { border: none; border-top: 1px solid #e8e8e8; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ScaleAfrique</h1>
      <p>Marketing Platform for African Startups</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ScaleAfrique. All rights reserved.</p>
      <p>Growing African businesses, one campaign at a time.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({ from: config.smtp.from, to, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error('Email send failed', { to, subject, error });
    // Don't throw — email failures shouldn't break the main flow
  }
}

export const emailService = {
  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verifyUrl = `${config.app.frontendUrl}/auth/verify-email?token=${token}`;
    const html = baseTemplate(
      `<h2>Welcome to ScaleAfrique, ${name}!</h2>
      <p>You're one step away from joining thousands of African startups and SMEs growing with AI-powered marketing.</p>
      <p>Please verify your email address to activate your account:</p>
      <a href="${verifyUrl}" class="btn">Verify My Email</a>
      <hr class="divider">
      <p style="color:#666;font-size:14px;">If you didn't create an account, you can safely ignore this email.</p>
      <p style="color:#666;font-size:14px;">Link expires in 24 hours.</p>`,
      'Verify Your Email — ScaleAfrique',
    );
    await sendMail(email, 'Welcome to ScaleAfrique — Verify Your Email', html);
  },

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${config.app.frontendUrl}/auth/reset-password?token=${token}`;
    const html = baseTemplate(
      `<h2>Reset Your Password</h2>
      <p>Hi ${name}, we received a request to reset your ScaleAfrique password.</p>
      <p>Click the button below to choose a new password:</p>
      <a href="${resetUrl}" class="btn">Reset My Password</a>
      <hr class="divider">
      <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request a reset, please ignore this email — your account is safe.</p>`,
      'Reset Your Password — ScaleAfrique',
    );
    await sendMail(email, 'Reset Your Password — ScaleAfrique', html);
  },

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = baseTemplate(
      `<h2>You're all set, ${name}!</h2>
      <p>Welcome to the ScaleAfrique community — Africa's premier marketing platform for startups and SMEs.</p>
      <p>Here's what you can do right now:</p>
      <ul>
        <li>💬 <strong>Chat with your AI Advisor</strong> — Get personalised marketing strategies for your market</li>
        <li>📣 <strong>Create your first campaign</strong> — Email, social, ads, or multi-channel</li>
        <li>📊 <strong>Explore Analytics</strong> — Track performance across all channels</li>
        <li>🤝 <strong>Join the Community</strong> — Connect with 10,000+ African founders</li>
      </ul>
      <a href="${config.app.frontendUrl}/dashboard" class="btn">Go to Dashboard</a>`,
      'Welcome to ScaleAfrique!',
    );
    await sendMail(email, 'Welcome to ScaleAfrique! 🌍', html);
  },

  async sendCampaignReport(
    email: string,
    name: string,
    campaignName: string,
    metrics: { impressions: number; clicks: number; conversions: number; spend: number; revenue: number },
  ): Promise<void> {
    const roi = metrics.spend > 0 ? (((metrics.revenue - metrics.spend) / metrics.spend) * 100).toFixed(1) : '0';
    const html = baseTemplate(
      `<h2>Campaign Report: ${campaignName}</h2>
      <p>Hi ${name}, here's your campaign performance summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f4f4f5"><td style="padding:12px;font-weight:600;">Impressions</td><td style="padding:12px;">${metrics.impressions.toLocaleString()}</td></tr>
        <tr><td style="padding:12px;font-weight:600;">Clicks</td><td style="padding:12px;">${metrics.clicks.toLocaleString()}</td></tr>
        <tr style="background:#f4f4f5"><td style="padding:12px;font-weight:600;">Conversions</td><td style="padding:12px;">${metrics.conversions.toLocaleString()}</td></tr>
        <tr><td style="padding:12px;font-weight:600;">Spend</td><td style="padding:12px;">$${metrics.spend.toFixed(2)}</td></tr>
        <tr style="background:#f4f4f5"><td style="padding:12px;font-weight:600;">Revenue</td><td style="padding:12px;">$${metrics.revenue.toFixed(2)}</td></tr>
        <tr><td style="padding:12px;font-weight:600;color:#1B5E20;">ROI</td><td style="padding:12px;font-weight:700;color:#1B5E20;">${roi}%</td></tr>
      </table>
      <a href="${config.app.frontendUrl}/analytics" class="btn">View Full Analytics</a>`,
      `Campaign Report: ${campaignName}`,
    );
    await sendMail(email, `Campaign Report: ${campaignName} — ScaleAfrique`, html);
  },

  // Batch send to a list of recipients
  async sendBatch(
    recipients: Array<{ email: string; name: string }>,
    subject: string,
    htmlTemplate: string,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    for (const recipient of recipients) {
      try {
        const personalised = htmlTemplate.replace(/\{\{name\}\}/g, recipient.name);
        await sendMail(recipient.email, subject, personalised);
        sent++;
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  },
};
