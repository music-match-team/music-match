"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProteggiPagina from "../components/ProteggiPagina";

export default function MusicistiPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);
  const [musicisti, setMusicisti] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(
      localStorage.getItem("utente") || "null"
    );
    setUtente(u);
  }, []);

  useEffect(() => {
    async function caricaMusicisti() {
      try {
        let url = "/api/musicisti";
        if (utente && utente.idUtente) {
            url += `?idUtente=${utente.idUtente}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();

        setMusicisti(data);
      } catch (error) {
        console.error(error);
      }
    }

    if (utente !== null) {
      caricaMusicisti();
    }
  }, [utente]);

  async function creaMatch(idUtenteOttiene: number) {
    const messaggio = prompt("Scrivi un messaggio per presentarti (opzionale):");
    
    // Se l'utente preme "Annulla" sul prompt, interrompiamo la creazione del match
    if (messaggio === null) return;

    try {
      const response = await fetch("/api/match", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          idUtenteOrigina: utente.idUtente, 
          idUtenteOttiene,
          messaggio,
        }),
      });

      const data = await response.json();

      if (response.ok && data.match) {
        // Reindirizza l'utente direttamente alla pagina della chat
        router.push(`/chat/${data.match.idMatch}`);
      } else {
        alert(data.message || data.error);
        if (data.match) {
           router.push(`/chat/${data.match.idMatch}`);
        }
      }
    } catch (error) {
      console.error(error);

      alert("Errore durante la creazione del match");
    }
  }

  async function segnalaUtente(idUtenteDestinatario: number) {
    const motivo = prompt("Inserisci il motivo della segnalazione:");
    if (!motivo) return;

    try {
      const response = await fetch("/api/segnalazioni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idMittente: utente.idUtente,
          idDestinatario: idUtenteDestinatario,
          motivo,
        }),
      });

      if (response.ok) {
        alert("Utente segnalato con successo.");
      } else {
        alert("Errore durante l'invio della segnalazione.");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'invio della segnalazione.");
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
				  <strong>Città:</strong>{" "}
				  {musicista.citta || "Non specificata"}
                  {musicista.distanceKm !== undefined && musicista.distanceKm !== null && (
                      <span> ({musicista.distanceKm} km di distanza)</span>
                  )}
				</p>

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

				{utente && musicista.idUtente !== utente.idUtente && (
				  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
					  <button
						onClick={() =>
						  creaMatch(
							musicista.idUtente
						  )
						}
					  >
						Match
					  </button>
					  <button
						onClick={() => segnalaUtente(musicista.idUtente)}
						style={{ backgroundColor: "#ff4d4f", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
					  >
						Segnala
					  </button>
				  </div>
				)}
			  </div>
			))
		  )}
		</main>
	</ProteggiPagina>
  );
}