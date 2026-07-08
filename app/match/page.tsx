"use client";

import { useEffect, useState, useRef } from "react";
import ProteggiPagina from "../components/ProteggiPagina";

export default function MatchMasterDetailPage() {
  const [utente, setUtente] = useState<any>(null);
  
  // Stati dei Match
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
  
  // Stato Chat (Master-Detail)
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  
  // Stati dei Messaggi
  const [messaggi, setMessaggi] = useState<any[]>([]);
  const [nuovoMessaggio, setNuovoMessaggio] = useState("");
  const [loadingMessaggi, setLoadingMessaggi] = useState<boolean>(false);
  
  const messaggiEndRef = useRef<HTMLDivElement>(null);

  // Inizializzazione utente
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  // Caricamento lista dei Match
  useEffect(() => {
    if (!utente) return;

    async function caricaMatch() {
      setLoadingMatches(true);
      try {
        const response = await fetch(`/api/match?idUtente=${utente.idUtente}`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        }
      } catch (e) {
        console.error("Errore nel caricamento dei match:", e);
      } finally {
        setLoadingMatches(false);
      }
    }

    caricaMatch();
  }, [utente]);

  // Caricamento ed aggiornamento messaggi della chat selezionata
  const caricaMessaggi = async () => {
    if (!selectedMatch) return;
    try {
      const response = await fetch(`/api/messaggi?idMatch=${selectedMatch.idMatch}`);
      if (response.ok) {
        const data = await response.json();
        setMessaggi(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!selectedMatch) {
      setMessaggi([]);
      return;
    }
    
    setLoadingMessaggi(true);
    caricaMessaggi().then(() => setLoadingMessaggi(false));

    // Polling ogni 3 secondi per aggiornare la chat attiva
    const interval = setInterval(caricaMessaggi, 3000);
    return () => clearInterval(interval);
  }, [selectedMatch]);

  // Auto-scroll all'ultimo messaggio
  useEffect(() => {
    messaggiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messaggi]);

  // Gestione Invio Messaggio
  async function inviaMessaggio() {
    if (nuovoMessaggio.trim() === "" || !utente || !selectedMatch) return;

    try {
      await fetch("/api/messaggi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenuto: nuovoMessaggio,
          idMatch: Number(selectedMatch.idMatch),
          idUtenteMittente: utente.idUtente
        })
      });
      setNuovoMessaggio("");
      caricaMessaggi();
    } catch (error) {
      console.error("Errore invio messaggio", error);
    }
  }

  // Gestione Annulla Match
  async function annullaMatch() {
    if (!selectedMatch) return;
    if (confirm("Sei sicuro di voler annullare questo match? Questa operazione cancellerà anche l'intera chat in modo irreversibile.")) {
      try {
        const res = await fetch(`/api/match/${selectedMatch.idMatch}`, { method: "DELETE" });
        if (res.ok) {
          setMatches((prev) => prev.filter(m => m.idMatch !== selectedMatch.idMatch));
          setSelectedMatch(null);
        } else {
          alert("Errore nell'annullamento del match");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  // Permette invio con tasto Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inviaMessaggio();
    }
  };

  return (
    <ProteggiPagina>
      {/* Contenitore a tutto schermo meno l'header, se desiderato. 
          Usiamo h-[calc(100vh-80px)] per simulare l'app nativa */}
      <main className="w-full h-screen md:h-screen md:p-4 bg-zinc-950 flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden text-slate-100">
        
        {/* === COLONNA SINISTRA: Lista Match === */}
        {/* Mostrato sempre su Desktop (md:flex). Su mobile, nascosto se c'è un match selezionato. */}
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full flex flex-col bg-zinc-950 md:bg-zinc-900/40 md:border md:border-zinc-800 md:rounded-2xl overflow-hidden ${selectedMatch ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header Lista */}
          <div className="p-4 md:p-6 border-b border-zinc-800 bg-zinc-950 md:bg-transparent shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent mb-1">
              Match
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm">
              I tuoi contatti musicali
            </p>
          </div>

          {/* Elenco Match Scrollabile */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4">
            {loadingMatches ? (
              <div className="py-10 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0ea5e9]"></div>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3 text-zinc-400 border border-zinc-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">Nessun match</h3>
                <p className="text-zinc-500 text-xs mt-1">Inizia ad esplorare i musicisti per trovare la tua band.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {matches.map((match) => {
                  const altroUtente = match.idUtenteOrigina === utente.idUtente
                    ? match.utenteOttiene
                    : match.utenteOrigina;
                  
                  const isSelected = selectedMatch?.idMatch === match.idMatch;

                  return (
                    <button
                      key={match.idMatch}
                      onClick={() => setSelectedMatch(match)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-zinc-800/80 border-[#0ea5e9]/50 shadow-md"
                          : "bg-transparent border-transparent hover:bg-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      {/* Avatar Piccolo */}
                      <div className="w-12 h-12 rounded-full border border-zinc-700 overflow-hidden bg-gradient-to-tr from-[#22d3ee] to-[#0ea5e9] flex items-center justify-center flex-shrink-0 shadow-inner">
                        {altroUtente.immagineProfilo ? (
                          <img src={altroUtente.immagineProfilo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg uppercase">
                            {altroUtente.username.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      {/* Info compatte */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h2 className={`text-sm font-bold truncate ${isSelected ? 'text-[#0ea5e9]' : 'text-zinc-100'}`}>
                            {altroUtente.username}
                          </h2>
                          {altroUtente.livelloEsperienza && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                              {altroUtente.livelloEsperienza}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">
                          {altroUtente.bio || "Inizia la conversazione..."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>


        {/* === COLONNA DESTRA: Area Chat === */}
        {/* Mostrato sempre su Desktop (md:flex). Su mobile, mostrato solo se c'è un match selezionato. */}
        <div className={`flex-1 h-full flex flex-col bg-zinc-950 md:bg-zinc-900/20 md:border md:border-zinc-800 md:rounded-2xl overflow-hidden relative ${!selectedMatch ? 'hidden md:flex' : 'flex'}`}>
          
          {!selectedMatch ? (
            // Empty State (visibile solo su Desktop se nulla è selezionato)
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-4 border border-zinc-800">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-300">I tuoi messaggi</h3>
              <p className="text-zinc-500 mt-2 text-sm max-w-xs">
                Seleziona una chat dalla lista a sinistra per visualizzare la conversazione o inviare un nuovo messaggio.
              </p>
            </div>
          ) : (
            // Chat Attiva
            <>
              {/* Header Chat */}
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {/* Tasto indietro (Mobile Only) */}
                  <button 
                    onClick={() => setSelectedMatch(null)}
                    className="md:hidden p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  
                  {/* Info Utente Selezionato */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-zinc-700 overflow-hidden bg-gradient-to-tr from-[#22d3ee] to-[#0ea5e9] flex items-center justify-center flex-shrink-0 shadow-inner">
                      { (selectedMatch.idUtenteOrigina === utente.idUtente ? selectedMatch.utenteOttiene : selectedMatch.utenteOrigina).immagineProfilo ? (
                          <img src={(selectedMatch.idUtenteOrigina === utente.idUtente ? selectedMatch.utenteOttiene : selectedMatch.utenteOrigina).immagineProfilo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-sm uppercase">
                            {(selectedMatch.idUtenteOrigina === utente.idUtente ? selectedMatch.utenteOttiene : selectedMatch.utenteOrigina).username.charAt(0)}
                          </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm md:text-base font-bold text-white">
                        {(selectedMatch.idUtenteOrigina === utente.idUtente ? selectedMatch.utenteOttiene : selectedMatch.utenteOrigina).username}
                      </h2>
                      <span className="text-[10px] text-[#0ea5e9] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse"></span>
                        Match Attivo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opzioni / Annulla Match */}
                <button 
                  onClick={annullaMatch}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-red-400 bg-red-950/30 hover:bg-red-950/80 border border-red-900/50 rounded-lg transition-all cursor-pointer"
                >
                  Annulla Match
                </button>
              </div>

              {/* Area Messaggi Scrollabile */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-zinc-950 md:bg-transparent">
                {loadingMessaggi && messaggi.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-500"></div>
                  </div>
                ) : messaggi.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
                    <span className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
                      Invia un messaggio per iniziare!
                    </span>
                  </div>
                ) : (
                  messaggi.map((msg) => {
                    const isMe = msg.mittente?.idUtente === utente.idUtente;
                    return (
                      <div key={msg.idMessaggio} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe 
                            ? 'bg-gradient-to-br from-[#22d3ee] to-[#0ea5e9] text-white rounded-br-sm shadow-md' 
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="break-words leading-relaxed">{msg.contenuto}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Ancora invisibile per l'auto-scroll */}
                <div ref={messaggiEndRef} />
              </div>

              {/* Input Area Fissa in basso */}
              <div className="p-3 md:p-4 bg-zinc-900/80 backdrop-blur-md border-t border-zinc-800 shrink-0 mb-safe">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={nuovoMessaggio}
                    onChange={(e) => setNuovoMessaggio(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrivi un messaggio..."
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-full pl-5 pr-12 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all text-sm shadow-inner"
                  />
                  <button
                    onClick={inviaMessaggio}
                    disabled={!nuovoMessaggio.trim()}
                    className={`absolute right-2 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                      nuovoMessaggio.trim() 
                        ? 'bg-[#0ea5e9] text-white hover:scale-105 active:scale-95 shadow-lg shadow-[#0ea5e9]/30' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </ProteggiPagina>
  );
}