"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProteggiPagina from "../components/ProteggiPagina";

export default function DashboardPage() {
  const router = useRouter();

  const [utente, setUtente] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    const aggiornaUtente = () => {
      const u = JSON.parse(localStorage.getItem("utente") || "null");
      setUtente(u);
    };
    aggiornaUtente();

    window.addEventListener("utenteAggiornato", aggiornaUtente);
    return () => window.removeEventListener("utenteAggiornato", aggiornaUtente);
  }, []);

  useEffect(() => {
    if (!utente) return;

    async function caricaDashboard() {
      try {
        const response = await fetch(`/api/dashboard?idUtente=${utente.idUtente}`, {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setDashboard(data);
        }
      } catch (error) {
        console.error("Errore caricamento dashboard", error);
      }
    }

    caricaDashboard();
  }, [utente]);

  function eseguiLogout() {
    localStorage.removeItem("utente");
    router.push("/login");
  }

  if (!utente) {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Autenticazione Richiesta</h1>
        <p className="text-zinc-400 mb-6">Devi effettuare l'accesso per visualizzare la Dashboard.</p>
        <button onClick={() => router.push("/login")} className="px-6 py-2 bg-[#0ea5e9] text-white rounded-lg font-bold">
          Vai al Login
        </button>
      </main>
    );
  }

  return (
    <ProteggiPagina>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Section: Welcome & Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gestione Profilo Card (Più importante, lg:col-span-2) */}
            <div 
              onClick={() => router.push("/profilo")}
              className="lg:col-span-2 group flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 bg-zinc-900/40 border border-zinc-800 hover:border-[#0ea5e9]/50 p-8 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden cursor-pointer transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0ea5e9]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-700 group-hover:border-[#0ea5e9] overflow-hidden bg-zinc-800 shrink-0 transition-colors relative z-10 shadow-2xl">
                {utente.immagineProfilo ? (
                   <img src={utente.immagineProfilo} alt="Immagine Profilo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-5xl group-hover:text-[#0ea5e9] transition-colors">
                     {utente.username ? utente.username.charAt(0).toUpperCase() : "?"}
                   </div>
                )}
              </div>
              
              <div className="text-center md:text-left relative z-10 flex-1">
                <h3 className="text-3xl font-extrabold text-white group-hover:text-[#0ea5e9] transition-colors mb-2">Il Tuo Profilo</h3>
                <p className="text-base text-zinc-400 mb-6 max-w-md">Aggiorna la tua foto copertina, i tuoi strumenti e fatti notare dagli altri musicisti della community.</p>
                
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#0ea5e9] text-white rounded-xl font-bold shadow-lg shadow-[#0ea5e9]/20 group-hover:shadow-[#0ea5e9]/40 group-hover:scale-105 transition-all">
                  Gestisci Profilo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </div>

            {/* Welcome Card (Meno importante, lg:col-span-1) */}
            <div className="lg:col-span-1 flex flex-col justify-center gap-6 bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden text-center sm:text-left">
              {/* Decorazione Sfondo */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#22d3ee] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10">
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent mb-1">
                  Music Match
                </h1>
                <h2 className="text-lg font-semibold text-white">
                  Ciao, <span className="text-[#0ea5e9]">{utente.username}</span>!
                </h2>
                <p className="mt-3 text-sm text-zinc-400">
                  Tieni sotto controllo le tue attività e scopri nuovi musicisti.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 relative z-10 shrink-0 mt-2">
                <button
                  onClick={() => router.push("/musicisti")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-zinc-700 rounded-lg text-sm font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer shadow-sm w-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Scopri Musicisti
                </button>
                <button
                  onClick={eseguiLogout}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-all cursor-pointer shadow-sm w-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Esci
                </button>
              </div>
            </div>

          </div>

          {/* Griglia Statistiche */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 px-1">
              <svg className="w-5 h-5 text-[#22d3ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Panoramica Attività
            </h3>
            
            {!dashboard ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse bg-zinc-900/60 border border-zinc-800 rounded-2xl h-32"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Card Match */}
                <div className="group bg-zinc-900/80 border border-zinc-800 hover:border-[#0ea5e9]/50 rounded-2xl p-6 shadow-sm transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#0ea5e9]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-[#0ea5e9]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-zinc-400 text-sm font-medium">Match Totali</h4>
                      <p className="text-3xl font-extrabold text-white mt-1">{dashboard.totaleMatch}</p>
                    </div>
                  </div>
                </div>

                {/* Card Eventi */}
                <div className="group bg-zinc-900/80 border border-zinc-800 hover:border-[#22d3ee]/50 rounded-2xl p-6 shadow-sm transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#22d3ee]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-[#22d3ee]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-zinc-400 text-sm font-medium">Eventi Organizzati</h4>
                      <p className="text-3xl font-extrabold text-white mt-1">{dashboard.totaleEventi}</p>
                    </div>
                  </div>
                </div>

                {/* Card Media */}
                <div className="group bg-zinc-900/80 border border-zinc-800 hover:border-[#0ea5e9]/50 rounded-2xl p-6 shadow-sm transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#0ea5e9]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-[#0ea5e9]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-zinc-400 text-sm font-medium">Media Caricati</h4>
                      <p className="text-3xl font-extrabold text-white mt-1">{dashboard.totaleMedia}</p>
                    </div>
                  </div>
                </div>

                {/* Card Segnalazioni */}
                <div className="group bg-zinc-900/80 border border-zinc-800 hover:border-yellow-500/50 rounded-2xl p-6 shadow-sm transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-yellow-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-zinc-400 text-sm font-medium">Segnalazioni Ricevute</h4>
                      <p className="text-3xl font-extrabold text-white mt-1">{dashboard.totaleSegnalazioni}</p>
                    </div>
                  </div>
                </div>

                {/* Card Sanzioni */}
                <div className="group bg-zinc-900/80 border border-zinc-800 hover:border-red-500/50 rounded-2xl p-6 shadow-sm transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-zinc-400 text-sm font-medium">Sanzioni</h4>
                      <p className="text-3xl font-extrabold text-white mt-1">{dashboard.totaleSanzioni}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Collegamenti Rapidi (Solo Desktop) */}
          {dashboard && (
            <div className="hidden md:grid grid-cols-2 gap-6 pt-4">
              
              {/* Chat Recenti */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#0ea5e9]/10 rounded-full pointer-events-none"></div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 relative z-10 shrink-0">
                  <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Chat Recenti
                </h3>
                <div className="flex flex-col gap-3 relative z-10 flex-1">
                  {dashboard.recentMatches && dashboard.recentMatches.length > 0 ? (
                    dashboard.recentMatches.map((m: any) => (
                      <div key={m.idMatch} onClick={() => router.push('/match')} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 cursor-pointer transition-all hover:border-[#0ea5e9]/50 shadow-sm">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                           {m.otherUser.immagineProfilo ? <img src={m.otherUser.immagineProfilo} alt="Profilo" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-lg text-zinc-400">{m.otherUser.username.charAt(0).toUpperCase()}</div>}
                        </div>
                        <span className="font-medium text-white">{m.otherUser.username}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 text-sm flex h-full items-center justify-center py-4 text-center">Nessuna chat recente</div>
                  )}
                </div>
              </div>

              {/* Prossimi Eventi */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#22d3ee]/10 rounded-full pointer-events-none"></div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 relative z-10 shrink-0">
                  <svg className="w-5 h-5 text-[#22d3ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Eventi in Arrivo
                </h3>
                <div className="flex flex-col gap-3 relative z-10 flex-1">
                  {dashboard.upcomingEvents && dashboard.upcomingEvents.length > 0 ? (
                    dashboard.upcomingEvents.map((e: any) => (
                      <div key={e.idEvento} onClick={() => router.push('/eventi')} className="flex flex-col p-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800 cursor-pointer transition-all hover:border-[#22d3ee]/50 shadow-sm">
                        <span className="font-medium text-white truncate">{e.titolo}</span>
                        <div className="flex items-center justify-between text-xs text-zinc-400 mt-1.5">
                          <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{new Date(e.data).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{e.citta?.nome || "Città N/D"}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 text-sm flex h-full items-center justify-center py-4 text-center">Nessun evento imminente</div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </ProteggiPagina>
  );
}