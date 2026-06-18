"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function EventiPage() {
	
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

    const response =
      await fetch(
        "/api/eventi"
      );

    const data =
      await response.json();

    setEventi(data);
  }
  
  if (!utente) {
	  alert("Effettua il login");
	  return;
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

		  <h1>
			Eventi
		  </h1>

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
				  {evento.luogo}
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