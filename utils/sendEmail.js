const nodemailer = require('nodemailer');

// Транспортер
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Шаблон HTML
const createEmailTemplate = ({ title, body, buttonText, buttonLink, footerNote }) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 24px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 32px;">
      <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 24px;">${title}</h2>
      <p style="font-size: 16px; color: #333333; line-height: 1.6;">${body}</p>

      ${
        buttonLink
          ? `<div style="text-align: center; margin: 32px 0;">
              <a href="${buttonLink}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${buttonText}
              </a>
            </div>`
          : ''
      }

      <p style="font-size: 14px; color: #777777;">${footerNote}</p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eeeeee;" />

      <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
        Omega Tyres — ваш надійний маркетплейс шин 🚗
      </p>
    </div>
  </div>
`;

// Обгортка для відправки email
const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.BREVO_FROM_EMAIL,
    to,
    subject,
    html,
  });
};

module.exports = {
  createEmailTemplate,
  sendEmail,
};
