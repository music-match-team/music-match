import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const admin = await prisma.amministratore.findUnique({
      where: {
        email: body.email
      }
    });

    if (!admin) {
      return Response.json(
        { error: "Credenziali errate" },
        { status: 401 }
      );
    }

    const passwordCorretta = await bcrypt.compare(
      body.password,
      admin.password
    );

    if (!passwordCorretta) {
      return Response.json(
        { error: "Credenziali errate" },
        { status: 401 }
      );
    }

    // Rimuoviamo la password dalla risposta per sicurezza
    const { password, ...adminSenzaPassword } = admin;

    return Response.json(adminSenzaPassword);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Errore del server" },
      { status: 500 }
    );
  }
}
