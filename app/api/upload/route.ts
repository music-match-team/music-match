import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function POST(
  request: Request
) {
  try {

    const formData =
      await request.formData();

    const file =
      formData.get("file") as File;

    if (!file) {
      return Response.json(
        {
          error: "Nessun file ricevuto"
        },
        {
          status: 400
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const nomeFile =
      `${uuidv4()}-${file.name}`;

    const percorso =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        nomeFile
      );

    console.log("PERCORSO:", percorso);

	await writeFile(
	  percorso,
	  buffer
	);

	console.log("FILE SALVATO");

    return Response.json({
      source:
        `/uploads/${nomeFile}`
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error:
          "Errore upload"
      },
      {
        status: 500
      }
    );

  }
}