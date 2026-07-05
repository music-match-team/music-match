"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function NotifichePage() {
  const [utente, setUtente] = useState<any>(null);
  const [notifiche, setNotifiche] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtro, setFiltro] = useState<"tutte" | "non_lette">("tutte");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  const caricaNotifiche = async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifiche?idUtente=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifiche(data);
      }
    } catch (e) {
      console.error("Errore nel caricamento delle notifiche:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!utente) return;
    caricaNotifiche(utente.idUtente);
  }, [utente]);

  const segnaComeLetta = async (idNotifica: number) => {
    try {
      const response = await fetch("/api/notifiche", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNotifica, letta: true })
      });
      if (response.ok) {
        setNotifiche(prev => prev.map(n => n.idNotifica === idNotifica ? { ...n, letta: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const segnaTutteComeLette = async () => {
    if (!utente) return;
    try {
      const response = await fetch("/api/notifiche", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUtente: utente.idUtente, letta: true })
      });
      if (response.ok) {
        setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminaNotifica = async (idNotifica: number) => {
    try {
      const response = await fetch(`/api/notifiche?idNotifica=${idNotifica}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setNotifiche(prev => prev.filter(n => n.idNotifica !== idNotifica));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminaTutte = async () => {
    if (!utente) return;
    if (!window.confirm("Sei sicuro di voler eliminare tutte le notifiche? Questa operazione non è reversibile.")) {
      return;
    }
    try {
      const response = await fetch(`/api/notifiche?idUtente=${utente.idUtente}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setNotifiche([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formattaData = (dataStr: string) => {
    const data = new Date(dataStr);
    const ora = data.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const diffMs = Date.now() - data.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Adesso";
    if (diffMins < 60) return `${diffMins} min fa`;
    
    const oggi = new Date();
    const ieri = new Date(oggi);
    ieri.setDate(oggi.getDate() - 1);
    
    if (data.toDateString() === oggi.toDateString()) {
      return `Oggi, ${ora}`;
    }
    if (data.toDateString() === ieri.toDateString()) {
      return `Ieri, ${ora}`;
    }
    
    return `${data.toLocaleDateString("it-IT")} ${ora}`;
  };

  const notificheFiltrate = notifiche.filter(n => {
    if (filtro === "non_lette") return !n.letta;
    return true;
  });

  const conteggioNonLette = notifiche.filter(n => !n.letta).length;

  return (
    <ProteggiPagina>
      <main className="max-w-4xl mx-auto py-10 px-4 md:px-8 min-h-screen text-slate-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Centro Notifiche
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Rimani aggiornato sui tuoi match, eventi e attività.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {conteggioNonLette > 0 && (
              <button
                onClick={segnaTutteComeLette}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-sm font-semibold rounded-lg transition-all border border-slate-700 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                  <path d="m16 6-8 8.5-3.5-3.5"/>
                </svg>
                Segna tutte come lette
              </button>
            )}
            {notifiche.length > 0 && (
              <button
                onClick={eliminaTutte}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 active:scale-95 text-sm font-semibold rounded-lg transition-all border border-red-900/60 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Svuota tutto
              </button>
            )}
          </div>
        </div>

        {/* Tab ed Elenco */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
          
          {/* Sezione Filtri */}
          <div className="flex border-b border-slate-800 pb-4 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltro("tutte")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  filtro === "tutte"
                    ? "bg-slate-800 text-white shadow-md border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tutte ({notifiche.length})
              </button>
              <button
                onClick={() => setFiltro("non_lette")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  filtro === "non_lette"
                    ? "bg-slate-800 text-white shadow-md border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Non lette ({conteggioNonLette})
              </button>
            </div>
          </div>

          {/* Lista Notifiche */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : notificheFiltrate.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-400 border border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Tutto in ordine!</h3>
              <p className="text-slate-400 text-sm mt-2">
                {filtro === "non_lette" 
                  ? "Non hai nessuna notifica da leggere al momento." 
                  : "Non hai ancora nessuna notifica. Le novità appariranno qui."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notificheFiltrate.map((n) => (
                <div
                  key={n.idNotifica}
                  className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    n.letta
                      ? "bg-slate-950/20 border-slate-800/80 text-slate-300 opacity-75 hover:opacity-100"
                      : "bg-slate-850 border-blue-900/30 hover:border-blue-900/60 shadow-md border-l-4 border-l-blue-500"
                  }`}
                >
                  {/* Icona di stato o pallino blu */}
                  <div className="mt-1 flex-shrink-0">
                    {!n.letta ? (
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                      </span>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      </div>
                    )}
                  </div>

                  {/* Messaggio e Data */}
                  <div className="flex-1 min-w-0 pr-8">
                    <p className={`text-sm leading-relaxed break-words ${n.letta ? "text-slate-400" : "text-slate-100 font-medium"}`}>
                      {n.messaggio}
                    </p>
                    <span className="inline-block mt-2 text-xs text-slate-500">
                      {formattaData(n.dataCreazione)}
                    </span>
                  </div>

                  {/* Azioni rapide a destra */}
                  <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    {!n.letta && (
                      <button
                        onClick={() => segnaComeLetta(n.idNotifica)}
                        className="p-1.5 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-lg transition-colors cursor-pointer"
                        title="Segna come letta"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => eliminaNotifica(n.idNotifica)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Elimina notifica"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </ProteggiPagina>
  );
}