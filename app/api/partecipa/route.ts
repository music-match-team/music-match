import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const partecipazione =
    await prisma.partecipa.create({

      data: {

        idUtente:
          body.idUtente,

        idEvento:
          body.idEvento

      }

    });

  return Response.json(
    partecipazione
  );
}

export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url);

  const idEvento =
    Number(
      searchParams.get(
        "idEvento"
      )
    );

  const partecipanti =
    await prisma.partecipa.findMany({

      where: {
        idEvento
      },

      include: {
        utente: true
      }

    });

  return Response.json(
    partecipanti
  );
}