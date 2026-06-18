import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url);

  const idUtente =
    Number(
      searchParams.get(
        "idUtente"
      )
    );

  const notifiche =
    await prisma.notifica.findMany({

      where: {
        idUtente
      },

      orderBy: {
        dataCreazione:
          "desc"
      }

    });

  return Response.json(
    notifiche
  );
}

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const notifica =
    await prisma.notifica.create({

      data: {

        messaggio:
          body.messaggio,

        idUtente:
          body.idUtente

      }

    });

  return Response.json(
    notifica
  );
}