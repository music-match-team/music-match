"use client";

import {
  useEffect,
  useState
} from "react";

export default function NotifichePage() {

  const [utente, setUtente] =
    useState<any>(null);

  const [notifiche,
    setNotifiche] =
    useState<any[]>([]);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem(
          "utente"
        ) || "null"
      );

    setUtente(u);

  }, []);

  useEffect(() => {

    if (!utente) return;

    async function carica() {

      const response =
        await fetch(
          `/api/notifiche?idUtente=${utente.idUtente}`
        );

      const data =
        await response.json();

      setNotifiche(data);
    }

    carica();

  }, [utente]);

  return (

    <main
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Notifiche
      </h1>

      {notifiche.map(
        (n) => (

          <div
            key={
              n.idNotifica
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
              {n.messaggio}
            </p>

          </div>

        )
      )}

    </main>

  );
}