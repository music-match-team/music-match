import { prisma } from "@/lib/prisma";

export async function GET() {

  const eventi =
    await prisma.evento.findMany({

      orderBy: {
        data: "asc"
      }

    });

  return Response.json(eventi);
}

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const evento =
    await prisma.evento.create({

      data: {

        titolo:
          body.titolo,

        descrizione:
          body.descrizione,

        luogo:
          body.luogo,

        data:
          new Date(body.data)

      }

    });

  return Response.json(evento);
}