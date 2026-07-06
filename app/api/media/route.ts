import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  const body =
    await request.json();

  const media =
    await prisma.media.create({

      data: {

        source:
          body.source,

        tipo:
          body.tipo,

        descrizione:
          body.descrizione,

        idUtente:
          body.idUtente

      }

    });

  return Response.json(media);
}

export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url);

  const idUtente =
    Number(
      searchParams.get(
        "idUtente"
      )
    );

  const media =
    await prisma.media.findMany({

      where: {
        idUtente
      },

      orderBy: {
        dataUpload:
          "desc"
      }

    });

  return Response.json(media);
}

export async function DELETE(
  request: Request
) {
  try {
    const { searchParams } = new URL(request.url);
    const idMedia = Number(searchParams.get("idMedia"));

    if (!idMedia) {
      return Response.json(
        { error: "ID Media mancante" },
        { status: 400 }
      );
    }

    await prisma.media.delete({
      where: {
        idMedia
      }
    });

    return Response.json({ message: "Media eliminato con successo" });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Errore durante l'eliminazione del media" },
      { status: 500 }
    );
  }
}