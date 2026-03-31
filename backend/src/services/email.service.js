const nodemailer = require('nodemailer');

/**
 * Crée un transporteur SMTP configuré depuis les variables d'environnement.
 * Compatible Gmail, Outlook, SendGrid SMTP, ou n'importe quel SMTP custom.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true pour SSL (465), false pour TLS (587)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Envoie un email de réinitialisation de mot de passe.
 * @param {string} to - Email du destinataire
 * @param {string} resetUrl - Lien complet de reset (frontend URL + token)
 */
exports.sendPasswordResetEmail = async (to, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"SmartProperty" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your SmartProperty password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: #1e293b; padding: 32px 40px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 22px; }
            .body { padding: 36px 40px; }
            .body p { color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 20px; }
            .btn { display: inline-block; background: #2563eb; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
            .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
            .url-box { background: #f1f5f9; border-radius: 8px; padding: 12px 16px; word-break: break-all; font-size: 13px; color: #64748b; margin-bottom: 20px; }
            .footer { padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartProperty</h1>
            </div>
            <div class="body">
              <p>Hi,</p>
              <p>We received a request to reset your password. Click the button below to create a new one. This link expires in <strong>10 minutes</strong>.</p>
              <a href="${resetUrl}" class="btn">Reset my password</a>
              <hr class="divider" />
              <p>If the button doesn't work, copy and paste this URL in your browser:</p>
              <div class="url-box">${resetUrl}</div>
              <p>If you didn't request a password reset, you can safely ignore this email — your account is safe.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} SmartProperty. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Envoie un email transactionnel pour une vente ou une location.
 * @param {Object} options
 * @param {string} options.to - Destinataire principal
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.title - Titre affiché dans l'email
 * @param {string[]} [options.introLines] - Paragraphes d'intro
 * @param {Array<{label:string,value:string}>} [options.details] - Tableau de détails à afficher
 * @param {string} [options.actionUrl] - Lien CTA
 * @param {string} [options.actionLabel] - Libellé du bouton CTA
 * @param {string} [options.footerNote] - Note de bas de page
 */
exports.sendPropertyTransactionEmail = async (options = {}) => {
  const {
    to,
    subject,
    title,
    introLines = [],
    details = [],
    actionUrl,
    actionLabel = 'View details',
    footerNote,
  } = options;

  if (!to || !subject || !title) {
    throw new Error('Missing required email parameters: to, subject, title');
  }

  const transporter = createTransporter();

  const detailRows = (details || [])
    .filter((item) => item && item.value !== undefined && item.value !== null && item.value !== '')
    .map((item) => `
      <tr>
        <td style="padding: 10px 12px; color: #475569; font-weight: 600; background: #f8fafc;">${item.label}</td>
        <td style="padding: 10px 12px; color: #0f172a;">${item.value}</td>
      </tr>
    `)
    .join('');

  const introHtml = (introLines || [])
    .filter(Boolean)
    .map((line) => `<p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 14px;">${line}</p>`)
    .join('');

  const actionBlock = actionUrl
    ? `<a href="${actionUrl}" class="btn">${actionLabel}</a>`
    : '';

  const mailOptions = {
    from: `"SmartProperty" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 640px; margin: 36px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(15,23,42,0.08); }
            .header { background: linear-gradient(120deg, #1e293b, #0f172a); padding: 32px 40px; }
            .header h1 { color: #fff; margin: 0; font-size: 22px; }
            .body { padding: 36px 40px; }
            .btn { display: inline-block; background: #2563eb; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 12px 0 16px; }
            .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 18px; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
            td { font-size: 14px; }
            .footer { padding: 20px 40px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="body">
              ${introHtml}
              ${actionBlock}
              ${detailRows ? `<table>${detailRows}</table>` : ''}
              ${footerNote ? `<p style="color:#94a3b8; font-size: 13px; margin-top: 18px;">${footerNote}</p>` : ''}
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} SmartProperty. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
