import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idUtenteStr = searchParams.get("idUtente");

    if (!idUtenteStr) {
      return Response.json({ error: "ID Utente mancante" }, { status: 400 });
    }

    const idUtente = parseInt(idUtenteStr);

    const utente = await prisma.utente.findUnique({
      where: { idUtente },
      include: {
        strumenti: true,
        generi: true,
      }
    });

    if (!utente) {
      return Response.json({ error: "Utente non trovato" }, { status: 404 });
    }

    return Response.json({
      username: utente.username,
      immagineProfilo: utente.immagineProfilo,
      bio: utente.bio,
      livelloEsperienza: utente.livelloEsperienza,
      lat: utente.lat,
      long: utente.long,
      citta: utente.citta,
      strumenti: utente.strumenti.map(s => s.idStrumento),
      generi: utente.generi.map(g => g.idGenere),
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore nel caricamento del profilo" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("BODY RICEVUTO:", body);

    const {
      idUtente,
      username,
      immagineProfilo,
      bio,
      livelloEsperienza,
      strumenti,
      generi,
      lat,
      long,
      citta
    } = body;

    // Controllo se lo username è già in uso
    if (username) {
      const existingUser = await prisma.utente.findUnique({
        where: { username }
      });
      if (existingUser && existingUser.idUtente !== idUtente) {
        return Response.json({ error: "Questo username è già in uso da un altro utente." }, { status: 400 });
      }
    }

    await prisma.utente.update({
      where: {
        idUtente
      },
      data: {
        ...(username && { username }),
        ...(immagineProfilo !== undefined && { immagineProfilo }),
        bio,
        livelloEsperienza,
        lat,
        long,
        citta
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
    /*controlla se la citta esiste, se non esiste inserisce nel db*/
    if (citta) {
      let dbCitta = await prisma.citta.findFirst({
        where: { nome: citta }
      });
      if (!dbCitta) {
        dbCitta = await prisma.citta.create({
          data: { nome: citta }
        });
      }

      await prisma.preferisceLuogo.deleteMany({
        where: { idUtente }
      });

      await prisma.preferisceLuogo.create({
        data: {
          idUtente,
          idCitta: dbCitta.idCitta
        }
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