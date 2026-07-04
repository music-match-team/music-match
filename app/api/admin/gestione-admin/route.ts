import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Funzione helper per verificare se l'utente che fa la richiesta è un super admin
async function verificaSuperAdmin(request: Request) {
  const adminIdStr = request.headers.get("admin-id");
  if (!adminIdStr) return false;

  const idAdmin = parseInt(adminIdStr);
  const admin = await prisma.amministratore.findUnique({
    where: { idAdmin },
    select: { isSuperAdmin: true }
  });

  return admin?.isSuperAdmin === true;
}

export async function GET(request: Request) {
  try {
    const isSuperAdmin = await verificaSuperAdmin(request);
    if (!isSuperAdmin) {
      return Response.json({ error: "Accesso negato" }, { status: 403 });
    }

    const amministratori = await prisma.amministratore.findMany({
      select: {
        idAdmin: true,
        username: true,
        email: true,
        isSuperAdmin: true,
      }
    });

    return Response.json(amministratori);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isSuperAdminReq = await verificaSuperAdmin(request);
    if (!isSuperAdminReq) {
      return Response.json({ error: "Accesso negato" }, { status: 403 });
    }

    const body = await request.json();
    const { email, username, password, isSuperAdmin } = body;

    const exist = await prisma.amministratore.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (exist) {
      return Response.json({ error: "Username o email già in uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuovoAdmin = await prisma.amministratore.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isSuperAdmin: isSuperAdmin || false
      },
      select: {
        idAdmin: true,
        username: true,
        email: true,
        isSuperAdmin: true,
      }
    });

    return Response.json(nuovoAdmin);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isSuperAdminReq = await verificaSuperAdmin(request);
    if (!isSuperAdminReq) {
      return Response.json({ error: "Accesso negato" }, { status: 403 });
    }

    const body = await request.json();
    const { idAdminTarget } = body;

    if (!idAdminTarget) {
      return Response.json({ error: "ID Amministratore mancante" }, { status: 400 });
    }

    await prisma.amministratore.delete({
      where: {
        idAdmin: idAdminTarget
      }
    });

    return Response.json({ message: "Amministratore eliminato" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}
