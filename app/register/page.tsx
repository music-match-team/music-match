"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    if (u) router.push("/musicisti");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username || !email || !password) {
      setIsError(true);
      setMessaggio("Compila tutti i campi per procedere.");
      return;
    }

    setIsSubmitting(true);
    setMessaggio("");
    setIsError(false);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("utente", JSON.stringify(data));
        window.dispatchEvent(new Event("utenteAggiornato"));
        setIsError(false);
        setMessaggio("Registrazione completata! Reindirizzamento...");
        setTimeout(() => router.push("/profilo"), 1000);
      } else {
        setIsError(true);
        setMessaggio(data.error || "Errore durante la registrazione.");
      }
    } catch (e) {
      console.error(e);
      setIsError(true);
      setMessaggio("Errore di rete. Controlla la connessione.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#12121a] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Luci d'ambiente decorative */}
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#0284c7]/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-8">

        {/* Logo ed Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Music match logo" className="h-16 w-auto object-contain hover:scale-105 transition-transform cursor-pointer" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Crea il tuo account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Unisciti a MusicMatch e connettiti con musicisti nella tua città
          </p>
        </div>

        {/* Card del modulo di registrazione */}
        <div className="bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl p-8 shadow-2xl">

          {/* Banner messaggio (errore o successo) */}
          {messaggio && (
            <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 border ${
              isError
                ? "bg-red-900/20 border-red-800/50 text-red-400"
                : "bg-emerald-900/20 border-emerald-800/50 text-emerald-400"
            }`}>
              {isError ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {messaggio}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="il_tuo_nome_arte"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM12 11V7a4 4 0 018 0v4h-8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-[#12121a] border border-[#2d2d3a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Termini di servizio */}
            <p className="text-xs text-gray-500 leading-relaxed">
              Registrandoti accetti i nostri{" "}
              <span className="text-[#0ea5e9] hover:text-[#38bdf8] cursor-pointer transition-colors">
                Termini di Servizio
              </span>{" "}
              e la nostra{" "}
              <span className="text-[#0ea5e9] hover:text-[#38bdf8] cursor-pointer transition-colors">
                Privacy Policy
              </span>
              .
            </p>

            {/* Pulsante Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl shadow-lg shadow-[#0ea5e9]/20 hover:shadow-[#0ea5e9]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrazione in corso...
                  </>
                ) : (
                  "Crea account"
                )}
              </button>
            </div>
          </form>

          {/* Link al Login */}
          <div className="mt-8 text-center border-t border-[#2d2d3a] pt-6">
            <p className="text-sm text-gray-400 font-medium">
              Hai già un account?
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-2 text-sm font-bold text-[#0ea5e9] hover:text-[#38bdf8] hover:underline cursor-pointer transition-colors"
            >
              Accedi ora
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}