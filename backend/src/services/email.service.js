const nodemailer = require('nodemailer');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

/**
 * Avertissement envoyé lorsqu'un avis contient un langage inapproprié (texte masqué côté plateforme).
 * @param {string} to
 * @param {{ displayName?: string, propertyTitle?: string, maskedPreview?: string }} meta
 */
exports.sendReviewProfanityWarningEmail = async (to, meta = {}) => {
  if (!to) return;

  const displayName = escapeHtml(meta.displayName || 'Bonjour');
  const propertyTitle = escapeHtml(meta.propertyTitle || 'votre annonce');
  const safePreview = escapeHtml(String(meta.maskedPreview || '').slice(0, 280));
  const preview = meta.maskedPreview
    ? `<div style="margin:18px 0;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;font-size:14px;color:#9a3412;line-height:1.6;"><strong>Aperçu publié (masqué)</strong><br/><span style="font-style:italic;">${safePreview}${String(meta.maskedPreview).length > 280 ? '…' : ''}</span></div>`
    : '';

  const transporter = createTransporter();

  const mailOptions = {
    from: `"SmartProperty" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'SmartProperty — Avis : rappel sur le ton de vos commentaires',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: 'Segoe UI', Inter, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 24px 12px; color: #0f172a; }
            .shell { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(15,23,42,0.12); }
            .hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #2563eb 100%); padding: 36px 32px; text-align: center; }
            .hero h1 { margin: 0; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; }
            .hero p { margin: 12px 0 0; font-size: 14px; color: #cbd5f5; line-height: 1.6; }
            .badge { display: inline-block; margin-top: 18px; padding: 6px 14px; border-radius: 999px; background: rgba(248,250,252,0.15); color: #e2e8f0; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
            .body { padding: 32px 36px 40px; }
            .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.75; color: #334155; }
            .list { margin: 20px 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8; }
            .footer { padding: 0 36px 28px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6; }
            .accent { color: #2563eb; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="hero">
              <div class="badge">Rappel communautaire</div>
              <h1>Un instant, ${displayName}</h1>
              <p>Votre avis a bien été enregistré — nous avons simplement harmonisé le texte affiché avec nos règles de courtoisie.</p>
            </div>
            <div class="body">
              <p>Nous vous écrivons au sujet de votre commentaire sur l’annonce <span class="accent">${propertyTitle}</span>.</p>
              <p>Certaines formulations ne respectent pas les <strong>lignes directrices SmartProperty</strong> (respect, langage professionnel, bienveillance envers les autres utilisateurs).</p>
              <p><strong>Ce que nous avons fait :</strong></p>
              <ul class="list">
                <li>Les termes concernés ont été <strong>masqués</strong> dans l’avis visible sur le site.</li>
                <li>Votre <strong>note</strong> et la présence de votre avis sont conservées.</li>
                <li>Nous vous invitons simplement à reformuler vos prochains retours de façon constructive.</li>
              </ul>
              ${preview}
              <p style="margin-top: 24px;">Merci de contribuer à une communauté agréable et fiable. En cas de question, notre équipe reste à votre disposition.</p>
              <p style="margin-bottom: 0; color: #64748b; font-size: 14px;">— L’équipe <span class="accent">SmartProperty</span></p>
            </div>
            <div class="footer">
              Cet e-mail est un rappel automatique. Merci de ne pas répondre directement à cette adresse si elle est noreply.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
