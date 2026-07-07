import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        { error: "Nessun file ricevuto" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const nomeFile = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(nomeFile, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Errore Supabase:", error);
      return Response.json(
        { error: "Errore durante il salvataggio su Supabase" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(nomeFile);

    return Response.json({
      source: publicUrlData.publicUrl
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Errore upload" },
      { status: 500 }
    );
  }
}