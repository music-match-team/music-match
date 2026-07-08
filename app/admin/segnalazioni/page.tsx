"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

export default function SegnalazioniPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [segnalazioni, setSegnalazioni] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messaggio, setMessaggio] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a) { router.push("/admin/login"); return; }
    setAdmin(a);
    caricaSegnalazioni();
  }, [router]);

  async function caricaSegnalazioni() {
    try {
      const response = await fetch("/api/admin/segnalazioni");
      if (response.ok) {
        const data = await response.json();
        setSegnalazioni(data);
        // Rimossa autoselezione per supportare la visualizzazione mobile
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  function showMsg(msg: string, error = false) {
    setMessaggio(msg);
    setIsError(error);
    setTimeout(() => setMessaggio(""), 4000);
  }

  async function eliminaSegnalazione(idSegnalazione: number) {
    if (!confirm("Sei sicuro di voler archiviare/eliminare questa segnalazione?")) return;
    try {
      const response = await fetch("/api/admin/segnalazioni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idSegnalazione }),
      });
      if (response.ok) {
        setSegnalazioni((prev) => prev.filter((s) => s.idSegnalazione !== idSegnalazione));
        if (selected?.idSegnalazione === idSegnalazione) setSelected(null);
        showMsg("Segnalazione archiviata con successo");
      } else {
        showMsg("Errore durante l'eliminazione", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore durante l'eliminazione", true);
    }
  }

  async function sanzionaUtente(idUtente: number, tipo: "BAN" | "SOSPENSIONE") {
    const motivo = prompt(`Inserisci il motivo del ${tipo === "BAN" ? "ban" : "sospensione"}:`);
    if (!motivo) return;

    let giorniSospensione = 0;
    if (tipo === "SOSPENSIONE") {
      const giorni = prompt("Inserisci il numero di giorni di sospensione:");
      if (!giorni || isNaN(parseInt(giorni))) {
        showMsg("Giorni non validi.", true);
        return;
      }
      giorniSospensione = parseInt(giorni);
    }

    try {
      const response = await fetch("/api/admin/sanzioni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-id": admin.idAdmin.toString(),
        },
        body: JSON.stringify({ idUtente, tipo, motivo, giorniSospensione }),
      });

      if (response.ok) {
        showMsg(`${tipo === "BAN" ? "Ban" : "Sospensione"} applicata con successo`);
      } else {
        const data = await response.json();
        showMsg(data.error || "Errore nell'applicazione della sanzione", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore nell'applicazione della sanzione", true);
    }
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#12121a] text-white flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestione Segnalazioni</h1>
          <p className="text-gray-400 text-sm mt-1">Esamina le segnalazioni degli utenti e prendi provvedimenti.</p>
        </div>

        {messaggio && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border ${
            isError ? "bg-red-950/40 border-red-800/80 text-red-300" : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
          }`}>
            {messaggio}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lista segnalazioni (colonna sinistra) */}
          <div className={`lg:col-span-2 bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl overflow-hidden ${selected ? "hidden lg:block" : "block"}`}>
            <div className="px-5 py-4 border-b border-[#2d2d3a] bg-[#1e1e24]/80">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                Ticket ({segnalazioni.length})
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-800/60">
              {loading ? (
                <div className="space-y-0">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-[#2d2d3a]/30 animate-pulse" />
                  ))}
                </div>
              ) : segnalazioni.length === 0 ? (
                <p className="text-gray-500 text-sm py-10 text-center">Nessuna segnalazione presente.</p>
              ) : (
                segnalazioni.map((s) => (
                  <button
                    key={s.idSegnalazione}
                    onClick={() => setSelected(s)}
                    className={`w-full text-left px-5 py-4 transition-all cursor-pointer ${
                      selected?.idSegnalazione === s.idSegnalazione
                        ? "bg-[#0ea5e9]/10 border-l-2 border-l-violet-500"
                        : "hover:bg-[#2d2d3a]/50 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-200 truncate">
                        #{s.idSegnalazione} — {s.destinatario.username}
                      </p>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                        {new Date(s.data).toLocaleDateString("it-IT")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      da {s.mittente.username}: {s.motivo}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Dettaglio segnalazione (colonna destra) */}
          <div className={`lg:col-span-3 bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl p-6 ${!selected ? "hidden lg:block" : "block"}`}>
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-gray-500">
                <svg className="w-12 h-12 mb-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">Seleziona una segnalazione dalla lista</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    {/* Pulsante Indietro per Mobile */}
                    <button
                      onClick={() => setSelected(null)}
                      className="lg:hidden mb-4 flex items-center gap-1.5 text-xs text-[#0ea5e9] hover:text-[#38bdf8] font-semibold cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Torna alla lista
                    </button>
                    <h2 className="text-xl font-bold text-white">
                      Segnalazione #{selected.idSegnalazione}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selected.data).toLocaleString("it-IT")}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-600/20 border border-amber-700/40 text-amber-300 text-xs font-bold rounded-full">
                    Da Esaminare
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#12121a] border border-[#3f3f50]/40 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Segnalante</p>
                    <p className="text-sm font-bold text-gray-200">{selected.mittente.username}</p>
                    <p className="text-xs text-gray-500">{selected.mittente.email}</p>
                  </div>
                  <div className="bg-[#12121a] border border-[#3f3f50]/40 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Segnalato</p>
                    <p className="text-sm font-bold text-amber-300">{selected.destinatario.username}</p>
                    <p className="text-xs text-gray-500">{selected.destinatario.email}</p>
                  </div>
                </div>

                <div className="bg-[#12121a] border border-[#3f3f50]/40 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Motivo della Segnalazione</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{selected.motivo}</p>
                </div>

                {/* Azioni */}
                <div className="border-t border-[#2d2d3a] pt-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Azioni Disponibili</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => sanzionaUtente(selected.destinatario.idUtente, "SOSPENSIONE")}
                      className="px-4 py-2.5 bg-amber-600/20 border border-amber-700/50 text-amber-300 rounded-lg text-sm font-semibold hover:bg-amber-600/30 transition-all cursor-pointer"
                    >
                      Sospendi Utente
                    </button>
                    <button
                      onClick={() => sanzionaUtente(selected.destinatario.idUtente, "BAN")}
                      className="px-4 py-2.5 bg-red-600/20 border border-red-700/50 text-red-300 rounded-lg text-sm font-semibold hover:bg-red-600/30 transition-all cursor-pointer"
                    >
                      Banna Utente
                    </button>
                    <button
                      onClick={() => eliminaSegnalazione(selected.idSegnalazione)}
                      className="px-4 py-2.5 bg-[#2d2d3a]/50 border border-[#3f3f50]/50 text-gray-300 rounded-lg text-sm font-semibold hover:bg-[#3f3f50]/50 transition-all cursor-pointer"
                    >
                      Archivia Segnalazione
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
