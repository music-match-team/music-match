"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

import { useRouter } from "next/navigation";

export default function EventiPage() {
  const router = useRouter();
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  const [eventi, setEventi] =
    useState<any[]>([]);

  async function caricaEventi() {
    try {
      const response = await fetch("/api/eventi");
      if (!response.ok) {
        console.error("Errore API /eventi:", response.status);
        return;
      }
      const data = await response.json();
      setEventi(data);
    } catch (error) {
      console.error("Errore di rete o parsing:", error);
    }
  }

  async function partecipa(
    idEvento: number
  ) {

    await fetch(
      "/api/partecipa",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          idUtente: utente.idUtente,
          idEvento

        })
      }
    );

    alert(
      "Partecipazione registrata"
    );
  }

  useEffect(() => {

    caricaEventi();

  }, []);

  return (
	<ProteggiPagina>
		<main
		  style={{
			padding: "20px"
		  }}
		>

		  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
			  <h1>Eventi</h1>
			  <button 
			    onClick={() => router.push("/eventi/crea")}
			    style={{ padding: "10px", cursor: "pointer", background: "#0070f3", color: "white", border: "none" }}
			  >
			    Organizza un evento
			  </button>
		  </div>

		  {eventi.map(
			(evento) => (

			  <div
				key={
				  evento.idEvento
				}
				style={{
				  border:
					"1px solid gray",
				  padding:
					"10px",
				  marginBottom:
					"10px"
				}}
			  >

				<h3>
				  {evento.titolo}
				</h3>

				<p>
				  {
					evento.descrizione
				  }
				</p>

				<p>
				  {evento.citta?.nome}
				</p>

				<p style={{ fontSize: "14px", color: "#555" }}>
				  Partecipanti: {evento._count?.partecipanti || 0}
				</p>

				<button
				  onClick={() =>
					partecipa(
					  evento.idEvento
					)
				  }
				>
				  Partecipa
				</button>

			  </div>

			)
		  )}

		</main>
    </ProteggiPagina>
  );
}