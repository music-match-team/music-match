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

  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [
        { idUtenteOrigina: idUtente },
        { idUtenteOttiene: idUtente }
      ]
    },
    include: {
      utenteOrigina: { select: { idUtente: true, username: true, immagineProfilo: true } },
      utenteOttiene: { select: { idUtente: true, username: true, immagineProfilo: true } }
    },
    orderBy: { dataMatch: 'desc' },
    take: 3
  });

  const upcomingEvents = await prisma.partecipa.findMany({
    where: {
      idUtente,
      evento: { data: { gte: new Date() } }
    },
    include: {
      evento: { include: { citta: true } }
    },
    orderBy: { evento: { data: 'asc' } },
    take: 3
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
      sanzioni.length,

    recentMatches:
      recentMatches.map(m => {
        const otherUser = m.idUtenteOrigina === idUtente ? m.utenteOttiene : m.utenteOrigina;
        return {
          idMatch: m.idMatch,
          otherUser
        };
      }),

    upcomingEvents:
      upcomingEvents.map(p => p.evento)
  });
}