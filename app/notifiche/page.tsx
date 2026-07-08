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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Principale come Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden">
            {/* Decorazione Sfondo */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#22d3ee] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent sm:text-4xl mb-2">
                Centro Notifiche
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl font-medium">
                Rimani aggiornato sui tuoi match, eventi e attività.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
              {conteggioNonLette > 0 && (
                <button
                  onClick={segnaTutteComeLette}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-sm font-semibold rounded-lg transition-all border border-zinc-700 cursor-pointer text-zinc-200 shadow-sm"
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
                  className="flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 active:scale-95 text-sm font-semibold rounded-lg transition-all border border-red-900/60 cursor-pointer shadow-sm"
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
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden">
          
          {/* Sezione Filtri */}
          <div className="flex border-b border-zinc-800 pb-4 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltro("tutte")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  filtro === "tutte"
                    ? "bg-zinc-800 text-white shadow-md border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Tutte ({notifiche.length})
              </button>
              <button
                onClick={() => setFiltro("non_lette")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  filtro === "non_lette"
                    ? "bg-zinc-800 text-white shadow-md border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Non lette ({conteggioNonLette})
              </button>
            </div>
          </div>

          {/* Lista Notifiche */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9]"></div>
            </div>
          ) : notificheFiltrate.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 text-zinc-400 border border-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">Tutto in ordine!</h3>
              <p className="text-zinc-400 text-sm mt-2">
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
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    n.letta
                      ? "bg-zinc-900/60 border-zinc-800 hover:border-[#0ea5e9]/50 text-zinc-300 shadow-sm"
                      : "bg-zinc-800/60 border-[#0ea5e9]/50 hover:border-[#0ea5e9]/80 shadow-md border-l-4 border-l-[#0ea5e9]"
                  }`}
                >
                  {/* Icona di stato o pallino blu */}
                  <div className="mt-1 flex-shrink-0">
                    {!n.letta ? (
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0ea5e9]"></span>
                      </span>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                      </div>
                    )}
                  </div>

                  {/* Messaggio e Data */}
                  <div className="flex-1 min-w-0 pr-8">
                    <p className={`text-sm leading-relaxed break-words ${n.letta ? "text-zinc-400" : "text-zinc-100 font-medium"}`}>
                      {n.messaggio}
                    </p>
                    <span className="inline-block mt-2 text-xs text-zinc-500">
                      {formattaData(n.dataCreazione)}
                    </span>
                  </div>

                  {/* Azioni rapide a destra */}
                  <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                    {!n.letta && (
                      <button
                        onClick={() => segnaComeLetta(n.idNotifica)}
                        className="p-1.5 hover:bg-zinc-800 text-[#0ea5e9] hover:text-[#e879f9] rounded-lg transition-colors cursor-pointer"
                        title="Segna come letta"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => eliminaNotifica(n.idNotifica)}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
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
      </div>
      </div>
    </ProteggiPagina>
  );
}