"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ChatPage() {

  const params = useParams();

  const idMatch =
    params.idMatch as string;

  const [messaggi, setMessaggi] =
    useState<any[]>([]);

  const [nuovoMessaggio,
    setNuovoMessaggio] =
    useState("");

  async function caricaMessaggi() {

    const response =
      await fetch(
        `/api/messaggi?idMatch=${idMatch}`
      );

    const data =
      await response.json();

    setMessaggi(data);
  }

  useEffect(() => {

    if (!idMatch) {
      return;
    }

    caricaMessaggi();

    const interval =
      setInterval(
        caricaMessaggi,
        3000
      );

    return () =>
      clearInterval(interval);

  }, [idMatch]);

  async function inviaMessaggio() {

    if (
      nuovoMessaggio.trim() === ""
    ) {
      return;
    }

    await fetch(
      "/api/messaggi",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          contenuto:
            nuovoMessaggio,

          idMatch:
            Number(idMatch),

          idUtenteMittente:
            1

        })
      }
    );

    setNuovoMessaggio("");

    caricaMessaggi();
  }

  return (

    <main
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto"
      }}
    >

      <h1>Chat</h1>

      <div
        style={{
          border:
            "1px solid #ccc",

          borderRadius:
            "8px",

          minHeight:
            "400px",

          padding:
            "15px",

          marginBottom:
            "15px",

          overflowY:
            "auto"
        }}
      >

        {messaggi.length === 0 ? (

          <p>
            Nessun messaggio
          </p>

        ) : (

          messaggi.map(
            (messaggio) => (

              <div
                key={
                  messaggio.idMessaggio
                }
                style={{
                  marginBottom:
                    "15px",

                  padding:
                    "10px",

                  borderBottom:
                    "1px solid #eee"
                }}
              >

                <strong>
                  {
                    messaggio
                      .mittente
                      ?.username ||
                    "Utente"
                  }
                </strong>

                <p
                  style={{
                    marginTop:
                      "5px"
                  }}
                >
                  {
                    messaggio
                      .contenuto
                  }
                </p>

              </div>

            )
          )

        )}

      </div>

      <div
        style={{
          display: "flex",
          gap: "10px"
        }}
      >

        <input
          type="text"

          value={
            nuovoMessaggio
          }

          onChange={(e) =>
            setNuovoMessaggio(
              e.target.value
            )
          }

          placeholder="Scrivi un messaggio..."

          style={{
            flex: 1,
            padding: "10px"
          }}
        />

        <button
          onClick={
            inviaMessaggio
          }
        >
          Invia
        </button>

      </div>

    </main>

  );
}