import { prisma } from "@/lib/prisma";

export async function GET() {

  const sanzioni =
    await prisma.sanzione.findMany({

      include: {
        utente: true,
        amministratore: true
      }

    });

  return Response.json(
    sanzioni
  );
}

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const sanzione =
    await prisma.sanzione.create({

      data: {

        tipo:
          body.tipo,

        motivo:
          body.motivo,

        dataInizio:
          new Date(),

        dataFine:
          body.dataFine
            ? new Date(body.dataFine)
            : null,

        idAdmin:
          body.idAdmin,

        idUtente:
          body.idUtente

      }

    });

  return Response.json(
    sanzione
  );
}