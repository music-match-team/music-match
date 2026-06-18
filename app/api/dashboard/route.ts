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

  const match =
    await prisma.match.findMany({
      where: {
        OR: [
          {
            idUtenteOrigina:
              idUtente
          },
          {
            idUtenteOttiene:
              idUtente
          }
        ]
      }
    });

  const media =
    await prisma.media.findMany({
      where: {
        idUtente
      }
    });

  const partecipazioni =
    await prisma.partecipa.findMany({
      where: {
        idUtente
      }
    });

  const segnalazioni =
    await prisma.segnalazione.findMany({
      where: {
        idDestinatario:
          idUtente
      }
    });

  const sanzioni =
    await prisma.sanzione.findMany({
      where: {
        idUtente
      }
    });

  return Response.json({
    totaleMatch:
      match.length,

    totaleMedia:
      media.length,

    totaleEventi:
      partecipazioni.length,

    totaleSegnalazioni:
      segnalazioni.length,

    totaleSanzioni:
      sanzioni.length
  });
}