"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
	
  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(
      localStorage.getItem("utente") || "null"
    );
    setUtente(u);
  }, []);
  
  const [strumenti, setStrumenti] = useState<Strumento[]>([]);
  const [generi, setGeneri] = useState<Genere[]>([]);

  const [bio, setBio] = useState("");
  const [livelloEsperienza, setLivelloEsperienza] = useState("Principiante");

  const [strumentiSelezionati, setStrumentiSelezionati] = useState<number[]>([]);
  const [generiSelezionati, setGeneriSelezionati] = useState<number[]>([]);

  const [messaggio, setMessaggio] = useState("");

  const [ricercaCitta, setRicercaCitta] = useState("");
  const [risultatiCitta, setRisultatiCitta] = useState<any[]>([]);
  const [cittaSelezionata, setCittaSelezionata] = useState<any>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);

  // Stati relativi ai media
  const [media, setMedia] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [descrizione, setDescrizione] = useState("");
  const [caricamentoMedia, setCaricamentoMedia] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState<string[]>(['dati']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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

  useEffect(() => {
    async function caricaDati() {
      try {
        const rispostaStrumenti = await fetch("/api/strumenti");
        const datiStrumenti = await rispostaStrumenti.json();
        setStrumenti(datiStrumenti);

        const rispostaGeneri = await fetch("/api/generi");
        const datiGeneri = await rispostaGeneri.json();
        setGeneri(datiGeneri);
      } catch (error) {
        console.error(error);
      }
    }

    caricaDati();
  }, []);

  useEffect(() => {
    if (!utente) return;
    async function caricaProfilo() {
      try {
        const response = await fetch(`/api/profilo?idUtente=${utente.idUtente}`, {
          cache: "no-store"
        });
        if (response.ok) {
          const data = await response.json();
          if (data.bio !== null && data.bio !== undefined) setBio(data.bio);
          if (data.livelloEsperienza) setLivelloEsperienza(data.livelloEsperienza);
          if (data.lat !== null && data.lat !== undefined) setLat(data.lat);
          if (data.long !== null && data.long !== undefined) setLong(data.long);
          if (data.citta) setCittaSelezionata(data.citta);
          if (data.strumenti) setStrumentiSelezionati(data.strumenti);
          if (data.generi) setGeneriSelezionati(data.generi);
        }
      } catch (e) {
        console.error("Errore nel caricamento del profilo:", e);
      }
    }
    async function caricaMedia() {
      try {
        const response = await fetch(`/api/media?idUtente=${utente.idUtente}`);
        if (response.ok) {
          const data = await response.json();
          setMedia(data);
        }
      } catch (e) {
        console.error("Errore nel caricamento dei media:", e);
      }
    }
    caricaProfilo();
    caricaMedia();
  }, [utente]);

  function toggleStrumento(id: number) {
    if (strumentiSelezionati.includes(id)) {
      setStrumentiSelezionati(
        strumentiSelezionati.filter((s) => s !== id)
      );
    } else {
      setStrumentiSelezionati([...strumentiSelezionati, id]);
    }
  }

  function toggleGenere(id: number) {
    if (generiSelezionati.includes(id)) {
      setGeneriSelezionati(
        generiSelezionati.filter((g) => g !== id)
      );
    } else {
      setGeneriSelezionati([...generiSelezionati, id]);
    }
  }

  async function salvaProfilo() {
    try {
      const response = await fetch("/api/profilo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idUtente: utente.idUtente, 
          bio,
          livelloEsperienza,
          strumenti: strumentiSelezionati,
          generi: generiSelezionati,
          lat,
          long,
          citta: cittaSelezionata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessaggio(data.error || "Errore durante il salvataggio");
        return;
      }

      setMessaggio(data.message || "Profilo salvato");
      setTimeout(() => setMessaggio(""), 4000);
    } catch (error) {
      console.error(error);
      setMessaggio("Errore durante il salvataggio");
      setTimeout(() => setMessaggio(""), 4000);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected && (selected.type.startsWith("image/") || selected.type.startsWith("audio/") || selected.type.startsWith("video/"))) {
      const url = URL.createObjectURL(selected);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  async function upload() {
    if (!utente) {
      alert("Effettua il login");
      return;
    }

    if (!file) {
      alert("Seleziona un file da caricare");
      return;
    }

    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    
    if (!isAudio && !isVideo && !isImage) {
      alert("Formato file non supportato");
      return;
    }

    const numAudio = media.filter((m) => m.tipo === "audio").length;
    const numVideo = media.filter((m) => m.tipo === "video").length;
    const numFoto = media.filter((m) => m.tipo === "immagine").length;

    if (isAudio && numAudio >= 4) {
      alert("Puoi caricare un massimo di 4 file audio.");
      return;
    }

    if (isVideo && numVideo >= 2) {
      alert("Puoi caricare un massimo di 2 video.");
      return;
    }

    if (isImage && numFoto >= 4) {
      alert("Puoi caricare un massimo di 4 foto.");
      return;
    }

    setCaricamentoMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        alert(uploadData.error || "Errore upload");
        return;
      }

      const mediaResponse = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: uploadData.source,
          tipo: isAudio ? "audio" : isVideo ? "video" : "immagine",
          descrizione,
          idUtente: utente.idUtente,
        }),
      });

      if (mediaResponse.ok) {
        const nuovoMedia = await mediaResponse.json();
        setMedia((prev) => [nuovoMedia, ...prev]);
        setFile(null);
        setFilePreview(null);
        setDescrizione("");
        setMessaggio("Media caricato con successo!");
        setTimeout(() => setMessaggio(""), 4000);
      } else {
        alert("Errore nel salvataggio del media");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'upload");
    } finally {
      setCaricamentoMedia(false);
    }
  }

  async function eliminaMedia(idMedia: number) {
    if (!confirm("Sei sicuro di voler eliminare questo media?")) return;
    try {
      const response = await fetch(`/api/media?idMedia=${idMedia}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMedia((prev) => prev.filter((m) => m.idMedia !== idMedia));
        setMessaggio("Media eliminato con successo");
        setTimeout(() => setMessaggio(""), 4000);
      } else {
        const err = await response.json();
        alert(err.error || "Errore durante l'eliminazione");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'eliminazione");
    }
  }

  // Helper for rendering accordion header
  const renderAccordionHeader = (id: string, title: string, icon: React.ReactNode) => {
    const isOpen = openSections.includes(id);
    return (
      <button 
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-5 transition-colors duration-200 ${isOpen ? 'bg-zinc-800/80 border-b border-zinc-700/50' : 'bg-zinc-800/50 hover:bg-zinc-800/70'}`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-lg font-bold text-white">{title}</h2>
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

  return (
    <ProteggiPagina>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-6 mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#3b38f6] to-[#c314f5] bg-clip-text text-transparent sm:text-4xl">
                Il tuo Profilo
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Gestisci le tue informazioni personali, preferenze musicali e contenuti multimediali.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center px-4 py-2 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Vai alla Dashboard
              </button>
            </div>
          </div>

          {/* Status banner */}
          {messaggio && (
            <div className={`mb-6 p-4 rounded-lg border text-sm font-medium transition-all ${
              messaggio.toLowerCase().includes("errore")
                ? "bg-red-950/40 border-red-800/80 text-red-300"
                : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
            }`}>
              {messaggio}
            </div>
          )}

          {/* Accordion Container */}
          <div className="space-y-4">
            
            {/* Sezione 1: Modifica Bio e Info */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
              {renderAccordionHeader('dati', 'Modifica Bio e Info', (
                <svg className="w-5 h-5 text-[#c314f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ))}
              
              {openSections.includes('dati') && (
                <div className="p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Città */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                      Città (GeoNames)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cerca e seleziona la tua città..."
                        value={ricercaCitta}
                        onChange={(e) => setRicercaCitta(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c314f5] focus:border-transparent transition-all"
                      />
                      {risultatiCitta.length > 0 && (
                        <ul className="absolute z-20 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto divide-y divide-zinc-700/50">
                          {risultatiCitta.map((c: any) => (
                            <li
                              key={c.geonameId}
                              onClick={() => {
                                setLat(parseFloat(c.lat));
                                setLong(parseFloat(c.lng));
                                setCittaSelezionata(c.name);
                                setRicercaCitta("");
                                setRisultatiCitta([]);
                              }}
                              className="px-4 py-2.5 hover:bg-zinc-700/80 cursor-pointer text-sm text-zinc-200 transition-colors"
                            >
                              {c.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {cittaSelezionata && (
                      <div className="mt-2.5 flex items-center gap-2 text-xs text-[#c314f5] bg-[#c314f5]/10 border border-[#c314f5]/30 py-1.5 px-3 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c314f5] animate-pulse"></span>
                        <strong>Città selezionata:</strong> {cittaSelezionata}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                      Biografia
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Scrivi qualcosa su di te, il tuo stile, le tue passioni o la tua band..."
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c314f5] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Livello esperienza */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                      Livello di Esperienza
                    </label>
                    <div className="relative">
                      <select
                        value={livelloEsperienza}
                        onChange={(e) => setLivelloEsperienza(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#c314f5] transition-all appearance-none cursor-pointer"
                      >
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzato">Avanzato</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={salvaProfilo}
                      className="px-6 py-2 bg-gradient-to-r from-[#3b38f6] to-[#c314f5] hover:opacity-90 text-white rounded-lg font-bold shadow-lg shadow-[#c314f5]/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Salva Info
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sezione 2: Aggiorna Preferenze */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
              {renderAccordionHeader('preferenze', 'Aggiorna Preferenze', (
                <svg className="w-5 h-5 text-[#3b38f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              ))}
              
              {openSections.includes('preferenze') && (
                <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Strumenti */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">Strumenti Suonati</h3>
                    <div className="flex flex-wrap gap-2">
                      {strumenti.map((strumento) => {
                        const selected = strumentiSelezionati.includes(strumento.idStrumento);
                        return (
                          <button
                            key={strumento.idStrumento}
                            type="button"
                            onClick={() => toggleStrumento(strumento.idStrumento)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              selected
                                ? "bg-[#3b38f6]/90 border-[#3b38f6] text-white shadow-md shadow-[#3b38f6]/20"
                                : "bg-zinc-950 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                          >
                            {selected && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {strumento.nome}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generi */}
                  <div className="border-t border-zinc-800/50 pt-5">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">Generi Preferiti</h3>
                    <div className="flex flex-wrap gap-2">
                      {generi.map((genere) => {
                        const selected = generiSelezionati.includes(genere.idGenere);
                        return (
                          <button
                            key={genere.idGenere}
                            type="button"
                            onClick={() => toggleGenere(genere.idGenere)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              selected
                                ? "bg-[#c314f5]/90 border-[#c314f5] text-white shadow-md shadow-[#c314f5]/20"
                                : "bg-zinc-950 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                          >
                            {selected && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {genere.nome}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={salvaProfilo}
                      className="px-6 py-2 bg-gradient-to-r from-[#3b38f6] to-[#c314f5] hover:opacity-90 text-white rounded-lg font-bold shadow-lg shadow-[#c314f5]/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Salva Preferenze
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sezione 3: Gestione Media */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
              {renderAccordionHeader('media', 'Gestione File Media', (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              ))}
              
              {openSections.includes('media') && (
                <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-zinc-800/50">
                  
                  {/* Progress Bar Media */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-zinc-300">Spazio Archiviazione Media</h3>
                      <span className="text-xs font-medium text-[#c314f5]">{media.length}/10 File</span>
                    </div>
                    
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-3">
                      <div className="bg-gradient-to-r from-[#3b38f6] to-[#c314f5] h-2 rounded-full transition-all duration-500" style={{ width: `${(media.length / 10) * 100}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-zinc-400 font-medium">
                      <span className={media.filter((m) => m.tipo === "immagine").length >= 4 ? "text-emerald-400 font-bold" : ""}>
                        📸 {media.filter((m) => m.tipo === "immagine").length}/4
                      </span>
                      <span className={media.filter((m) => m.tipo === "audio").length >= 4 ? "text-emerald-400 font-bold" : ""}>
                        🎵 {media.filter((m) => m.tipo === "audio").length}/4
                      </span>
                      <span className={media.filter((m) => m.tipo === "video").length >= 2 ? "text-emerald-400 font-bold" : ""}>
                        🎥 {media.filter((m) => m.tipo === "video").length}/2
                      </span>
                    </div>
                  </div>

                  {/* Form Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Dropzone */}
                      <div>
                        <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Carica nuovo file</label>
                        <div className="relative group border-2 border-dashed border-zinc-700 hover:border-[#c314f5]/50 rounded-lg p-6 transition-all bg-zinc-950 text-center cursor-pointer">
                          <input type="file" accept="image/*,audio/*,video/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                            <svg className="w-8 h-8 text-zinc-500 group-hover:text-[#c314f5] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs font-medium text-zinc-300 text-center">{file ? file.name : "Trascina qui o clicca per caricare"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Descrizione e Submit */}
                      <div>
                        <input
                          type="text"
                          placeholder="Descrizione opzionale..."
                          value={descrizione}
                          onChange={(e) => setDescrizione(e.target.value)}
                          className="w-full px-4 py-2.5 mb-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c314f5] transition-all"
                        />
                        <button
                          type="button"
                          onClick={upload}
                          disabled={caricamentoMedia || !file}
                          className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                            !file
                              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#3b38f6] to-[#c314f5] text-white hover:opacity-90 active:scale-95"
                          }`}
                        >
                          {caricamentoMedia ? "Caricamento..." : "Carica File"}
                        </button>
                      </div>
                    </div>

                    {/* Anteprima e Gallery */}
                    <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 h-64 overflow-y-auto custom-scrollbar">
                      <h4 className="text-sm font-semibold text-zinc-400 mb-3 border-b border-zinc-800/50 pb-2">I Miei Media</h4>
                      
                      {/* File in anteprima */}
                      {filePreview && (
                        <div className="relative rounded-lg overflow-hidden border-2 border-[#c314f5]/50 bg-black mb-3">
                           {file?.type.startsWith("audio/") ? (
                            <div className="p-3"><audio src={filePreview} controls className="w-full" /></div>
                          ) : file?.type.startsWith("video/") ? (
                            <video src={filePreview} controls className="w-full h-32 object-contain" />
                          ) : (
                            <img src={filePreview} alt="Preview" className="w-full h-32 object-cover" />
                          )}
                          <div className="absolute top-1 right-1 bg-[#c314f5] text-xs font-bold px-2 py-0.5 rounded text-white shadow">In attesa</div>
                        </div>
                      )}

                      {/* Lista media caricati */}
                      {media.length === 0 && !filePreview ? (
                         <p className="text-xs text-zinc-500 text-center py-4">Nessun media presente</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {media.map((m) => (
                            <div key={m.idMedia} className="group relative rounded-lg overflow-hidden border border-zinc-700 bg-black/40 aspect-square">
                              {m.tipo === "audio" ? (
                                <div className="flex flex-col items-center justify-center h-full p-2 bg-zinc-900">
                                  <svg className="w-6 h-6 text-[#3b38f6] mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M9 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h6V3H9z" /></svg>
                                </div>
                              ) : m.tipo === "video" ? (
                                <video src={m.source} className="object-cover w-full h-full" />
                              ) : (
                                <img src={m.source} alt={m.descrizione || ""} className="object-cover w-full h-full" />
                              )}
                              
                              {/* Hover overlay per eliminare */}
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button onClick={() => eliminaMedia(m.idMedia)} className="p-2 bg-red-600 rounded-full hover:bg-red-700 text-white shadow-lg cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProteggiPagina>
  );
}