const axios = require('axios');
const nodemailer = require('nodemailer');

function getProvider() {
  return String(process.env.EMAIL_PROVIDER || 'smtp').trim().toLowerCase();
}

function isConfigured(cfg) {
  if (getProvider() === 'resend') {
    return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
  }
  if (getProvider() === 'brevo') {
    return Boolean(process.env.BREVO_API_KEY && cfg.email_from);
  }
  return Boolean(cfg.email_from && cfg.email_pass);
}

function makeSmtpTransporter(cfg) {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: cfg.email_from,
      pass: cfg.email_pass,
    },
    tls: {
      servername: 'smtp.gmail.com',
    },
  });
}

async function sendMail(cfg, message) {
  const provider = getProvider();
  console.log('mailer: provider=', provider, 'BREVO=', Boolean(process.env.BREVO_API_KEY));
  if (provider === 'resend') {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is missing while EMAIL_PROVIDER=resend');
    }

    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: process.env.RESEND_FROM,
          to: Array.isArray(message.to) ? message.to : [message.to],
          subject: message.subject,
          html: message.html,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (err) {
      const providerMessage = err.response?.data?.message || err.response?.data?.error;
      throw new Error(providerMessage || err.message);
    }
  }

  if (provider === 'brevo') {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is missing while EMAIL_PROVIDER=brevo');
    }

    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: cfg.email_from_name || 'Tile House',
            email: cfg.email_from,
          },
          to: (Array.isArray(message.to) ? message.to : [message.to]).map(email => ({ email })),
          subject: message.subject,
          htmlContent: message.html,
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          timeout: 15000,
        }
      );

      return response.data;
    } catch (err) {
      const providerMessage = err.response?.data?.message || err.response?.data?.code;
      throw new Error(providerMessage || err.message);
    }
  }

  if (provider !== 'smtp') {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}`);
  }

  return makeSmtpTransporter(cfg).sendMail(message);
}

module.exports = { sendMail, isConfigured };