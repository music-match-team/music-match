"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProteggiPagina from "../components/ProteggiPagina";

export default function MatchPage() {
  
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);  
  
  const [matches, setMatches] =
    useState<any[]>([]);

  useEffect(() => {
    async function caricaMatch() {
      const response =
        await fetch(
          "/api/match?idUtente=1"
        );

      const data =
        await response.json();

      setMatches(data);
    }

    caricaMatch();
  }, []);

  return (
    <ProteggiPagina>
		<main
		  style={{
			padding: "20px",
			maxWidth: "900px"
		  }}
		>
		  <h1>I miei Match</h1>

		  {matches.length === 0 ? (
			<p>Nessun match</p>
		  ) : (
			matches.map((match) => (
			  <div
				key={match.idMatch}
				style={{
				  border: "1px solid #ccc",
				  borderRadius: "8px",
				  padding: "15px",
				  marginBottom: "20px"
				}}
			  >
				<h2>
				  {
					match.utenteOttiene
					  .username
				  }
				</h2>

				<p>
				  <strong>Bio:</strong>{" "}
				  {
					match.utenteOttiene
					  .bio ||
					  "Nessuna bio"
				  }
				</p>

				<p>
				  <strong>
					Esperienza:
				  </strong>{" "}
				  {
					match.utenteOttiene
					  .livelloEsperienza ||
					  "Non specificata"
				  }
				</p>

				<Link
				  href={`/chat/${match.idMatch}`}
				>
				  <button>
					Apri Chat
				  </button>
				</Link>
			  </div>
			))
		  )}
		</main>
	</ProteggiPagina>
  );
}