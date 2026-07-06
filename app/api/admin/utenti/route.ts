import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/admin/utenti — lista tutti gli utenti
// GET /api/admin/utenti?idUtente=X — dettaglio singolo utente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idUtenteStr = searchParams.get("idUtente");

    if (idUtenteStr) {
      const idUtente = parseInt(idUtenteStr);
      const utente = await prisma.utente.findUnique({
        where: { idUtente },
        include: {
          strumenti: { include: { strumento: true } },
          generi: { include: { genere: true } },
          media: { orderBy: { dataUpload: "desc" } },
          sanzioni: {
            include: { amministratore: { select: { username: true } } },
            orderBy: { dataInizio: "desc" },
          },
        },
      });

      if (!utente) {
        return Response.json({ error: "Utente non trovato" }, { status: 404 });
      }

      return Response.json(utente);
    }

    // Lista tutti
    const utenti = await prisma.utente.findMany({
      select: {
        idUtente: true,
        username: true,
        email: true,
        citta: true,
        bio: true,
        livelloEsperienza: true,
        dataCreazione: true,
        _count: {
          select: {
            media: true,
            matchCreati: true,
            matchRicevuti: true,
            sanzioni: true,
          },
        },
      },
      orderBy: { dataCreazione: "desc" },
    });

    return Response.json(utenti);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}

// DELETE /api/admin/utenti — elimina un media di un utente
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { idMedia } = body;

    if (!idMedia) {
      return Response.json({ error: "idMedia mancante" }, { status: 400 });
    }

    await prisma.media.delete({ where: { idMedia } });

    return Response.json({ message: "Media eliminato" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}
