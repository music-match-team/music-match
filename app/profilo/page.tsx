"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

interface Strumento {
  idStrumento: number;
  nome: string;
}

interface Genere {
  idGenere: number;
  nome: string;
}

export default function ProfiloPage() {
	
  const [utente, setUtente] =
  useState<any>(null);

  useEffect(() => {

    const u =
      JSON.parse(
        localStorage.getItem("utente") || "null"
      );

    setUtente(u);

  }, []);
  
  const [strumenti, setStrumenti] = useState<Strumento[]>([]);
  const [generi, setGeneri] = useState<Genere[]>([]);

  const [bio, setBio] = useState("");
  const [livelloEsperienza, setLivelloEsperienza] =
    useState("Principiante");

  const [strumentiSelezionati, setStrumentiSelezionati] =
    useState<number[]>([]);

  const [generiSelezionati, setGeneriSelezionati] =
    useState<number[]>([]);

  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    async function caricaDati() {
      try {
        const rispostaStrumenti =
          await fetch("/api/strumenti");

        const datiStrumenti =
          await rispostaStrumenti.json();

        setStrumenti(datiStrumenti);

        const rispostaGeneri =
          await fetch("/api/generi");

        const datiGeneri =
          await rispostaGeneri.json();

        setGeneri(datiGeneri);

      } catch (error) {
        console.error(error);
      }
    }

    caricaDati();
  }, []);

  function toggleStrumento(id: number) {
    if (strumentiSelezionati.includes(id)) {
      setStrumentiSelezionati(
        strumentiSelezionati.filter(
          (s) => s !== id
        )
      );
    } else {
      setStrumentiSelezionati([
        ...strumentiSelezionati,
        id
      ]);
    }
  }

  function toggleGenere(id: number) {
    if (generiSelezionati.includes(id)) {
      setGeneriSelezionati(
        generiSelezionati.filter(
          (g) => g !== id
        )
      );
    } else {
      setGeneriSelezionati([
        ...generiSelezionati,
        id
      ]);
    }
  }

  async function salvaProfilo() {
    try {
      const response =
        await fetch("/api/profilo", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            idUtente: utente.idUtente, 

            bio,

            livelloEsperienza,

            strumenti:
              strumentiSelezionati,

            generi:
              generiSelezionati,
          }),
        });

      const data =
        await response.json();

      setMessaggio(
        data.message ||
          "Profilo salvato"
      );

    } catch (error) {
      console.error(error);

      setMessaggio(
        "Errore durante il salvataggio"
      );
    }
  }

  return (
    <ProteggiPagina>
		<main
		  style={{
			padding: "20px",
			maxWidth: "800px",
		  }}
		>
		  <h1>Profilo Utente</h1>

		  <h2>Bio</h2>

		  <textarea
			rows={5}
			cols={50}
			value={bio}
			onChange={(e) =>
			  setBio(e.target.value)
			}
			placeholder="Parlaci di te..."
		  />

		  <h2>Livello esperienza</h2>

		  <select
			value={livelloEsperienza}
			onChange={(e) =>
			  setLivelloEsperienza(
				e.target.value
			  )
			}
		  >
			<option>
			  Principiante
			</option>

			<option>
			  Intermedio
			</option>

			<option>
			  Avanzato
			</option>
		  </select>

		  <h2>Strumenti</h2>

		  {strumenti.map(
			(strumento) => (
			  <div
				key={
				  strumento.idStrumento
				}
			  >
				<label>
				  <input
					type="checkbox"
					onChange={() =>
					  toggleStrumento(
						strumento.idStrumento
					  )
					}
				  />

				  {strumento.nome}
				</label>
			  </div>
			)
		  )}

		  <h2>Generi Musicali</h2>

		  {generi.map((genere) => (
			<div
			  key={genere.idGenere}
			>
			  <label>
				<input
				  type="checkbox"
				  onChange={() =>
					toggleGenere(
					  genere.idGenere
					)
				  }
				/>

				{genere.nome}
			  </label>
			</div>
		  ))}

		  <br />

		  <button
			onClick={salvaProfilo}
		  >
			Salva Profilo
		  </button>

		  <p>{messaggio}</p>
		</main>
	
	</ProteggiPagina>
  );
}