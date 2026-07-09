"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProteggiPagina from "../../components/ProteggiPagina";

function CreaEventoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  useEffect(() => {
    if (editId) {
      fetch(`/api/eventi/${editId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setTitolo(data.titolo || "");
            setDescrizione(data.descrizione || "");
            if (data.data) {
              const d = new Date(data.data);
              // format for datetime-local: YYYY-MM-DDThh:mm
              const pad = (n: number) => n.toString().padStart(2, '0');
              const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
              setData(formatted);
            }
            if (data.citta) setCittaSelezionata(data.citta.nome);
            setLat(data.lat);
            setLong(data.long);
            setLocandinaBase64(data.locandina || null);
          }
        });
    }
  }, [editId]);

  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [data, setData] = useState("");
  const [messaggio, setMessaggio] = useState("");
  
  const [locandinaBase64, setLocandinaBase64] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocandinaBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function creaEvento() {
    if (!titolo || !cittaSelezionata || !data) {
      setMessaggio("Titolo, luogo (selezionato dalla lista) e data sono obbligatori");
      return;
    }

    try {
      const url = editId ? `/api/eventi/${editId}` : "/api/eventi";
      const method = editId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
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
          locandina: locandinaBase64,
          idOrganizzatore: utente.idUtente,
        }),
      });

      if (!response.ok) {
        setMessaggio(`Errore durante ${editId ? "la modifica" : "la creazione"} dell'evento`);
        return;
      }

      setMessaggio(`Evento ${editId ? "modificato" : "creato"} con successo! Reindirizzamento...`);
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
      <main className="min-h-screen bg-zinc-950 py-10 px-4 flex justify-center text-slate-100">
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-10 relative">
          
          <button 
            onClick={() => router.push("/eventi")}
            className="absolute top-6 left-6 flex items-center justify-center p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>

          <h1 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent">
            {editId ? "Modifica Evento" : "Organizza un Evento"}
          </h1>

          <div className="flex flex-col gap-5">
            
            {/* Input: Locandina */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Locandina (Immagine Copertina)</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {locandinaBase64 ? (
                    <img src={locandinaBase64} alt="Preview Locandina" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0ea5e9]/10 file:text-[#22d3ee] hover:file:bg-[#0ea5e9]/20 cursor-pointer transition-colors"
                />
              </div>
            </div>

            {/* Input: Titolo */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Titolo Evento</label>
              <input
                type="text"
                placeholder="Es: Jam Session Blues in centro"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22d3ee] rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>

            {/* Input: Descrizione */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Descrizione</label>
              <textarea
                placeholder="Dettagli, scaletta, strumenti ricercati..."
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22d3ee] rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Input: Città */}
            <div className="relative">
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Luogo (Città)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Cerca una città..."
                  value={ricercaCitta}
                  onChange={(e) => setRicercaCitta(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22d3ee] rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 outline-none transition-all"
                />
              </div>
              
              {risultatiCitta.length > 0 && (
                <ul className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {risultatiCitta.map((c: any) => (
                    <li
                      key={c.geonameId}
                      className="px-4 py-3 hover:bg-zinc-700 cursor-pointer text-sm text-zinc-200 border-b border-zinc-700/50 last:border-0 transition-colors"
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
                <p className="mt-2 text-xs font-medium text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/20 px-3 py-1.5 rounded-lg w-fit flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Selezionata: {cittaSelezionata}
                </p>
              )}
            </div>

            {/* Input: Data */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Data e Ora</label>
              <input
                type="datetime-local"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22d3ee] rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>

            {messaggio && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${messaggio.includes("Errore") || messaggio.includes("obbligatori") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/20"}`}>
                {messaggio}
              </div>
            )}

            <button 
              onClick={creaEvento} 
              className="mt-4 w-full py-4 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-[#0ea5e9]/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg"
            >
              {editId ? "Salva Modifiche" : "Pubblica Evento"}
            </button>

          </div>
        </div>
      </main>
    </ProteggiPagina>
  );
}

export default function CreaEventoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#22d3ee]"></div></div>}>
      <CreaEventoForm />
    </Suspense>
  );
}
