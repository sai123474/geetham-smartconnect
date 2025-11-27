import nodemailer from "nodemailer";

// EMAIL SENDER (production-ready if SMTP is set)
export const sendEmail = async (to, subject, html) => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.log("📧 Email not configured. Skipping send.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html
  });
};

// WHATSAPP STUB (to be replaced later with WhatsApp Business API)
export const sendWhatsApp = async (phone, message, scheduleAt = null) => {
  // Later: integrate WhatsApp Business Cloud API here
  console.log(
    `📲 [WA-STUB] To: ${phone}, Message: ${message}, Schedule: ${scheduleAt}`
  );
  // For now just log; no real send
};
