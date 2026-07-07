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
  const [openSections, setOpenSections] = useState<string[]>(['tutti']);

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

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderAccordionHeader = (id: string, title: string, count: number) => {
    const isOpen = openSections.includes(id);
    return (
      <button 
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-4 transition-colors duration-200 cursor-pointer ${isOpen ? 'bg-zinc-800/80 border-b border-zinc-700/50' : 'bg-zinc-800/50 hover:bg-zinc-800/70'}`}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <span className="bg-[#c314f5]/20 text-[#e879f9] py-0.5 px-2 rounded-full text-xs font-semibold">
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

  const formattaData = (dataString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dataString).toLocaleDateString('it-IT', options);
  };

  const renderEventoListItem = (evento: any) => (
    <div
      key={evento.idEvento}
      onClick={() => setSelectedEvento(evento)}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Avatar Placeholder */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-inner">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Info Evento */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 truncate group-hover:text-emerald-400 transition-colors">
            {evento.titolo}
          </h2>
          <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
            <span>{evento.citta?.nome || "Città N/D"}</span>
            {evento.distanceKm !== undefined && evento.distanceKm !== null && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                <span>{evento.distanceKm} km</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
            <span className="text-zinc-500">{new Date(evento.data).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Azioni rapide */}
      <div className="flex-shrink-0 mt-2 sm:mt-0 flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/80 rounded-md border border-zinc-700 text-xs text-zinc-300 font-medium">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
          {evento._count?.partecipanti || 0}
        </div>
        <button 
          onClick={(e) => partecipa(evento.idEvento, e)}
          className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg border border-zinc-600 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
        >
          Partecipa
        </button>
      </div>
    </div>
  );

  const mieiEventi = eventi.filter(e => e.creatori?.some((c: any) => c.idUtente === utente?.idUtente));

  return (
    <ProteggiPagina>
      <main className="max-w-4xl mx-auto py-10 px-4 md:px-8 min-h-screen text-slate-100">
        
        {/* Header Principale */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Bacheca Eventi
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Esplora, organizza e partecipa agli incontri musicali.
            </p>
          </div>
          
          {!selectedEvento && (
            <button 
              onClick={() => router.push("/eventi/crea")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white text-sm font-semibold rounded-lg shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
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
          )}
        </div>

        {/* Contenuto Dinamico: Vista Elenco vs Vista Dettaglio */}
        <div className="border border-zinc-800 rounded-2xl shadow-sm bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
          
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : selectedEvento ? (
            
            /* === VISTA DETTAGLIO EVENTO === */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Header Dettaglio */}
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                <button 
                  onClick={() => setSelectedEvento(null)}
                  className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-medium w-fit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Torna alla Bacheca
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        Evento
                      </span>
                      <span className="bg-zinc-800 text-zinc-300 text-xs font-medium px-2.5 py-1 rounded-full border border-zinc-700 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {selectedEvento.citta?.nome || "Città N/D"}
                        {selectedEvento.distanceKm !== undefined && selectedEvento.distanceKm !== null && ` (${selectedEvento.distanceKm} km)`}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                      {selectedEvento.titolo}
                    </h2>
                    <p className="text-zinc-400 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formattaData(selectedEvento.data)}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => partecipa(selectedEvento.idEvento)}
                      className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg"
                    >
                      Partecipa Ora
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                    <p className="text-center text-xs text-zinc-500 mt-3 font-medium">
                      {selectedEvento._count?.partecipanti || 0} utenti iscritti
                    </p>
                  </div>
                </div>
              </div>

              {/* Corpo Dettaglio */}
              <div className="p-6 md:p-8 bg-zinc-950">
                <h3 className="text-lg font-bold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">
                  Informazioni sull'evento
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEvento.descrizione || "Nessuna descrizione fornita dall'organizzatore."}
                  </p>
                </div>
              </div>
            </div>

          ) : (
            
            /* === VISTA ELENCO COLLASSATO (ACCORDION) === */
            <div className="flex flex-col">
              
              {/* Accordion: I Miei Eventi */}
              <div className="border-b border-zinc-800 bg-zinc-900/20">
                {renderAccordionHeader('imiei', 'I Miei Eventi', mieiEventi.length)}
                {openSections.includes('imiei') && (
                  <div className="p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {mieiEventi.length === 0 ? (
                      <div className="py-6 text-center text-sm text-zinc-500">
                        Non hai ancora organizzato nessun evento.
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {mieiEventi.map(renderEventoListItem)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion: Tutti gli eventi */}
              <div className="bg-zinc-900/20">
                {renderAccordionHeader('tutti', 'Tutti gli Eventi', eventi.length)}
                {openSections.includes('tutti') && (
                  <div className="p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {eventi.length === 0 ? (
                      <div className="py-12 flex flex-col items-center text-center">
                        <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-zinc-400 font-medium">Nessun evento disponibile.</p>
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
          )}
        </div>
      </main>
    </ProteggiPagina>
  );
}