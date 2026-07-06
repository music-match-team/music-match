import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/admin/eventi — lista tutti gli eventi
export async function GET() {
  try {
    const eventi = await prisma.evento.findMany({
      include: {
        citta: true,
        creatori: {
          include: { utente: { select: { idUtente: true, username: true } } },
        },
        _count: {
          select: { partecipanti: true },
        },
      },
      orderBy: { data: "desc" },
    });

    return Response.json(eventi);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}

// DELETE /api/admin/eventi — elimina un evento
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { idEvento } = body;

    if (!idEvento) {
      return Response.json({ error: "idEvento mancante" }, { status: 400 });
    }

    // Prima elimina le relazioni collegate
    await prisma.partecipa.deleteMany({ where: { idEvento } });
    await prisma.crea.deleteMany({ where: { idEvento } });
    await prisma.evento.delete({ where: { idEvento } });

    return Response.json({ message: "Evento eliminato" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}
