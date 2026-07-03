"use client";

import { useState, useEffect } from "react";

export default function CittaPage() {
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);

  const [query, setQuery] =
    useState("");

  const [citta, setCitta] =
    useState<any[]>([]);

  async function cerca() {

    const response =
      await fetch(
        `/api/citta?q=${query}`
      );

    const data =
      await response.json();

    setCitta(data);
  }

  return (

    <main
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Cerca città
      </h1>

      <input
        value={query}
        onChange={(e) =>
          setQuery(
            e.target.value
          )
        }
      />

      <button
        onClick={cerca}
      >
        Cerca
      </button>

      <hr />

      {citta.map((c) => (

        <div
          key={
            c.geonameId
          }
        >

          {c.name}

        </div>

      ))}

    </main>

  );
}