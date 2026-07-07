import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idMatch: string }> }
) {
  try {
    const resolvedParams = await params;
    const idMatch = Number(resolvedParams.idMatch);

    const match = await prisma.match.findUnique({
      where: { idMatch },
      include: {
        utenteOrigina: {
          select: { idUtente: true, username: true }
        },
        utenteOttiene: {
          select: { idUtente: true, username: true }
        }
      }
    });

    if (!match) {
      return Response.json({ error: "Match non trovato" }, { status: 404 });
    }

    return Response.json(match);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ idMatch: string }> }
) {
  try {
    const resolvedParams = await params;
    const idMatch = Number(resolvedParams.idMatch);

    // Prima si eliminano tutti i messaggi legati al match
    await prisma.messaggio.deleteMany({
      where: { idMatch }
    });

    // Poi si elimina il match stesso
    await prisma.match.delete({
      where: { idMatch }
    });

    return Response.json({ success: true, message: "Match annullato" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore durante l'eliminazione del match" }, { status: 500 });
  }
}
