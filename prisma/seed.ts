import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Charger les variables d'environnement AVANT toute chose
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Créer les 4 admins LDAP
  const admins = [
    {
      email: "admin1@rsx103.fr",
      ldapUid: "admin1",
    },
    {
      email: "admin2@rsx103.fr",
      ldapUid: "admin2",
    },
    {
      email: "admin3@rsx103.fr",
      ldapUid: "admin3",
    },
    {
      email: "admin4@rsx103.fr",
      ldapUid: "admin4",
    },
  ];

  for (const admin of admins) {
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        ldapUid: admin.ldapUid,
        role: "admin",
      },
    });
    console.log("✔ Admin LDAP créé :", admin.email);
  }

  console.log("✔ Tous les admins LDAP sont configurés");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
