const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { name, email, phone, type, details } = req.body || {};
  if (!name || !email || !phone || !type || !details) {
    return res.status(400).json({ error: 'Please complete all required fields.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const safe = (value) => String(value || '').replace(/[<>]/g, '');
  const subject = `New Consultation Request – ${safe(type)}`;
  const body = [
    `Customer: ${safe(name)}`,
    `Email: ${safe(email)}`,
    `Phone: ${safe(phone)}`,
    `Project Type: ${safe(type)}`,
    '',
    'Project Details:',
    safe(details),
  ].join('\n');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'buwaneka.engineering@gmail.com',
      replyTo: safe(email),
      subject,
      text: body,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact email failed:', error);
    return res.status(500).json({ error: 'Email could not be sent.' });
  }
};
