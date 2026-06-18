import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const messaggio =
    await prisma.messaggio.create({

      data: {

        contenuto:
          body.contenuto,

        idMatch:
          body.idMatch,

        idUtenteMittente:
          body.idUtenteMittente

      }

    });

  return Response.json(
    messaggio
  );
}

export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url);

  const idMatch =
    Number(
      searchParams.get(
        "idMatch"
      )
    );

  const messaggi =
  await prisma.messaggio.findMany({

    where: {
      idMatch
    },

    include: {
      mittente: {
        select: {
          idUtente: true,
          username: true
        }
      }
    },

    orderBy: {
      timestamp: "asc"
    }

  });

  return Response.json(
    messaggi
  );
}