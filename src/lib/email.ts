import nodemailer from 'nodemailer';

// Create a reusable transporter using the Gmail SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email using the configured Gmail SMTP transporter.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const fromName = process.env.SMTP_FROM_NAME || 'LifeSaver';
  const fromEmail = process.env.SMTP_USER;

  if (!fromEmail || !process.env.SMTP_PASS) {
    console.warn('[Email Service] SMTP credentials not fully configured in environment variables.');
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);
    throw error;
  }
}
