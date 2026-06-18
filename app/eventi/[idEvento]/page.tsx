"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

export default function PartecipantiPage() {

  const params =
    useParams();

  const idEvento =
    Number(
      params.idEvento
    );

  const [partecipanti,
    setPartecipanti] =
    useState<any[]>([]);

  useEffect(() => {

    async function carica() {

      const response =
        await fetch(
          `/api/partecipa?idEvento=${idEvento}`
        );

      const data =
        await response.json();

      setPartecipanti(
        data
      );
    }

    carica();

  }, [idEvento]);

  return (

    <main
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Partecipanti
      </h1>

      {partecipanti.map(
        (p) => (

          <div
            key={
              p.utente.idUtente
            }
          >

            <p>
              {
                p.utente
                  .username
              }
            </p>

          </div>

        )
      )}

    </main>

  );
}