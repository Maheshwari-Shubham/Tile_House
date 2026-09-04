const axios = require('axios');
const nodemailer = require('nodemailer');

function getProvider() {
  return String(process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
}

function isConfigured(cfg) {
  if (getProvider() === 'resend') {
    return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
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
  if (getProvider() === 'resend') {
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

  return makeSmtpTransporter(cfg).sendMail(message);
}

module.exports = { sendMail, isConfigured };