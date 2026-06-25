import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      idUtenteOrigina,
      idUtenteOttiene
    } = body;

    if (
      !idUtenteOrigina ||
      !idUtenteOttiene
    ) {
      return Response.json(
        {
          error: "Dati mancanti"
        },
        {
          status: 400
        }
      );
    }

    const matchEsistente =
      await prisma.match.findFirst({
        where: {
          idUtenteOrigina,
          idUtenteOttiene
        }
      });

    if (matchEsistente) {
      return Response.json(
        {
          error: "Match già esistente"
        },
        {
          status: 409
        }
      );
    }

    const match =
      await prisma.match.create({
        data: {
          idUtenteOrigina,
          idUtenteOttiene
        }
      });
	
	await prisma.notifica.create({

		data: {

		  idUtente:
			idUtenteOttiene,

		  messaggio:
			"Hai ricevuto una richiesta di match"

        }

    });

    return Response.json(
      {
        message:
          "Match creato con successo",
        match
      },
      {
        status: 201
      }
    );

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error:
          "Errore interno del server"
      },
      {
        status: 500
      }
    );
  }
}

export async function GET(
  request: Request
) {
  const { searchParams } =
    new URL(request.url);

  const idUtente =
    Number(
      searchParams.get("idUtente")
    );

  const matches =
    await prisma.match.findMany({
      where: {
        idUtenteOrigina: idUtente
      },

      include: {
        utenteOttiene: {
          select: {
            idUtente: true,
            username: true,
            bio: true,
            livelloEsperienza: true
          }
        }
      }
    });

  return Response.json(matches);
}