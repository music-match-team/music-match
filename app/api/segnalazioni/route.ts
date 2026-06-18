import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const segnalazione =
    await prisma.segnalazione.create({

      data: {

        motivo:
          body.motivo,

        idMittente:
          body.idMittente,

        idDestinatario:
          body.idDestinatario

      }

    });

  return Response.json(
    segnalazione
  );
}

export async function GET() {

  const segnalazioni =
    await prisma.segnalazione.findMany({

      include: {

        mittente: true,
        destinatario: true

      }

    });

  return Response.json(
    segnalazioni
  );
}