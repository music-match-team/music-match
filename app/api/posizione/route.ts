import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const utente =
    await prisma.utente.update({

      where: {
        idUtente:
          body.idUtente
      },

      data: {

        lat:
          body.lat,

        long:
          body.long

      }

    });

  return Response.json(
    utente
  );
}