"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

export default function GestioneEventiPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eventi, setEventi] = useState<any[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [messaggio, setMessaggio] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a) {
      router.push("/admin/login");
      return;
    }
    setAdmin(a);
    caricaEventi();
  }, [router]);

  async function caricaEventi() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/eventi");
      if (res.ok) {
        const data = await res.json();
        setEventi(data);
      } else {
        showMsg("Impossibile caricare l'elenco degli eventi", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete durante il caricamento degli eventi", true);
    } finally {
      setLoading(false);
    }
  }

  function showMsg(msg: string, error = false) {
    setMessaggio(msg);
    setIsError(error);
    setTimeout(() => setMessaggio(""), 4000);
  }

  async function handleEliminaEvento(idEvento: number) {
    if (!confirm("Sei sicuro di voler eliminare questo evento in modo permanente?")) return;
    setDeletingId(idEvento);
    try {
      const res = await fetch("/api/admin/eventi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEvento }),
      });

      if (res.ok) {
        showMsg("Evento eliminato con successo!");
        setEventi((prev) => prev.filter((e) => e.idEvento !== idEvento));
        if (expandedEventId === idEvento) {
          setExpandedEventId(null);
        }
      } else {
        showMsg("Errore durante l'eliminazione dell'evento", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete", true);
    } finally {
      setDeletingId(null);
    }
  }

  function toggleExpand(idEvento: number) {
    setExpandedEventId((prev) => (prev === idEvento ? null : idEvento));
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestione Eventi</h1>
          <p className="text-zinc-400 text-sm mt-1">Monitora tutti gli eventi creati nella community ed elimina quelli inappropriati.</p>
        </div>

        {messaggio && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border ${
            isError ? "bg-red-950/40 border-red-800/80 text-red-300" : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
          }`}>
            {messaggio}
          </div>
        )}

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
              Elenco Eventi ({eventi.length})
            </h2>
            <button
              onClick={caricaEventi}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3z" />
              </svg>
              Aggiorna
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-zinc-800/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : eventi.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <svg className="w-12 h-12 mb-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Nessun evento registrato nella piattaforma.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                   <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/20">
                     <th className="px-6 py-4">Titolo</th>
                     <th className="px-6 py-4 hidden sm:table-cell">Luogo</th>
                     <th className="px-6 py-4 hidden md:table-cell">Data</th>
                     <th className="px-6 py-4 hidden lg:table-cell">Creatore</th>
                     <th className="px-6 py-4 text-center hidden sm:table-cell">Partecipanti</th>
                     <th className="px-6 py-4 text-right">Azioni</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {eventi.map((e) => {
                    const isExpanded = expandedEventId === e.idEvento;
                    const creatore = e.creatori?.[0]?.utente?.username || "Sistema/Sconosciuto";

                    return (
                      <Fragment key={e.idEvento}>
                         <tr className={`hover:bg-zinc-800/20 transition-colors ${isExpanded ? "bg-zinc-900/30" : ""}`}>
                           <td className="px-6 py-4 font-semibold text-white text-sm">{e.titolo}</td>
                           <td className="px-6 py-4 text-zinc-300 text-sm hidden sm:table-cell">{e.citta?.nome || "Non specificata"}</td>
                           <td className="px-6 py-4 text-zinc-400 text-sm hidden md:table-cell">
                             {new Date(e.data).toLocaleDateString("it-IT", {
                               day: "numeric",
                               month: "short",
                               year: "numeric",
                               hour: "2-digit",
                               minute: "2-digit",
                             })}
                           </td>
                           <td className="px-6 py-4 text-sm hidden lg:table-cell">
                             <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                               {creatore}
                             </span>
                           </td>
                           <td className="px-6 py-4 text-center text-zinc-300 font-bold text-sm hidden sm:table-cell">
                             {e._count?.partecipanti ?? 0}
                           </td>
                           <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => toggleExpand(e.idEvento)}
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                              >
                                {isExpanded ? "Nascondi" : "Dettaglio"}
                              </button>
                              <button
                                onClick={() => handleEliminaEvento(e.idEvento)}
                                disabled={deletingId === e.idEvento}
                                className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/40 text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
                              >
                                {deletingId === e.idEvento ? "Eliminazione..." : "Elimina"}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-zinc-900/30 border-b border-zinc-800/50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div className="md:col-span-2 space-y-2">
                                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Descrizione Evento</h4>
                                  <p className="text-zinc-300 leading-relaxed">
                                    {e.descrizione || "Nessuna descrizione specificata per questo evento."}
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Coordinate Geografiche</h4>
                                    <p className="text-zinc-400 mt-1">
                                      {e.lat !== null && e.long !== null
                                        ? `Lat: ${e.lat.toFixed(4)} / Long: ${e.long.toFixed(4)}`
                                        : "Non specificate"}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">ID Evento</h4>
                                    <p className="text-zinc-400 mt-1 font-mono text-xs">#{e.idEvento}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
