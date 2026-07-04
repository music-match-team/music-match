import { prisma } from "@/lib/prisma";

export async function GET() {

  const musicisti = await prisma.utente.findMany({

    select: {
      idUtente: true,
      username: true,
      bio: true,
      livelloEsperienza: true,
      citta: true,

      strumenti: {
        include: {
          strumento: true
        }
      },

      generi: {
        include: {
          genere: true
        }
      }
    }

  });

  return Response.json(musicisti);
}