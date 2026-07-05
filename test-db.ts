import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const eventi = await prisma.evento.findMany({
      include: { creatori: true },
      orderBy: { data: 'asc' }
    });
    console.log("Success:", eventi);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
