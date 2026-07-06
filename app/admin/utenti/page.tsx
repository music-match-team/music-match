"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

export default function GestioneUtentiPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [utenti, setUtenti] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);

  // Modals & Action Form state
  const [showSanzioneModal, setShowSanzioneModal] = useState(false);
  const [sanzioneTipo, setSanzioneTipo] = useState<"BAN" | "SOSPENSIONE">("SOSPENSIONE");
  const [sanzioneMotivo, setSanzioneMotivo] = useState("");
  const [sanzioneGiorni, setSanzioneGiorni] = useState("7");
  const [submittingSanzione, setSubmittingSanzione] = useState(false);

  const [messaggio, setMessaggio] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a) {
      router.push("/admin/login");
      return;
    }
    setAdmin(a);
    caricaUtenti();
  }, [router]);

  async function caricaUtenti() {
    try {
      setLoadingList(true);
      const res = await fetch("/api/admin/utenti");
      if (res.ok) {
        const data = await res.json();
        setUtenti(data);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore nel caricamento degli utenti", true);
    } finally {
      setLoadingList(false);
    }
  }

  async function caricaDettaglio(idUtente: number) {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/admin/utenti?idUtente=${idUtente}`);
      if (res.ok) {
        const data = await res.json();
        setUserDetail(data);
      } else {
        showMsg("Impossibile caricare i dettagli dell'utente", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore nel caricamento dei dettagli", true);
    } finally {
      setLoadingDetail(false);
    }
  }

  function selectUser(idUtente: number) {
    setSelectedUserId(idUtente);
    caricaDettaglio(idUtente);
  }

  function showMsg(msg: string, error = false) {
    setMessaggio(msg);
    setIsError(error);
    setTimeout(() => setMessaggio(""), 4000);
  }

  const filteredUtenti = utenti.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleEliminaMedia(idMedia: number) {
    if (!confirm("Sei sicuro di voler eliminare questo media?")) return;
    try {
      const res = await fetch("/api/admin/utenti", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idMedia }),
      });
      if (res.ok) {
        showMsg("Elemento media eliminato con successo");
        if (userDetail) {
          setUserDetail({
            ...userDetail,
            media: userDetail.media.filter((m: any) => m.idMedia !== idMedia),
          });
        }
        caricaUtenti();
      } else {
        showMsg("Impossibile eliminare il media", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete", true);
    }
  }

  async function handleEmettiSanzione(e: React.FormEvent) {
    e.preventDefault();
    if (!userDetail) return;
    if (!sanzioneMotivo.trim()) {
      showMsg("Inserisci il motivo", true);
      return;
    }
    if (sanzioneTipo === "SOSPENSIONE" && (!sanzioneGiorni || parseInt(sanzioneGiorni) <= 0)) {
      showMsg("Giorni di sospensione non validi", true);
      return;
    }

    setSubmittingSanzione(true);
    try {
      const res = await fetch("/api/admin/sanzioni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-id": admin.idAdmin.toString(),
        },
        body: JSON.stringify({
          idUtente: userDetail.idUtente,
          tipo: sanzioneTipo,
          motivo: sanzioneMotivo,
          giorniSospensione: sanzioneTipo === "SOSPENSIONE" ? parseInt(sanzioneGiorni) : undefined,
        }),
      });

      if (res.ok) {
        showMsg("Sanzione applicata correttamente");
        setShowSanzioneModal(false);
        setSanzioneMotivo("");
        setSanzioneGiorni("7");
        caricaDettaglio(userDetail.idUtente);
        caricaUtenti();
      } else {
        const errData = await res.json();
        showMsg(errData.error || "Errore durante l'emissione della sanzione", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete", true);
    } finally {
      setSubmittingSanzione(false);
    }
  }

  function checkSanzioneAttiva(sanzioniList: any[]) {
    if (!sanzioniList) return null;
    const active = sanzioniList.find((s: any) => {
      if (s.tipo === "BAN") return true;
      if (s.tipo === "SOSPENSIONE") {
        return !s.dataFine || new Date(s.dataFine) > new Date();
      }
      return false;
    });
    return active || null;
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex relative">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 min-w-0">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestione Utenti</h1>
            <p className="text-zinc-400 text-sm mt-1">Cerca utenti, visualizza i loro profili, gestisci i media ed emetti sanzioni.</p>
          </div>
        </div>

        {messaggio && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border ${
            isError ? "bg-red-950/40 border-red-800/80 text-red-300" : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
          }`}>
            {messaggio}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Colonna Sinistra: Elenco Utenti */}
          <div className={`lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col h-[700px] overflow-hidden ${selectedUserId !== null ? "hidden lg:flex" : "flex"}`}>
            {/* Search bar */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
              <input
                type="text"
                placeholder="Cerca per username o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
              {loadingList ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-zinc-800/30 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredUtenti.length === 0 ? (
                <p className="text-zinc-500 text-sm py-10 text-center">Nessun utente trovato.</p>
              ) : (
                filteredUtenti.map((u: any) => {
                  const isSelected = selectedUserId === u.idUtente;
                  return (
                    <button
                      key={u.idUtente}
                      onClick={() => selectUser(u.idUtente)}
                      className={`w-full text-left px-5 py-4 transition-all cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? "bg-violet-600/10 border-l-2 border-l-violet-500"
                          : "hover:bg-zinc-800/40 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-200 truncate">{u.username}</p>
                          {u._count.sanzioni > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-950/40 border border-amber-900/40 text-amber-400 text-[9px] font-bold rounded-full">
                              Sanzionato
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{u.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-zinc-500 block">
                          Città: {u.citta || "N/D"}
                        </span>
                        <span className="text-[9px] text-zinc-600 block mt-0.5">
                          Media: {u._count.media}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Colonna Destra: Dettagli Utente */}
          <div className={`lg:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[700px] overflow-y-auto ${selectedUserId === null ? "hidden lg:flex" : "flex"}`}>
            {!selectedUserId ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500">
                <svg className="w-16 h-16 mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm">Seleziona un utente dall'elenco per visualizzarne i dettagli</p>
              </div>
            ) : loadingDetail ? (
              <div className="space-y-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-zinc-800 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-24 bg-zinc-800/40 rounded-xl" />
                <div className="h-32 bg-zinc-800/40 rounded-xl" />
              </div>
            ) : userDetail ? (
              <div className="space-y-6">
                {/* Header Dettaglio */}
                <div className="border-b border-zinc-800 pb-5 flex flex-col gap-4">
                  {/* Pulsante Indietro per Mobile */}
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="lg:hidden w-fit flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Torna alla lista
                  </button>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 font-extrabold text-xl flex-shrink-0">
                        {userDetail.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                          {userDetail.username}
                          {checkSanzioneAttiva(userDetail.sanzioni) && (
                            <span className="px-2 py-0.5 bg-red-600/20 border border-red-700/50 text-red-300 text-[10px] font-bold rounded-full">
                              {checkSanzioneAttiva(userDetail.sanzioni).tipo === "BAN" ? "Bannato" : "Sospeso"}
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-zinc-500 truncate">{userDetail.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSanzioneTipo("SOSPENSIONE");
                          setShowSanzioneModal(true);
                        }}
                        className="px-3.5 py-2 bg-amber-600/10 border border-amber-700/40 hover:bg-amber-600/20 text-amber-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Sospendi
                      </button>
                      <button
                        onClick={() => {
                          setSanzioneTipo("BAN");
                          setShowSanzioneModal(true);
                        }}
                        className="px-3.5 py-2 bg-red-600/10 border border-red-700/40 hover:bg-red-600/20 text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Banna
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scheda Anagrafica */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Città</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-1">{userDetail.citta || "Nessuna"}</p>
                  </div>
                  <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Livello Esperienza</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-1">{userDetail.livelloEsperienza || "Non specificato"}</p>
                  </div>
                  <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Ruolo</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-1 capitalize">{userDetail.ruolo}</p>
                  </div>
                  <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 uppercase font-semibold">Data Registrazione</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-1">
                      {new Date(userDetail.dataCreazione).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-zinc-850/40 border border-zinc-800 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Biografia</p>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    {userDetail.bio ? `"${userDetail.bio}"` : "Nessuna biografia inserita."}
                  </p>
                </div>

                {/* Strumenti e Generi */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Strumenti</h3>
                    {userDetail.strumenti.length === 0 ? (
                      <p className="text-xs text-zinc-500">Nessuno strumento suonato.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userDetail.strumenti.map((s: any) => (
                          <span key={s.idStrumento} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs rounded-lg font-medium">
                            {s.strumento.nome}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Generi</h3>
                    {userDetail.generi.length === 0 ? (
                      <p className="text-xs text-zinc-500">Nessun genere preferito.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userDetail.generi.map((g: any) => (
                          <span key={g.idGenere} className="px-2.5 py-1 bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs rounded-lg font-medium">
                            {g.genere.nome}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Media Caricati */}
                <div className="border-t border-zinc-800 pt-5">
                  <h3 className="text-sm font-bold text-white mb-3">Elementi Media ({userDetail.media.length})</h3>
                  {userDetail.media.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-2">Nessun file multimediale caricato.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userDetail.media.map((m: any) => (
                        <div key={m.idMedia} className="bg-zinc-850 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between gap-3">
                          <div className="min-w-0 font-medium">
                            <span className="px-1.5 py-0.5 bg-violet-950/40 border border-violet-900/60 text-violet-400 text-[10px] font-bold rounded">
                              {m.tipo}
                            </span>
                            <p className="text-xs text-zinc-300 font-semibold truncate mt-2">{m.source}</p>
                            {m.descrizione && (
                              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{m.descrizione}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 mt-auto">
                            <span className="text-[9px] text-zinc-500">
                              {new Date(m.dataUpload).toLocaleDateString("it-IT")}
                            </span>
                            <button
                              onClick={() => handleEliminaMedia(m.idMedia)}
                              className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                            >
                              Elimina
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sanzioni Applicate */}
                <div className="border-t border-zinc-800 pt-5">
                  <h3 className="text-sm font-bold text-white mb-3">Provvedimenti ({userDetail.sanzioni.length})</h3>
                  {userDetail.sanzioni.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-2">Nessun provvedimento a carico dell'utente.</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetail.sanzioni.map((s: any) => {
                        const isBan = s.tipo === "BAN";
                        const isSospAttiva = s.tipo === "SOSPENSIONE" && (!s.dataFine || new Date(s.dataFine) > new Date());
                        const isProvvAttivo = isBan || isSospAttiva;

                        return (
                          <div key={s.idSanzione} className="bg-zinc-850/50 border border-zinc-800 rounded-xl p-3.5 flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  isBan
                                    ? "bg-red-600/10 border border-red-700/30 text-red-400"
                                    : "bg-amber-600/10 border border-amber-700/30 text-amber-400"
                                }`}>
                                  {s.tipo}
                                </span>
                                {isProvvAttivo && (
                                  <span className="text-[10px] text-emerald-400 font-semibold">• Attivo</span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-300">Motivo: <span className="text-zinc-400">{s.motivo}</span></p>
                              <p className="text-[10px] text-zinc-500">
                                Inizio: {new Date(s.dataInizio).toLocaleDateString("it-IT")}
                                {s.dataFine && ` • Fine: ${new Date(s.dataFine).toLocaleDateString("it-IT")}`}
                              </p>
                            </div>
                            <span className="text-[10px] text-zinc-600 font-medium">
                              Admin: {s.amministratore?.username || "Sistema"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Sanzioni */}
        {showSanzioneModal && userDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  Emetti {sanzioneTipo === "BAN" ? "Ban" : "Sospensione"} per {userDetail.username}
                </h3>
                <button
                  onClick={() => setShowSanzioneModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEmettiSanzione} className="space-y-4">
                {sanzioneTipo === "SOSPENSIONE" && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Durata Sospensione (Giorni)</label>
                    <input
                      type="number"
                      min="1"
                      value={sanzioneGiorni}
                      onChange={(e) => setSanzioneGiorni(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Motivo del provvedimento</label>
                  <textarea
                    rows={4}
                    placeholder="Inserisci la motivazione formale..."
                    value={sanzioneMotivo}
                    onChange={(e) => setSanzioneMotivo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowSanzioneModal(false)}
                    className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSanzione}
                    className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all cursor-pointer disabled:opacity-60 ${
                      sanzioneTipo === "BAN" ? "bg-red-600 hover:bg-red-700 shadow-red-600/25" : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"
                    }`}
                  >
                    {submittingSanzione ? "Applicazione..." : "Conferma Provvedimento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
