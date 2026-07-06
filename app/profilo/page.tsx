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
    if (selected && selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
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
          tipo: "immagine",
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

  return (
    <ProteggiPagina>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-6 mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 columns: Profile form details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Dati Personali */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Dati Personali
                </h2>
                
                <div className="space-y-4">
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
                        className="w-full px-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                      <div className="mt-2.5 flex items-center gap-2 text-xs text-violet-400 bg-violet-950/30 border border-violet-900/50 py-1.5 px-3 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
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
                      className="w-full px-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none cursor-pointer"
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
                </div>
              </div>

              {/* Card 2: Preferenze Musicali (Strumenti e Generi) */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Strumenti
                  </h2>
                  <p className="text-xs text-zinc-400 mb-4">Seleziona gli strumenti che suoni (puoi selezionarne più di uno).</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {strumenti.map((strumento) => {
                      const selected = strumentiSelezionati.includes(strumento.idStrumento);
                      return (
                        <button
                          key={strumento.idStrumento}
                          type="button"
                          onClick={() => toggleStrumento(strumento.idStrumento)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            selected
                              ? "bg-violet-600/90 border-violet-500 text-white shadow-md shadow-violet-600/20"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 hover:text-white"
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

                <div className="border-t border-zinc-850 pt-6">
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                    Generi Musicali
                  </h2>
                  <p className="text-xs text-zinc-400 mb-4">Seleziona i tuoi generi preferiti (puoi selezionarne più di uno).</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {generi.map((genere) => {
                      const selected = generiSelezionati.includes(genere.idGenere);
                      return (
                        <button
                          key={genere.idGenere}
                          type="button"
                          onClick={() => toggleGenere(genere.idGenere)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            selected
                              ? "bg-violet-600/90 border-violet-500 text-white shadow-md shadow-violet-600/20"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 hover:text-white"
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
              </div>

              {/* Salva Profilo button card */}
              <div className="flex justify-end">
                <button
                  onClick={salvaProfilo}
                  className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Salva Profilo
                </button>
              </div>
            </div>

            {/* Right column: Media Upload & Gallery */}
            <div className="space-y-6">
              
              {/* Form Caricamento Media */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Carica Nuovo Media
                </h2>

                <div className="space-y-4">
                  {/* Area File selector */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                      File Immagine
                    </label>
                    <div className="relative group border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-lg p-4 transition-all bg-zinc-800/30 text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <svg className="w-8 h-8 text-zinc-500 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-medium text-zinc-355 text-zinc-300">
                          {file ? file.name : "Scegli un file o trascinalo qui"}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          PNG, JPG, GIF fino a 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview dell'immagine se presente */}
                  {filePreview && (
                    <div className="relative rounded-lg overflow-hidden border border-zinc-700/60 max-h-48 flex items-center justify-center bg-zinc-950">
                      <img
                        src={filePreview}
                        alt="Anteprima"
                        className="max-h-48 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-650 bg-red-650/90 text-white rounded-full hover:bg-red-750 transition-colors shadow-lg cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Descrizione */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                      Descrizione
                    </label>
                    <input
                      type="text"
                      placeholder="Inserisci una descrizione..."
                      value={descrizione}
                      onChange={(e) => setDescrizione(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-800/70 border border-zinc-700 rounded-lg text-white placeholder-zinc-555 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Tasto Carica */}
                  <button
                    type="button"
                    onClick={upload}
                    disabled={caricamentoMedia || !file}
                    className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                      !file
                        ? "bg-zinc-800/50 text-zinc-500 border border-zinc-800/80 cursor-not-allowed"
                        : "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-600/10 hover:shadow-violet-600/20 active:scale-[0.99]"
                    }`}
                  >
                    {caricamentoMedia ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Caricamento...
                      </>
                    ) : (
                      "Carica Media"
                    )}
                  </button>
                </div>
              </div>

              {/* Galleria Media */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  I miei Media
                </h2>

                {media.length === 0 ? (
                  <div className="text-center py-8 text-zinc-550 text-zinc-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-zinc-650 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-xs">Nessun media caricato.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {media.map((m) => (
                      <div
                        key={m.idMedia}
                        className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/70 shadow-lg hover:border-zinc-700 hover:shadow-xl transition-all"
                      >
                        <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-black/40">
                          <img
                            src={m.source}
                            alt={m.descrizione || "Media"}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          {/* overlay con bottone per eliminare */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => eliminaMedia(m.idMedia)}
                                className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-750 transition-colors shadow-lg cursor-pointer"
                                title="Elimina media"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            {m.descrizione && (
                              <p className="text-[11px] text-white line-clamp-2 bg-zinc-900/80 p-2 rounded border border-zinc-800 backdrop-blur-xs">
                                {m.descrizione}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* fallback mobile description in case no hover */}
                        {m.descrizione && (
                          <div className="p-2.5 border-t border-zinc-900 bg-zinc-900/30 group-hover:hidden block">
                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                              {m.descrizione}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </ProteggiPagina>
  );
}