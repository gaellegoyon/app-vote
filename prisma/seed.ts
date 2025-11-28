import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

// Charger les variables d'environnement AVANT toute chose
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = "admin@test.com";
  const password = "Password123!";

  const pwdHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      pwdHash,
      role: "admin",
    },
  });

  console.log("✔ Admin par défaut prêt :", email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
