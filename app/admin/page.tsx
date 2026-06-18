"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function AdminPage() {

  const [segnalazioni, setSegnalazioni] =
    useState<any[]>([]);

  async function caricaSegnalazioni() {

    const response =
      await fetch(
        "/api/segnalazioni"
      );

    const data =
      await response.json();

    setSegnalazioni(data);
  }

  async function sanziona(
    idUtente: number
  ) {

    const motivo =
      prompt(
        "Motivo della sanzione"
      );

    if (!motivo) return;

    const tipo =
      prompt(
        "Tipo sanzione (Ban Temporaneo / Ban Permanente)"
      );

    if (!tipo) return;

    await fetch(
      "/api/sanzioni",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          tipo,

          motivo,

          idAdmin: 1,

          idUtente

        })
      }
    );

    alert(
      "Sanzione applicata"
    );
  }

  useEffect(() => {

    caricaSegnalazioni();

  }, []);

  return (
    <ProteggiPagina>
		<main
		  style={{
			padding: "20px"
		  }}
		>

		  <h1>
			Pannello Admin
		  </h1>

		  {segnalazioni.map(
			(s) => (

			  <div
				key={
				  s.idSegnalazione
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

				<p>
				  Segnalante:
				  {" "}
				  {s.mittente.username}
				</p>

				<p>
				  Segnalato:
				  {" "}
				  {s.destinatario.username}
				</p>

				<p>
				  Motivo:
				  {" "}
				  {s.motivo}
				</p>

				<button
				  onClick={() =>
					sanziona(
					  s.idDestinatario
					)
				  }
				>
				  Sanziona utente
				</button>

			  </div>

			)
		  )}

		</main>
	</ProteggiPagina>

  );
}