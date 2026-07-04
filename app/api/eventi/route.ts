import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const eventi =
      await prisma.evento.findMany({
      include: {
        creatori: {
          include: {
            utente: true
          }
        },
        citta: true,
        _count: {
          select: { partecipanti: true }
        }
      },
      orderBy: {
        data: "asc"
      }
    });

    return Response.json(eventi);
  } catch (error: any) {
    console.error("Errore Prisma:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  let dbCitta = await prisma.citta.findFirst({
    where: { nome: body.luogo }
  });

  if (!dbCitta) {
    dbCitta = await prisma.citta.create({
      data: { nome: body.luogo }
    });
  }

  const evento =
    await prisma.evento.create({
      data: {
        titolo: body.titolo,
        descrizione: body.descrizione,
        idCitta: dbCitta.idCitta,
        lat: body.lat,
        long: body.long,
        data: new Date(body.data),
        creatori: {
          create: {
            idUtente: body.idOrganizzatore
          }
        }
      }
    });

  return Response.json(
    evento
  );
}