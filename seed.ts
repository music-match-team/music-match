import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const strumenti = ["Chitarra", "Basso", "Batteria", "Pianoforte", "Voce", "Tastiera", "Violino", "Sassofono"];
  const generi = ["Rock", "Pop", "Jazz", "Metal", "Classica", "Blues", "Hip Hop", "Indie"];

  for (const s of strumenti) {
    await prisma.strumento.create({ data: { nome: s } });
  }

  for (const g of generi) {
    await prisma.genere.create({ data: { nome: g } });
  }
  
  console.log("Database popolato con strumenti e generi!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
