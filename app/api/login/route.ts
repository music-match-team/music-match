import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const utente =
    await prisma.utente.findFirst({

      where: {

        email:
          body.email,

        password:
          body.password

      }

    });

  if (!utente) {

    return Response.json(
      {
        error:
          "Credenziali errate"
      },
      {
        status: 401
      }
    );
  }

  return Response.json(
    utente
  );
}