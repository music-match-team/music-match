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
