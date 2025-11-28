import nodemailer from "nodemailer";
import { signToken } from "./security-node";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// Templates d'emails sécurisés
export async function sendVoterInvitation(
  email: string,
  electionTitle: string,
  electionId: string
) {
  const token = await signToken({ email, electionId, purpose: "vote" }, "72h");
  const voteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/complete?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Convocation à voter - ${electionTitle}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">🗳️ Convocation à voter</h1>
        <p style="margin: 10px 0 0 0; color: #6b7280;">
          Élection des délégués de promotion
        </p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">${electionTitle}</h2>
        
        <p>Bonjour,</p>
        
        <p>Vous êtes convoqué(e) à participer à l'élection des délégués de votre promotion.</p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">
            ⚠️ Vote unique et anonyme
          </p>
          <p style="margin: 10px 0 0 0; color: #92400e;">
            Vous ne pourrez voter qu'une seule fois. Votre vote restera totalement anonyme.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${voteUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🔐 Créer mon mot de passe et voter
          </a>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Sécurité</h3>
          <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
            <li>Ce lien est personnel et sécurisé</li>
            <li>Il expire automatiquement dans 72h</li>
            <li>Votre identité ne sera jamais liée à votre vote</li>
          </ul>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ESNA - Plateforme de vote sécurisée
        </p>
      </div>
    </body>
    </html>
  `;

  await mailer.sendMail({
    from: process.env.SMTP_FROM || '"ESNA Vote" <vote@esna.fr>',
    to: email,
    subject: `🗳️ Convocation à voter - ${electionTitle}`,
    html,
  });
}

export async function sendSecondRoundNotification(
  email: string,
  electionTitle: string,
  qualifiedCandidates: string[]
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Second tour - ${electionTitle}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #92400e; margin: 0;">🗳️ Second tour de scrutin</h1>
        <p style="margin: 10px 0 0 0; color: #92400e;">
          Aucun candidat n'a obtenu la majorité absolue
        </p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-top: 0;">${electionTitle}</h2>
        
        <p>Le premier tour n'ayant pas permis de dégager un vainqueur avec la majorité absolue, un second tour est organisé.</p>
        
        <h3 style="color: #1f2937;">Candidats qualifiés :</h3>
        <ul style="background: #f3f4f6; padding: 15px; border-radius: 6px;">
          ${qualifiedCandidates
            .map((name) => `<li><strong>${name}</strong></li>`)
            .join("")}
        </ul>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">
            📧 Nouvelle convocation à venir
          </p>
          <p style="margin: 10px 0 0 0; color: #1e40af;">
            Vous recevrez prochainement une nouvelle convocation pour voter au second tour.
          </p>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ESNA - Plateforme de vote sécurisée
        </p>
      </div>
    </body>
    </html>
  `;

  await mailer.sendMail({
    from: process.env.SMTP_FROM || '"ESNA Vote" <vote@esna.fr>',
    to: email,
    subject: `🗳️ Second tour - ${electionTitle}`,
    html,
  });
}
