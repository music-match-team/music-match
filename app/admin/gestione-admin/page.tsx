"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { validatePassword } from "@/lib/password-validation";

export default function GestioneAdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [amministratori, setAmministratori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Notification states
  const [messaggio, setMessaggio] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a || !a.isSuperAdmin) {
      router.push("/admin");
    } else {
      setAdmin(a);
      caricaAmministratori(a);
    }
  }, [router]);

  async function caricaAmministratori(adminSession: any) {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/gestione-admin", {
        headers: {
          "admin-id": adminSession.idAdmin.toString(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAmministratori(data);
      } else {
        showMsg("Impossibile caricare l'elenco degli amministratori", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore nel recupero degli amministratori", true);
    } finally {
      setLoading(false);
    }
  }

  function showMsg(msg: string, error = false) {
    setMessaggio(msg);
    setIsError(error);
    setTimeout(() => setMessaggio(""), 4000);
  }

  async function creaAmministratore(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      showMsg("Tutti i campi sono obbligatori", true);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showMsg("La password non soddisfa i requisiti di sicurezza.", true);
      setPasswordErrors(passwordValidation.errors);
      return;
    }

    setSubmitting(true);
    setPasswordErrors([]);
    try {
      const response = await fetch("/api/admin/gestione-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-id": admin.idAdmin.toString(),
        },
        body: JSON.stringify({ email, username, password, isSuperAdmin }),
      });

      if (response.ok) {
        showMsg("Amministratore creato con successo!");
        setEmail("");
        setUsername("");
        setPassword("");
        setIsSuperAdmin(false);
        caricaAmministratori(admin);
      } else {
        const data = await response.json();
        showMsg(data.error || "Errore durante la creazione", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete durante la creazione", true);
    } finally {
      setSubmitting(false);
    }
  }

  async function eliminaAmministratore(idAdmin: number) {
    if (!confirm("Sei sicuro di voler eliminare questo amministratore?")) return;

    try {
      const response = await fetch("/api/admin/gestione-admin", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "admin-id": admin.idAdmin.toString(),
        },
        body: JSON.stringify({ idAdminTarget: idAdmin }),
      });

      if (response.ok) {
        showMsg("Amministratore eliminato con successo!");
        caricaAmministratori(admin);
      } else {
        showMsg("Errore durante l'eliminazione", true);
      }
    } catch (error) {
      console.error(error);
      showMsg("Errore di rete durante l'eliminazione", true);
    }
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#12121a] text-white flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestione Amministratori</h1>
          <p className="text-gray-400 text-sm mt-1">Crea nuovi membri del team amministrativo o revoca le loro credenziali.</p>
        </div>

        {messaggio && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border ${
            isError ? "bg-red-950/40 border-red-800/80 text-red-300" : "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
          }`}>
            {messaggio}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Creazione Admin */}
          <div className="lg:col-span-2 bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Nuovo Amministratore
            </h2>

            <form onSubmit={creaAmministratore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                <input
                  required
                  type="text"
                  placeholder="Inserisci username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  required
                  type="email"
                  placeholder="nome.cognome@musicmatch.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password temporanea</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordErrors.length > 0) setPasswordErrors([]);
                  }}
                  className={`w-full px-4 py-2.5 bg-[#12121a] border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                    passwordErrors.length > 0 
                      ? "border-red-800 focus:ring-red-600" 
                      : "border-[#2d2d3a] focus:ring-[#0ea5e9]"
                  }`}
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-xs text-red-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isSuperAdmin"
                  checked={isSuperAdmin}
                  onChange={(e) => setIsSuperAdmin(e.target.checked)}
                  className="w-4 h-4 rounded border-[#3f3f50] bg-[#2d2d3a] text-violet-600 focus:ring-[#0ea5e9] focus:ring-offset-zinc-900 focus:ring-2 transition-all cursor-pointer"
                />
                <label htmlFor="isSuperAdmin" className="text-sm font-semibold text-gray-300 cursor-pointer select-none">
                  Abilita come Super Admin
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-3"
              >
                {submitting ? "Creazione in corso..." : "Crea Amministratore"}
              </button>
            </form>
          </div>

          {/* Elenco Admin */}
          <div className="lg:col-span-3 bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl p-6 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Amministratori Registrati
            </h2>

            {loading ? (
              <div className="space-y-3 flex-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[#2d2d3a]/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : amministratori.length === 0 ? (
              <p className="text-gray-500 text-sm py-10 text-center flex-1">Nessun amministratore trovato.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {amministratori.map((a) => {
                  const isCurrentAdmin = a.idAdmin === admin.idAdmin;
                  return (
                    <div
                      key={a.idAdmin}
                      className="bg-[#1e1e24] border border-[#2d2d3a] rounded-xl p-4 flex items-center justify-between transition-colors hover:border-[#2d2d3a]"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">{a.username}</span>
                          {a.isSuperAdmin ? (
                            <span className="px-2 py-0.5 bg-violet-950/40 border border-violet-900/60 text-[#0ea5e9] text-[10px] font-bold rounded-full">
                              Super Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#2d2d3a] border border-[#2d2d3a] text-gray-400 text-[10px] font-medium rounded-full">
                              Amministratore
                            </span>
                          )}
                          {isCurrentAdmin && (
                            <span className="text-[10px] text-emerald-400 font-semibold">• Tu</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{a.email}</p>
                      </div>

                      {!isCurrentAdmin && (
                        <button
                          onClick={() => eliminaAmministratore(a.idAdmin)}
                          className="px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 border border-red-800/40 text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          Elimina
                        </button>
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
