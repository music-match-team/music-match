import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ idEvento: string }> }) {
  try {
    const { idEvento: idEventoStr } = await params;
    const idEvento = parseInt(idEventoStr);
    if (isNaN(idEvento)) {
      return Response.json({ error: "ID evento non valido" }, { status: 400 });
    }
    const evento = await prisma.evento.findUnique({
      where: { idEvento },
      include: { citta: true }
    });
    if (!evento) return Response.json({ error: "Non trovato" }, { status: 404 });
    return Response.json(evento);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ idEvento: string }> }) {
  try {
    const { idEvento: idEventoStr } = await params;
    const idEvento = parseInt(idEventoStr);
    if (isNaN(idEvento)) {
      return Response.json({ error: "ID evento non valido" }, { status: 400 });
    }

    const body = await request.json();
    const { titolo, descrizione, luogo, lat, long, data, locandina, idOrganizzatore } = body;

    // Check if user is an organizer
    const eventoInfo = await prisma.evento.findUnique({
      where: { idEvento },
      include: { creatori: true }
    });

    if (!eventoInfo) {
      return Response.json({ error: "Evento non trovato" }, { status: 404 });
    }

    const isOrganizer = eventoInfo.creatori.some(c => c.idUtente === idOrganizzatore);
    if (!isOrganizer) {
      return Response.json({ error: "Non autorizzato" }, { status: 403 });
    }

    let dbCitta = await prisma.citta.findFirst({
      where: { nome: luogo }
    });

    if (!dbCitta) {
      dbCitta = await prisma.citta.create({
        data: { nome: luogo }
      });
    }

    const updatedEvento = await prisma.evento.update({
      where: { idEvento },
      data: {
        titolo,
        descrizione,
        idCitta: dbCitta.idCitta,
        lat,
        long,
        locandina,
        data: new Date(data),
      }
    });

    return Response.json(updatedEvento);
  } catch (error: any) {
    console.error("Errore modifica evento:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ idEvento: string }> }) {
  try {
    const { idEvento: idEventoStr } = await params;
    const idEvento = parseInt(idEventoStr);
    if (isNaN(idEvento)) {
      return Response.json({ error: "ID evento non valido" }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const idUtenteParam = searchParams.get('idUtente');
    
    if (!idUtenteParam) {
      return Response.json({ error: "idUtente mancante" }, { status: 400 });
    }

    const idUtente = parseInt(idUtenteParam);

    // Check if user is an organizer
    const eventoInfo = await prisma.evento.findUnique({
      where: { idEvento },
      include: { creatori: true }
    });

    if (!eventoInfo) {
      return Response.json({ error: "Evento non trovato" }, { status: 404 });
    }

    const isOrganizer = eventoInfo.creatori.some(c => c.idUtente === idUtente);
    if (!isOrganizer) {
      return Response.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Delete cascading references if Prisma does not have cascade set.
    // Participants and Creators first.
    await prisma.partecipa.deleteMany({
      where: { idEvento }
    });
    
    await prisma.crea.deleteMany({
      where: { idEvento }
    });

    await prisma.evento.delete({
      where: { idEvento }
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Errore cancellazione evento:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
