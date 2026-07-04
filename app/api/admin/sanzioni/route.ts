import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const adminIdStr = request.headers.get("admin-id");
    if (!adminIdStr) {
      return Response.json({ error: "Accesso negato" }, { status: 403 });
    }
    const idAdmin = parseInt(adminIdStr);

    const body = await request.json();
    const { idUtente, tipo, motivo, giorniSospensione } = body;

    if (!idUtente || !tipo || !motivo) {
      return Response.json({ error: "Dati mancanti" }, { status: 400 });
    }

    if (tipo !== "BAN" && tipo !== "SOSPENSIONE") {
      return Response.json({ error: "Tipo sanzione non valido" }, { status: 400 });
    }

    let dataFine: Date | null = null;

    if (tipo === "SOSPENSIONE") {
      if (!giorniSospensione || giorniSospensione <= 0) {
        return Response.json({ error: "Giorni di sospensione non validi" }, { status: 400 });
      }
      dataFine = new Date();
      dataFine.setDate(dataFine.getDate() + parseInt(giorniSospensione));
    }

    const sanzione = await prisma.sanzione.create({
      data: {
        tipo,
        motivo,
        dataInizio: new Date(),
        dataFine,
        idAdmin,
        idUtente
      }
    });

    return Response.json({ message: "Sanzione applicata con successo", sanzione });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Errore del server" }, { status: 500 });
  }
}
