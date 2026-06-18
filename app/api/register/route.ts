import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, email, password } = body;

    if (!username || !email || !password) {
      return Response.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    const utenteEsistente = await prisma.utente.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (utenteEsistente) {
      return Response.json(
        {
          error: "Username o email già utilizzati"
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const utente = await prisma.utente.create({
      data: {
        username,
        email,
        password: passwordHash,
        ruolo: "utente"
      }
    });

    return Response.json(
      {
        message: "Utente registrato correttamente",
        utente: {
          idUtente: utente.idUtente,
          username: utente.username,
          email: utente.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}