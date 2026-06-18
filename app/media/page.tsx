"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function MediaPage() {
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  const [media, setMedia] =
    useState<any[]>([]);

  useEffect(() => {

    async function caricaMedia() {

      const response =
        await fetch(
          "/api/media?idUtente=1"
        );

      const data =
        await response.json();

      setMedia(data);
    }

    caricaMedia();

  }, []);

  return (
    <ProteggiPagina>
		<main
		  style={{
			padding: "20px"
		  }}
		>
		  <h1>I miei Media</h1>

		  {media.map((m) => (

			<div
			  key={m.idMedia}
			>

			  <img
				  src={m.source}
				  alt={m.descrizione}
				  width={250}
				  style={{
					borderRadius: "8px",
					marginBottom: "10px"
				  }}
			  />

			  <p>
				{m.descrizione}
			  </p>

			</div>

		  ))}
		</main>
	</ProteggiPagina>
  );
}