
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret } from "@/lib/totp";
import { enc } from "@/lib/crypto";
import { requireAdmin } from "@/lib/authz";

export async function POST() {
  try {
    const session = await requireAdmin();

    // Générer un nouveau secret TOTP
    const secret = generateTotpSecret();
    const encryptedSecret = enc(secret);

    // Mettre à jour l'admin avec le secret chiffré
    await prisma.adminUser.update({
      where: { email: session.email },
      data: { totpSecret: encryptedSecret },
    });

    // Retourner le secret et l'URL pour le QR code
    const accountName = session.email;
    const issuer = "ESNA";

    const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    return NextResponse.json({
      ok: true,
      secret,
      qrCodeUrl: otpAuthUrl,
      message: "TOTP configuré avec succès",
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
