import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { validatePassword } from "../lib/password-validation";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const username = process.argv[4];

  if (!email || !password || !username) {
    console.error("Uso: npx ts-node scripts/crea-super-admin.ts <email> <password> <username>");
    process.exit(1);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    console.error("La password non soddisfa i requisiti di sicurezza:");
    passwordValidation.errors.forEach(error => console.error("  -", error));
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.amministratore.create({
      data: {
        email,
        password: hashedPassword,
        username,
        isSuperAdmin: true,
      },
    });

    console.log("Super Admin creato con successo:", admin.username, admin.email);
  } catch (error) {
    console.error("Errore durante la creazione del Super Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
