"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";
import { useRouter } from "next/navigation";

export default function EventiPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);
  const [eventi, setEventi] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  useEffect(() => {
    async function caricaEventi() {
      try {
        let url = "/api/eventi";
        if (utente && utente.idUtente) {
          url += `?idUtente=${utente.idUtente}`;
        }
        
        const response = await fetch(url);
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

    if (utente !== null) {
      caricaEventi();
    }
  }, [utente]);

  async function partecipa(idEvento: number) {
    await fetch("/api/partecipa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idUtente: utente.idUtente,
        idEvento
      })
    });
    alert("Partecipazione registrata");
  }

  return (
    <ProteggiPagina>
      <main style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Eventi</h1>
          <button 
            onClick={() => router.push("/eventi/crea")}
            style={{ padding: "10px", cursor: "pointer", background: "#0070f3", color: "white", border: "none" }}
          >
            Organizza un evento
          </button>
        </div>

        {eventi.map((evento) => (
          <div key={evento.idEvento} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
            <h3>{evento.titolo}</h3>
            <p>{evento.descrizione}</p>
            <p>
              {evento.citta?.nome}
              {evento.distanceKm !== undefined && evento.distanceKm !== null && (
                <span> ({evento.distanceKm} km di distanza)</span>
              )}
            </p>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Partecipanti: {evento._count?.partecipanti || 0}
            </p>
            <button onClick={() => partecipa(evento.idEvento)}>Partecipa</button>
          </div>
        ))}
      </main>
    </ProteggiPagina>
  );
}