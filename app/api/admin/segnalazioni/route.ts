import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const segnalazioni = await prisma.segnalazione.findMany({
      include: {
        mittente: {
          select: { idUtente: true, username: true, email: true }
        },
        destinatario: {
          select: { idUtente: true, username: true, email: true }
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    return Response.json(segnalazioni);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Errore nel caricamento delle segnalazioni" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { idSegnalazione } = body;

    if (!idSegnalazione) {
      return Response.json(
        { error: "ID Segnalazione mancante" },
        { status: 400 }
      );
    }

    await prisma.segnalazione.delete({
      where: {
        idSegnalazione
      }
    });

    return Response.json({ message: "Segnalazione eliminata con successo" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Errore durante l'eliminazione della segnalazione" },
      { status: 500 }
    );
  }
}
