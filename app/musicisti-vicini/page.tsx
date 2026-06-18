"use client";

import {
  useEffect,
  useState
} from "react";

export default function MusicistiViciniPage() {

  const [utenti, setUtenti] =
    useState<any[]>([]);

  useEffect(() => {

    const utente =
      JSON.parse(
        localStorage.getItem(
          "utente"
        ) || "null"
      );

    if (!utente) return;

    async function carica() {

      const response =
        await fetch(
          `/api/musicisti-vicini?idUtente=${utente.idUtente}`
        );

      const data =
        await response.json();

      setUtenti(data);
    }

    carica();

  }, []);

  return (

    <main
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Musicisti Vicini
      </h1>

      {utenti.map((u) => (

        <div
          key={
            u.idUtente
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
            {u.username}
          </h3>

          <p>
            {u.bio}
          </p>

        </div>

      ))}

    </main>

  );
}