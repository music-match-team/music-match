"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function UploadPage() {
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  const [file, setFile] =
    useState<File | null>(null);

  const [descrizione,
    setDescrizione] =
    useState("");

  async function upload() {
	  
	if (!utente) {

      alert(
        "Effettua il login"
      );

      return;
    }

    if (!file) {
      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const uploadResponse =
      await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData
        }
      );

    const uploadData =
	await uploadResponse.json();

	if (!uploadResponse.ok) {

	  alert(
		uploadData.error ||
		"Errore upload"
	  );

	  return;
	}

	await fetch(
	  "/api/media",
	  {
		method: "POST",
		headers: {
		  "Content-Type":
			"application/json"
		},
		body: JSON.stringify({
		  source:
			uploadData.source,
		  tipo:
			"immagine",
		  descrizione,
		  idUtente: utente.idUtente
		})
	  }
	);

    alert(
      "Media caricato!"
    );
  }

  return (
    <ProteggiPagina>
		<main
		  style={{
			padding: "20px"
		  }}
		>

		  <h1>
			Carica Media
		  </h1>

		  <input
			type="file"

			onChange={(e) =>
			  setFile(
				e.target.files?.[0] ||
				null
			  )
			}
		  />

		  <br />
		  <br />

		  <input
			type="text"

			placeholder="Descrizione"

			value={
			  descrizione
			}

			onChange={(e) =>
			  setDescrizione(
				e.target.value
			  )
			}
		  />

		  <br />
		  <br />

		  <button
			onClick={upload}
		  >
			Carica
		  </button>

		</main>
	</ProteggiPagina>

  );
}