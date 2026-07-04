import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(
  request: Request
) {
  const body =
    await request.json();

  const utente =
    await prisma.utente.findFirst({
      where: {
        email: body.email
      },
      include: {
        sanzioni: {
          where: {
            OR: [
              { tipo: "BAN" },
              { dataFine: { gt: new Date() } }
            ]
          }
        }
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

  const passwordCorretta =
    await bcrypt.compare(
      body.password,
      utente.password
    );

  if (!passwordCorretta) {
    return Response.json(
      { error: "Credenziali errate" },
      { status: 401 }
    );
  }

  if (utente.sanzioni && utente.sanzioni.length > 0) {
    const ban = utente.sanzioni.find((s: any) => s.tipo === "BAN");
    if (ban) {
      return Response.json(
        { error: "Il tuo account è stato bannato permanentemente." },
        { status: 403 }
      );
    }
    const sospensione = utente.sanzioni.find((s: any) => s.tipo === "SOSPENSIONE" && s.dataFine && new Date(s.dataFine) > new Date());
    if (sospensione) {
      return Response.json(
        { error: `Il tuo account è sospeso fino al ${new Date(sospensione.dataFine!).toLocaleDateString()}.` },
        { status: 403 }
      );
    }
  }

  return Response.json(
    utente
  );
}