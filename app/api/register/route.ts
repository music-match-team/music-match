import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { validatePassword } from "@/lib/password-validation";

export async function POST(
  request: Request
) {
  const body =
    await request.json();

  if (!body.email || !body.username || !body.password) {
    return Response.json(
      {
        error: "Tutti i campi sono obbligatori"
      },
      {
        status: 400
      }
    );
  }

  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.isValid) {
    return Response.json(
      {
        error: passwordValidation.errors.join(". ")
      },
      {
        status: 400
      }
    );
  }

  const utenteEsistente =
    await prisma.utente.findFirst({
      where: {
        email: body.email
      }
    });

  if (utenteEsistente) {
    return Response.json(
      {
        error:
          "Email già registrata"
      },
      {
        status: 400
      }
    );
  }

  const passwordHash =
    await bcrypt.hash(
      body.password,
      10
    );

  const utente =
    await prisma.utente.create({
      data: {
        username:
          body.username,

        email:
          body.email,

        password:
          passwordHash,

        ruolo:
          "utente"
      }
    });

  return Response.json(
    utente
  );
}