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