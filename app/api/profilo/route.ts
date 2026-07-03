import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {

    const body = await request.json();
	
	console.log("BODY RICEVUTO:", body);

    const {
      idUtente,
      bio,
      livelloEsperienza,
      strumenti,
      generi,
      lat,
      long
    } = body;

    await prisma.utente.update({
      where: {
        idUtente
      },
      data: {
        bio,
        livelloEsperienza,
        lat,
        long
      }
    });

    await prisma.suona.deleteMany({
      where: {
        idUtente
      }
    });

    await prisma.preferisce.deleteMany({
      where: {
        idUtente
      }
    });

    if (strumenti.length > 0) {
      await prisma.suona.createMany({
        data: strumenti.map(
          (idStrumento: number) => ({
            idUtente,
            idStrumento
          })
        )
      });
    }

    if (generi.length > 0) {
      await prisma.preferisce.createMany({
        data: generi.map(
          (idGenere: number) => ({
            idUtente,
            idGenere
          })
        )
      });
    }

    return Response.json({
      message: "Profilo salvato"
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Errore nel salvataggio"
      },
      {
        status: 500
      }
    );
  }
}