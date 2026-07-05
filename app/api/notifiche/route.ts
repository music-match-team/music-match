import { prisma } from "@/lib/prisma";

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

  const notifiche =
    await prisma.notifica.findMany({

      where: {
        idUtente
      },

      orderBy: {
        dataCreazione:
          "desc"
      }

    });

  return Response.json(
    notifiche
  );
}

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const notifica =
    await prisma.notifica.create({

      data: {

        messaggio:
          body.messaggio,

        idUtente:
          body.idUtente

      }

    });

  return Response.json(
    notifica
  );
}

export async function PATCH(
  request: Request
) {
  try {
    const body = await request.json();
    const { idNotifica, idUtente, letta } = body;

    if (idNotifica !== undefined) {
      const updated = await prisma.notifica.update({
        where: {
          idNotifica: Number(idNotifica),
        },
        data: {
          letta: Boolean(letta),
        },
      });
      return Response.json(updated);
    } else if (idUtente !== undefined) {
      const updated = await prisma.notifica.updateMany({
        where: {
          idUtente: Number(idUtente),
          letta: false,
        },
        data: {
          letta: true,
        },
      });
      return Response.json(updated);
    }

    return Response.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const { searchParams } = new URL(request.url);
    const idNotifica = searchParams.get("idNotifica");
    const idUtente = searchParams.get("idUtente");

    if (idNotifica) {
      await prisma.notifica.delete({
        where: {
          idNotifica: Number(idNotifica),
        },
      });
      return Response.json({ success: true });
    } else if (idUtente) {
      await prisma.notifica.deleteMany({
        where: {
          idUtente: Number(idUtente),
        },
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}