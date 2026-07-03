"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProteggiPagina from "../../components/ProteggiPagina";

export default function CreaEventoPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [data, setData] = useState("");
  const [messaggio, setMessaggio] = useState("");

  const [ricercaCitta, setRicercaCitta] = useState("");
  const [risultatiCitta, setRisultatiCitta] = useState<any[]>([]);
  const [cittaSelezionata, setCittaSelezionata] = useState<any>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);

  useEffect(() => {
    if (ricercaCitta.length > 2) {
      const delayFn = setTimeout(async () => {
        try {
          const res = await fetch(`/api/citta?q=${ricercaCitta}`);
          const data = await res.json();
          setRisultatiCitta(data);
        } catch (e) {
          console.error(e);
        }
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setRisultatiCitta([]);
    }
  }, [ricercaCitta]);

  async function creaEvento() {
    if (!titolo || !cittaSelezionata || !data) {
      setMessaggio("Titolo, luogo (selezionato dalla lista) e data sono obbligatori");
      return;
    }

    try {
      const response = await fetch("/api/eventi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titolo,
          descrizione,
          luogo: cittaSelezionata,
          lat,
          long,
          data,
          idOrganizzatore: utente.idUtente,
        }),
      });

      if (!response.ok) {
        setMessaggio("Errore durante la creazione dell'evento");
        return;
      }

      setMessaggio("Evento creato con successo!");
      setTimeout(() => {
        router.push("/eventi");
      }, 1500);

    } catch (error) {
      console.error(error);
      setMessaggio("Errore di rete");
    }
  }

  return (
    <ProteggiPagina>
      <main style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Organizza un evento</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            placeholder="Titolo"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            style={{ padding: "8px" }}
          />

          <textarea
            placeholder="Descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={4}
            style={{ padding: "8px" }}
          />

          <div>
            <input
              type="text"
              placeholder="Cerca città per l'evento..."
              value={ricercaCitta}
              onChange={(e) => setRicercaCitta(e.target.value)}
              style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
            />
            {risultatiCitta.length > 0 && (
              <ul style={{ border: "1px solid #ccc", listStyle: "none", padding: 0, margin: 0, maxHeight: "150px", overflowY: "auto" }}>
                {risultatiCitta.map((c: any) => (
                  <li
                    key={c.geonameId}
                    style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                    onClick={() => {
                      setLat(parseFloat(c.lat));
                      setLong(parseFloat(c.lng));
                      setCittaSelezionata(c.name);
                      setRicercaCitta("");
                      setRisultatiCitta([]);
                    }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
            {cittaSelezionata && (
              <p style={{ margin: "5px 0", fontSize: "14px", color: "green" }}>
                Città selezionata: <strong>{cittaSelezionata}</strong>
              </p>
            )}
          </div>

          <input
            type="datetime-local"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{ padding: "8px" }}
          />

          <button onClick={creaEvento} style={{ padding: "10px", cursor: "pointer", background: "#0070f3", color: "white", border: "none" }}>
            Crea Evento
          </button>

          {messaggio && <p>{messaggio}</p>}
        </div>
      </main>
    </ProteggiPagina>
  );
}
