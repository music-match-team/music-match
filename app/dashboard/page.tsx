"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function DashboardPage() {

  const [utente, setUtente] =
    useState<any>(null);

  const [dashboard, setDashboard] =
    useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  useEffect(() => {

    if (!utente) return;

    async function caricaDashboard() {

      const response =
        await fetch(
          `/api/dashboard?idUtente=${utente.idUtente}`
        );

      const data =
        await response.json();

      setDashboard(data);
    }

    caricaDashboard();

  }, [utente]);

  if (!utente) {

	  return (
		<main
		  style={{
			padding: "20px"
		  }}
		>
		  <h1>DEBUG</h1>

		  <p>
			Utente non trovato nel localStorage
		  </p>

		  <a href="/login">
			Vai al Login
		  </a>
		</main>
	  );
  }

  return (
    
	<ProteggiPagina>

		<main
		  style={{
			padding: "20px",
			maxWidth: "800px"
		  }}
		>

		  <h1>
			Dashboard
		  </h1>

		  <h2>
			Benvenuto {utente.username}
		  </h2>

		  {!dashboard ? (

			<p>
			  Caricamento dati...
			</p>

		  ) : (

			<div
			  style={{
				display: "grid",
				gap: "15px",
				marginTop: "20px"
			  }}
			>

			  <div
				style={{
				  border: "1px solid gray",
				  padding: "15px"
				}}
			  >
				<h3>Match</h3>

				<p>
				  {dashboard.totaleMatch}
				</p>
			  </div>

			  <div
				style={{
				  border: "1px solid gray",
				  padding: "15px"
				}}
			  >
				<h3>Media caricati</h3>

				<p>
				  {dashboard.totaleMedia}
				</p>
			  </div>

			  <div
				style={{
				  border: "1px solid gray",
				  padding: "15px"
				}}
			  >
				<h3>Eventi</h3>

				<p>
				  {dashboard.totaleEventi}
				</p>
			  </div>

			  <div
				style={{
				  border: "1px solid gray",
				  padding: "15px"
				}}
			  >
				<h3>Segnalazioni ricevute</h3>

				<p>
				  {dashboard.totaleSegnalazioni}
				</p>
			  </div>

			  <div
				style={{
				  border: "1px solid gray",
				  padding: "15px"
				}}
			  >
				<h3>Sanzioni</h3>

				<p>
				  {dashboard.totaleSanzioni}
				</p>
			  </div>

			</div>

		  )}

		</main>
	
	</ProteggiPagina>

  );
}