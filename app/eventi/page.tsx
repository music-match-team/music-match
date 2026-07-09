"use client";

import { useEffect, useState } from "react";
import ProteggiPagina from "../components/ProteggiPagina";
import { useRouter } from "next/navigation";

export default function EventiPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);
  const [eventi, setEventi] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const [isGestioneMode, setIsGestioneMode] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<string[]>(['imiei']);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, []);

  useEffect(() => {
    async function caricaEventi() {
      setLoading(true);
      try {
        let url = "/api/eventi";
        if (utente && utente.idUtente) {
          url += `?idUtente=${utente.idUtente}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          console.error("Errore API /eventi:", response.status);
          return;
        }
        const data = await response.json();
        setEventi(data);
      } catch (error) {
        console.error("Errore di rete o parsing:", error);
      } finally {
        setLoading(false);
      }
    }

    if (utente !== null) {
      caricaEventi();
    }
  }, [utente]);

  async function partecipa(idEvento: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      const response = await fetch("/api/partecipa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUtente: utente.idUtente,
          idEvento
        })
      });
      
      if (response.ok) {
        setEventi(prev => prev.map(ev => 
          ev.idEvento === idEvento 
            ? { ...ev, _count: { ...ev._count, partecipanti: (ev._count?.partecipanti || 0) + 1 } }
            : ev
        ));
        if (selectedEvento && selectedEvento.idEvento === idEvento) {
          setSelectedEvento((prev: any) => ({ ...prev, _count: { ...prev._count, partecipanti: (prev._count?.partecipanti || 0) + 1 } }));
        }
        alert("Partecipazione registrata con successo!");
      } else {
        alert("Errore durante la registrazione. Potresti essere già partecipante.");
      }
    } catch (error) {
      console.error(error);
      alert("Errore di rete durante la registrazione");
    }
  }

  async function eliminaEvento(idEvento: number) {
    if (!confirm("Sei sicuro di voler eliminare questo evento?")) return;
    
    try {
      const response = await fetch(`/api/eventi/${idEvento}?idUtente=${utente.idUtente}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setEventi(prev => prev.filter(ev => ev.idEvento !== idEvento));
        setSelectedEvento(null);
        alert("Evento eliminato con successo.");
      } else {
        const data = await response.json();
        alert(data.error || "Errore durante l'eliminazione.");
      }
    } catch (error) {
      console.error(error);
      alert("Errore di rete durante l'eliminazione.");
    }
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formattaData = (dataString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dataString).toLocaleDateString('it-IT', options);
  };

  const renderEventoListItem = (evento: any) => (
    <div
      key={evento.idEvento}
      onClick={() => setSelectedEvento(evento)}
      className="group bg-zinc-900/60 border border-zinc-800 hover:border-[#0ea5e9]/50 rounded-2xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#0ea5e9]/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
      
      <div className="flex items-center gap-5 relative z-10">
        {/* Locandina in miniatura o Avatar Placeholder */}
        {evento.locandina ? (
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-inner border border-zinc-700">
            <img src={evento.locandina} alt={evento.titolo} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#22d3ee] to-[#0ea5e9] flex items-center justify-center flex-shrink-0 shadow-inner">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Info Evento */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 truncate group-hover:text-[#22d3ee] transition-colors">
            {evento.titolo}
          </h2>
          <div className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {evento.citta?.nome || "Città N/D"}
            </span>
            {evento.distanceKm !== undefined && evento.distanceKm !== null && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                <span>{evento.distanceKm} km</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-zinc-600 hidden sm:block"></span>
            <span className="text-zinc-400 hidden sm:flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(evento.data).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Azioni rapide */}
      <div className="flex-shrink-0 mt-3 sm:mt-0 flex items-center gap-3 relative z-10 w-full sm:w-auto justify-between sm:justify-end">
        <span className="text-zinc-400 sm:hidden flex items-center gap-1 text-sm">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {new Date(evento.data).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 rounded-lg border border-zinc-800 text-sm text-zinc-300 font-medium shadow-inner">
            <svg className="w-4 h-4 text-[#22d3ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            {evento._count?.partecipanti || 0}
          </div>
          <button 
            onClick={(e) => partecipa(evento.idEvento, e)}
            className="px-4 py-2 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] hover:opacity-90 text-white text-sm font-bold rounded-lg shadow-md shadow-[#0ea5e9]/20 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            Partecipa
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccordionHeader = (id: string, title: string, count: number) => {
    const isOpen = openSections.includes(id);
    return (
      <button 
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-5 transition-colors duration-200 cursor-pointer ${isOpen ? 'bg-zinc-800/60 border-b border-zinc-700/50' : 'bg-zinc-900/60 hover:bg-zinc-800/50 rounded-2xl border border-zinc-800 mb-2'}`}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <span className="bg-[#0ea5e9]/20 text-[#22d3ee] py-1 px-3 rounded-full text-xs font-bold border border-[#0ea5e9]/30">
            {count}
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  };

  const mieiEventiOrg = eventi.filter(e => e.creatori?.some((c: any) => c.idUtente === utente?.idUtente));

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
                {isGestioneMode ? "Gestione Eventi" : "Bacheca Eventi"}
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl font-medium">
                {isGestioneMode ? "Organizza e gestisci le tue jam." : "Esplora e partecipa agli incontri musicali."}
              </p>
            </div>
            
            {!selectedEvento && (
              <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
                <button 
                  onClick={() => setIsGestioneMode(!isGestioneMode)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-zinc-700 rounded-lg text-sm font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  {isGestioneMode ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      Torna alla Bacheca
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#22d3ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Gestione Tuoi Eventi
                    </>
                  )}
                </button>
                <button 
                  onClick={() => router.push("/eventi/crea")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] hover:opacity-90 text-white text-sm font-bold rounded-lg shadow-md shadow-[#0ea5e9]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="12" y1="14" x2="12" y2="18"/>
                    <line x1="10" y1="16" x2="14" y2="16"/>
                  </svg>
                  Nuovo Evento
                </button>
              </div>
            )}
          </div>

          {/* Contenuto Dinamico: Bacheca / Gestione / Dettaglio */}
          <div>
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#22d3ee]"></div>
              </div>
            ) : selectedEvento ? (
              
              /* === VISTA DETTAGLIO EVENTO === */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 border border-zinc-800 rounded-3xl shadow-xl bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
                
                {/* Locandina Header */}
                {selectedEvento.locandina && (
                  <div className="w-full h-48 md:h-80 bg-zinc-900 border-b border-zinc-800 relative group">
                    <img src={selectedEvento.locandina} alt="Locandina Evento" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                  </div>
                )}

                {/* Informazioni Dettaglio */}
                <div className="p-6 md:p-10 relative z-10">
                  <button 
                    onClick={() => setSelectedEvento(null)}
                    className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-bold w-fit bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    {isGestioneMode ? "Torna alla Gestione" : "Torna alla Bacheca"}
                  </button>

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-[#22d3ee]/20 text-[#22d3ee] text-xs font-bold px-3 py-1.5 rounded-full border border-[#22d3ee]/30 uppercase tracking-wider">
                          Evento
                        </span>
                        <span className="bg-zinc-900 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {selectedEvento.citta?.nome || "Città N/D"}
                          {selectedEvento.distanceKm !== undefined && selectedEvento.distanceKm !== null && ` (${selectedEvento.distanceKm} km)`}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        {selectedEvento.titolo}
                      </h2>
                      <p className="text-zinc-300 font-medium flex items-center gap-2 bg-zinc-950 w-fit px-4 py-2 rounded-lg border border-zinc-800">
                        <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {formattaData(selectedEvento.data)}
                      </p>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-4 text-zinc-300">
                        <svg className="w-6 h-6 text-[#22d3ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                        <span className="text-2xl font-bold text-white">{selectedEvento._count?.partecipanti || 0}</span>
                        <span className="font-medium">iscritti</span>
                      </div>
                      
                      {selectedEvento.creatori?.some((c: any) => c.idUtente === utente?.idUtente) ? (
                        <div className="w-full flex flex-col gap-3">
                          <button 
                            onClick={() => router.push(`/eventi/crea?id=${selectedEvento.idEvento}`)}
                            className="w-full px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg"
                          >
                            ✏️ Modifica
                          </button>
                          <button 
                            onClick={() => eliminaEvento(selectedEvento.idEvento)}
                            className="w-full px-8 py-3.5 bg-red-900/50 hover:bg-red-900/80 text-red-200 font-bold rounded-xl border border-red-800 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg"
                          >
                            🗑️ Elimina
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => partecipa(selectedEvento.idEvento)}
                          className="w-full px-8 py-3.5 bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-[#0ea5e9]/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg"
                        >
                          Partecipa Ora
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-zinc-800">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Informazioni sull'evento
                    </h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">
                        {selectedEvento.descrizione || "Nessuna descrizione fornita dall'organizzatore."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            ) : isGestioneMode ? (

              /* === VISTA GESTIONE MIEI EVENTI (COLLASSATI) === */
              <div className="flex flex-col animate-in fade-in duration-300 gap-4">
                
                {/* Accordion: I Miei Eventi Organizzati */}
                <div className={`${openSections.includes('imiei') ? 'bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden' : ''}`}>
                  {renderAccordionHeader('imiei', 'Eventi Organizzati da Me', mieiEventiOrg.length)}
                  {openSections.includes('imiei') && (
                    <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {mieiEventiOrg.length === 0 ? (
                        <div className="py-8 bg-zinc-950/50 rounded-2xl border border-zinc-800 text-center text-zinc-400">
                          Non hai ancora organizzato nessun evento.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {mieiEventiOrg.map(renderEventoListItem)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Accordion: Eventi a cui partecipo */}
                <div className={`${openSections.includes('partecipo') ? 'bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden' : ''}`}>
                  {renderAccordionHeader('partecipo', 'Eventi a cui Partecipo', 0)}
                  {openSections.includes('partecipo') && (
                    <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="py-8 bg-zinc-950/50 rounded-2xl border border-zinc-800 text-center text-zinc-400">
                        Funzionalità in arrivo.
                      </div>
                    </div>
                  )}
                </div>

              </div>

            ) : (
              
              /* === VISTA BACHECA PRINCIPALE (ELENCO) === */
              <div className="flex flex-col animate-in fade-in duration-300">
                {eventi.length === 0 ? (
                  <div className="py-20 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col items-center text-center">
                    <svg className="w-16 h-16 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-zinc-400 font-medium text-lg">Nessun evento disponibile al momento.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {eventi.map(renderEventoListItem)}
                  </div>
                )}
              </div>
              
            )}
          </div>
        </div>
      </div>
    </ProteggiPagina>
  );
}