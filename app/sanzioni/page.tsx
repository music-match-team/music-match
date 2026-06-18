"use client";

import { useEffect, useState } from "react";

export default function SanzioniPage() {

  const [sanzioni, setSanzioni] =
    useState<any[]>([]);

  useEffect(() => {

    async function carica() {

      const response =
        await fetch("/api/sanzioni");

      const data =
        await response.json();

      setSanzioni(data);
    }

    carica();

  }, []);

  return (

    <main style={{ padding: "20px" }}>

      <h1>Sanzioni</h1>

      {sanzioni.map((s) => (

        <div
          key={s.idSanzione}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >

          <p>
            Utente:
            {" "}
            {s.utente?.username}
          </p>

          <p>
            Tipo:
            {" "}
            {s.tipo}
          </p>

          <p>
            Motivo:
            {" "}
            {s.motivo}
          </p>

        </div>

      ))}

    </main>

  );
}