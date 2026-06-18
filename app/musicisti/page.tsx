"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function MusicistiPage() {
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  const [musicisti, setMusicisti] = useState<any[]>([]);

  useEffect(() => {
    async function caricaMusicisti() {
      try {
        const response = await fetch("/api/musicisti");
        const data = await response.json();

        setMusicisti(data);
      } catch (error) {
        console.error(error);
      }
    }

    caricaMusicisti();
  }, []);

  async function creaMatch(idUtenteOttiene: number) {
    try {
      const response = await fetch("/api/match", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          idUtenteOrigina: utente.idUtente, 
          idUtenteOttiene,
        }),
      });

      const data = await response.json();

      alert(data.message || data.error);
    } catch (error) {
      console.error(error);

      alert("Errore durante la creazione del match");
    }
  }

  return (
    <ProteggiPagina>
		<main
		  style={{
			padding: "20px",
			maxWidth: "900px",
		  }}
		>
		  <h1>Musicisti</h1>

		  {musicisti.length === 0 ? (
			<p>Nessun musicista trovato.</p>
		  ) : (
			musicisti.map((musicista) => (
			  <div
				key={musicista.idUtente}
				style={{
				  border: "1px solid #ccc",
				  borderRadius: "8px",
				  padding: "15px",
				  marginBottom: "20px",
				}}
			  >
				<h2>{musicista.username}</h2>

				<p>
				  <strong>Bio:</strong>{" "}
				  {musicista.bio || "Nessuna bio"}
				</p>

				<p>
				  <strong>Esperienza:</strong>{" "}
				  {musicista.livelloEsperienza ||
					"Non specificata"}
				</p>

				<p>
				  <strong>Strumenti:</strong>{" "}
				  {musicista.strumenti.length > 0
					? musicista.strumenti
						.map(
						  (s: any) =>
							s.strumento.nome
						)
						.join(", ")
					: "Nessuno"}
				</p>

				<p>
				  <strong>Generi:</strong>{" "}
				  {musicista.generi.length > 0
					? musicista.generi
						.map(
						  (g: any) =>
							g.genere.nome
						)
						.join(", ")
					: "Nessuno"}
				</p>

				{musicista.idUtente !== utente.idUtente && (
				  <button
					onClick={() =>
					  creaMatch(
						musicista.idUtente
					  )
					}
				  >
					Match
				  </button>
				)}
			  </div>
			))
		  )}
		</main>
	</ProteggiPagina>
  );
}