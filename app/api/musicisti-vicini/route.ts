import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(
      request.url
    );

  const idUtente =
    Number(
      searchParams.get(
        "idUtente"
      )
    );

  const utente =
    await prisma.utente.findUnique({

      where: {
        idUtente
      }

    });

  if (
    !utente ||
    !utente.lat ||
    !utente.long
  ) {

    return Response.json([]);
  }

  const now = new Date();

  const utenti =
    await prisma.utente.findMany({
      where: {
        idUtente: {
          not: idUtente
        },
        sanzioni: {
          none: {
            OR: [
              { tipo: "BAN" },
              { tipo: "SOSPENSIONE", dataFine: { gt: now } }
            ]
          }
        }
      }
    });

  const vicini =
    utenti.filter((u) => {

      if (
        !u.lat ||
        !u.long
      ) {
        return false;
      }

      const distanza =
        Math.sqrt(
          Math.pow(
            Number(u.lat) -
              Number(
                utente.lat
              ),
            2
          ) +
            Math.pow(
              Number(u.long) -
                Number(
                  utente.long
                ),
              2
            )
        );

      return distanza < 1;
    });

  return Response.json(
    vicini
  );
}