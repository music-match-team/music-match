"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

export default function SanzioniPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [isError, setIsError] = useState(false);

  // Data states
  const [sanzioni, setSanzioni] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);

  // Form states
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [tipo, setTipo] = useState<"BAN" | "SOSPENSIONE">("SOSPENSIONE");
  const [motivo, setMotivo] = useState("");
  const [giorniSospensione, setGiorniSospensione] = useState("7");

  // Accordion state (expanded users)
  const [expandedUsers, setExpandedUsers] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a) {
      router.push("/admin/login");
      return;
    }
    setAdmin(a);
    caricaDati();
  }, [router]);

  async function caricaDati() {
    try {
      setLoading(true);
      const [sanzRes, utentiRes] = await Promise.all([
        fetch("/api/sanzioni"),
        fetch("/api/admin/utenti"),
      ]);

      if (sanzRes.ok && utentiRes.ok) {
        const sanzData = await sanzRes.json();
        const utentiData = await utentiRes.json();
        setSanzioni(sanzData);
        setUtenti(utentiData);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore nel caricamento dei dati", true);
    } finally {
      setLoading(false);
    }
  }

  function showMsg(msg: string, error = false) {
    setMessaggio(msg);
    setIsError(error);
    setTimeout(() => setMessaggio(""), 4000);
  }

  const filteredUsers = utenti.filter(
    (u) =>
      u.username.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) {
      showMsg("Seleziona un utente dalla lista", true);
      return;
    }
    if (!motivo.trim()) {
      showMsg("Inserisci il motivo della sanzione", true);
      return;
    }
    if (tipo === "SOSPENSIONE" && (!giorniSospensione || parseInt(giorniSospensione) <= 0)) {
      showMsg("Inserisci un numero valido di giorni", true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/sanzioni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-id": admin.idAdmin.toString(),
        },
        body: JSON.stringify({
          idUtente: selectedUser.idUtente,
          tipo,
          motivo,
          giorniSospensione: tipo === "SOSPENSIONE" ? parseInt(giorniSospensione) : undefined,
        }),
      });

      if (response.ok) {
        showMsg("Sanzione applicata con successo!");
        setSelectedUser(null);
        setSearchUserQuery("");
        setMotivo("");
        setTipo("SOSPENSIONE");
        setGiorniSospensione("7");
        caricaDati();
      } else {
        const errData = await response.json();
        showMsg(errData.error || "Errore durante l'emissione della sanzione", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete", true);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleUserAccordion(userId: number) {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  }

  // Raggruppa le sanzioni per utente
  const sanzioniRaggruppate = sanzioni.reduce((acc: { [key: number]: any }, curr) => {
    const uId = curr.utente.idUtente;
    if (!acc[uId]) {
      acc[uId] = {
        utente: curr.utente,
        sanzioni: [],
      };
    }
    acc[uId].sanzioni.push(curr);
    return acc;
  }, {});

  const listSanzioniRaggruppate = Object.values(sanzioniRaggruppate);

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestione Sanzioni</h1>
          <p className="text-zinc-400 text-sm mt-1">Emetti nuove sanzioni e visualizza lo storico dei provvedimenti applicati.</p>
        </div>

        {messaggio && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border ${
            isError ? "bg-red-950/40 border-red-800/80 text-red-300" : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
          }`}>
            {messaggio}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Emetti Nuova Sanzione Form */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emetti Nuova Sanzione
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ricerca Utente */}
              <div className="relative">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Seleziona Utente</label>
                {!selectedUser ? (
                  <>
                    <input
                      type="text"
                      placeholder="Cerca per username o email..."
                      value={searchUserQuery}
                      onChange={(e) => {
                        setSearchUserQuery(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      className="w-full px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                    />
                    {showUserDropdown && searchUserQuery && (
                      <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-zinc-800/50">
                        {filteredUsers.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-zinc-500">Nessun utente trovato</div>
                        ) : (
                          filteredUsers.map((u: any) => (
                            <button
                              key={u.idUtente}
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setShowUserDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <p className="font-semibold">{u.username}</p>
                                <p className="text-xs text-zinc-500">{u.email}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-violet-600/10 border border-violet-700/40 rounded-xl p-3.5">
                    <div>
                      <p className="text-sm font-bold text-violet-300">{selectedUser.username}</p>
                      <p className="text-xs text-zinc-400">{selectedUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchUserQuery("");
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors cursor-pointer"
                    >
                      Rimuovi
                    </button>
                  </div>
                )}
              </div>

              {/* Tipo Sanzione */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tipo Sanzione</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo("SOSPENSIONE")}
                    className={`py-2 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer text-center ${
                      tipo === "SOSPENSIONE"
                        ? "bg-amber-600/20 border-amber-700/60 text-amber-300"
                        : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:bg-zinc-800/80"
                    }`}
                  >
                    Sospensione
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("BAN")}
                    className={`py-2 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer text-center ${
                      tipo === "BAN"
                        ? "bg-red-600/20 border-red-700/60 text-red-300"
                        : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:bg-zinc-800/80"
                    }`}
                  >
                    Ban Permanente
                  </button>
                </div>
              </div>

              {/* Giorni di Sospensione */}
              {tipo === "SOSPENSIONE" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Durata Sospensione (Giorni)</label>
                  <input
                    type="number"
                    min="1"
                    value={giorniSospensione}
                    onChange={(e) => setGiorniSospensione(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                    required
                  />
                </div>
              )}

              {/* Motivo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Motivo</label>
                <textarea
                  rows={4}
                  placeholder="Inserisci la motivazione formale..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm resize-none"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? "Applicazione in corso..." : "Emetti Sanzione"}
              </button>
            </form>
          </div>

          {/* Storico Sanzioni (colonna destra) */}
          <div className="lg:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Storico Sanzioni Raggruppate per Utente
            </h2>

            {loading ? (
              <div className="space-y-3 flex-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-zinc-800/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : listSanzioniRaggruppate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 flex-1">
                <svg className="w-12 h-12 mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Nessuna sanzione presente nello storico.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {listSanzioniRaggruppate.map((item: any) => {
                  const isExpanded = !!expandedUsers[item.utente.idUtente];
                  const activeSanzioni = item.sanzioni.filter((s: any) => {
                    if (s.tipo === "BAN") return true;
                    if (s.tipo === "SOSPENSIONE") {
                      return !s.dataFine || new Date(s.dataFine) > new Date();
                    }
                    return false;
                  });

                  return (
                    <div
                      key={item.utente.idUtente}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all"
                    >
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => toggleUserAccordion(item.utente.idUtente)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors text-left cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{item.utente.username}</span>
                            {activeSanzioni.length > 0 && (
                              <span className="px-2 py-0.5 bg-red-950/55 border border-red-900/60 text-red-400 text-[10px] font-bold rounded-full">
                                Limitato
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.utente.email} • {item.sanzioni.length} sanzioni</p>
                        </div>
                        <div>
                          <svg
                            className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
                              isExpanded ? "transform rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 border-t border-zinc-800/50 bg-zinc-900/20 divide-y divide-zinc-850">
                          {item.sanzioni.map((s: any) => {
                            const isBan = s.tipo === "BAN";
                            const isSospAttiva = s.tipo === "SOSPENSIONE" && (!s.dataFine || new Date(s.dataFine) > new Date());
                            const isActive = isBan || isSospAttiva;

                            return (
                              <div key={s.idSanzione} className="py-3 first:pt-1 last:pb-1">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                      isBan
                                        ? "bg-red-600/10 border border-red-700/30 text-red-400"
                                        : "bg-amber-600/10 border border-amber-700/30 text-amber-400"
                                    }`}>
                                      {s.tipo}
                                    </span>
                                    {isActive && (
                                      <span className="text-[10px] text-emerald-400 font-semibold">• Attiva</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500">
                                    Admin: {s.amministratore?.username || "Sistema"}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-300 font-medium">Motivo: <span className="text-zinc-400 font-normal">{s.motivo}</span></p>
                                <div className="flex gap-4 text-[10px] text-zinc-500 mt-2">
                                  <p>Inizio: {new Date(s.dataInizio).toLocaleDateString("it-IT")}</p>
                                  {s.dataFine && (
                                    <p>Fine: {new Date(s.dataFine).toLocaleDateString("it-IT")}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}