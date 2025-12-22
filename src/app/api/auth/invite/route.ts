import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mailer } from "@/lib/mailer";
import { signToken } from "@/lib/security-node";
import { randomId } from "@/lib/totp";
import { requireAdmin } from "@/lib/authz";

const schema = z.object({
  emails: z.array(z.string().email()).min(1).max(1000),
  electionId: z.string().min(1), // Maintenant obligatoire
});

// Fonction pour générer un mot de passe temporaire sécurisé
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const jtis: string[] = [];
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  for (const email of parsed.data.emails) {
    const jti = randomId();
    const temporaryPassword = generateTemporaryPassword();
    jtis.push(jti);

    await prisma.inviteToken.create({
      data: {
        email,
        electionId: parsed.data.electionId,
        jti,
        temporaryPassword,
        used: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    const token = await signToken(
      {
        email,
        electionId: parsed.data.electionId,
        jti,
      },
      "15m"
    );

    const link = `${baseUrl}/auth/complete?token=${token}`;

    await mailer.sendMail({
      from: process.env.MAIL_FROM || "noreply@vote.local",
      to: email,
      subject: "Invitation à voter - RSX103",
      html: `
        <h2>🗳️ Invitation au vote RSX103</h2>
        <p>Bonjour,</p>
        <p>Vous êtes invité(e) à participer au vote des représentants étudiants RSX103.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📋 Vos informations d'accès :</h3>
          <p><strong>Mot de passe temporaire :</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
          <p><strong>Lien d'activation :</strong></p>
          <p><a href="${link}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">🔐 Activer mon compte</a></p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4>⚠️ Important :</h4>
          <ul>
            <li>Ce lien expire dans <strong>15 minutes</strong></li>
            <li>Utilisez le mot de passe temporaire pour activer votre compte</li>
            <li>Vous pourrez ensuite choisir votre propre mot de passe</li>
            <li>Une fois connecté, vous pourrez voter et vous présenter comme candidat</li>
          </ul>
        </div>
        
        <p>🔒 <strong>Sécurité :</strong> Votre vote sera chiffré et anonymisé. Seuls les résultats finaux seront visibles.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; font-size: 12px;">
          <strong>RSX103 - Système de vote sécurisé</strong><br>
          Si vous n'avez pas demandé cette invitation, ignorez ce message.
        </p>
      `,
      text: `
Invitation au vote RSX103

Bonjour,

Vous êtes invité(e) à participer au vote des représentants étudiants RSX103.

Mot de passe temporaire : ${temporaryPassword}
Lien d'activation : ${link}

Important :
- Ce lien expire dans 15 minutes
- Utilisez le mot de passe temporaire pour activer votre compte
- Vous pourrez ensuite choisir votre propre mot de passe
- Une fois connecté, vous pourrez voter et vous présenter comme candidat

RSX103 - Système de vote sécurisé
      `,
    });
  }

  return NextResponse.json({
    ok: true,
    sent: jtis.length,
    message: `${jtis.length} invitations envoyées`,
  });
}
