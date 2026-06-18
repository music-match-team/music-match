"use client";

export default function PosizionePage() {

  async function salvaPosizione() {

    const utente =
      JSON.parse(
        localStorage.getItem(
          "utente"
        ) || "null"
      );

    if (!utente) {

      alert(
        "Login richiesto"
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        await fetch(
          "/api/posizione",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              idUtente:
                utente.idUtente,

              lat:
                position.coords.latitude,

              long:
                position.coords.longitude

            })
          }
        );

        alert(
          "Posizione salvata"
        );
      }

    );
  }

  return (

    <main
      style={{
        padding: "20px"
      }}
    >

      <h1>
        Geolocalizzazione
      </h1>

      <button
        onClick={
          salvaPosizione
        }
      >
        Salva posizione
      </button>

    </main>

  );
}