"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [utente, setUtente] = useState<any>(null);
  const [notifiche, setNotifiche] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEmptyPopup, setShowEmptyPopup] = useState(false);

  useEffect(() => {
    const aggiornaUtente = () => {
      const u = JSON.parse(localStorage.getItem("utente") || "null");
      setUtente(u);
    };
    aggiornaUtente();

    window.addEventListener("utenteAggiornato", aggiornaUtente);
    return () => window.removeEventListener("utenteAggiornato", aggiornaUtente);
  }, []);

  const caricaNotifiche = async (userId: number) => {
    try {
      const response = await fetch(`/api/notifiche?idUtente=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifiche(data);
      }
    } catch (e) {
      console.error("Errore nel caricamento delle notifiche:", e);
    }
  };

  const caricaDashboard = async (userId: number) => {
    try {
      const response = await fetch(`/api/dashboard?idUtente=${userId}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setDashboard(data);
      }
    } catch (e) {
      console.error("Errore nel caricamento dashboard:", e);
    }
  };

  useEffect(() => {
    if (!utente) return;
    caricaNotifiche(utente.idUtente);
    caricaDashboard(utente.idUtente);

    const interval = setInterval(() => {
      caricaNotifiche(utente.idUtente);
      caricaDashboard(utente.idUtente);
    }, 15000); // Poll ogni 15s

    return () => clearInterval(interval);
  }, [utente]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#notifiche-dropdown-container")) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showDropdown]);

  const segnaComeLetta = async (idNotifica: number) => {
    try {
      const response = await fetch("/api/notifiche", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNotifica, letta: true })
      });
      if (response.ok) {
        setNotifiche(prev => prev.map(n => n.idNotifica === idNotifica ? { ...n, letta: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const segnaTutteComeLette = async () => {
    if (!utente) return;
    try {
      const response = await fetch("/api/notifiche", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUtente: utente.idUtente, letta: true })
      });
      if (response.ok) {
        setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formattaData = (dataStr: string) => {
    const data = new Date(dataStr);
    const ora = data.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const diffMs = Date.now() - data.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Adesso";
    if (diffMins < 60) return `${diffMins} min fa`;

    const oggi = new Date();
    const ieri = new Date(oggi);
    ieri.setDate(oggi.getDate() - 1);

    if (data.toDateString() === oggi.toDateString()) {
      return `Oggi, ${ora}`;
    }
    if (data.toDateString() === ieri.toDateString()) {
      return `Ieri, ${ora}`;
    }

    return `${data.toLocaleDateString("it-IT")} ${ora}`;
  };

  if (!utente || pathname.startsWith("/admin") || pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  const unreadCount = notifiche.filter(n => !n.letta).length;

  return (
    <nav className="fixed bottom-4 left-4 right-4 md:bottom-0 md:left-0 md:right-0 md:static md:w-64 md:h-screen bg-zinc-900/90 backdrop-blur-xl md:bg-[#1e1e24] flex flex-row md:flex-col items-center md:items-start justify-around md:justify-start px-4 py-3 md:p-6 z-50 rounded-2xl md:rounded-none border border-zinc-800 md:border-y-0 md:border-l-0 md:border-r shadow-2xl md:shadow-none transition-all duration-300 md:overflow-y-auto scrollbar-hide">

      {/* Logo Desktop Solo */}
      <div className="hidden md:flex mb-10 w-full items-center justify-start">
        <Link href="/musicisti" className="flex items-center justify-center py-2 no-underline">
          <img src="/logo.png" alt="Music match logo" className="h-10 md:h-12 w-auto object-contain" />
        </Link>
      </div>

      {/* Nav Links */}
      <div className="contents md:flex md:flex-col md:gap-4 md:w-full md:justify-start md:flex-1">

        {/* MUSICISTI */}
        <Link href="/musicisti" className={`md:order-1 absolute left-1/2 -translate-x-1/2 -top-6 md:static md:translate-x-0 md:transform-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-4 md:p-2 rounded-full md:rounded-lg transition-all shadow-xl z-20 border-[5px] border-[#16161a] md:border md:shadow-none md:mb-2 ${pathname === "/musicisti" ? "bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white shadow-[#0ea5e9]/60 md:bg-none md:bg-white/10 md:border-[#0ea5e9]/50 md:text-[#0ea5e9]" : "bg-gradient-to-r from-[#0ea5e9]/90 to-[#0284c7]/90 text-white hover:from-[#0ea5e9] hover:to-[#0284c7] hover:text-white shadow-[#0ea5e9]/30 hover:-translate-y-1 md:hover:-translate-y-0 md:bg-none md:bg-transparent md:border-zinc-700/50 md:text-gray-300 md:hover:bg-white/5 md:hover:border-zinc-500"}`}>
          <svg className="w-8 h-8 md:w-5 md:h-5 md:text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] md:text-base font-bold hidden md:block">Musicisti</span>
        </Link>

        {/* DASHBOARD */}
        <Link href="/dashboard" className={`order-1 md:order-2 flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/dashboard" ? "text-[#0ea5e9] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-[10px] md:text-base font-medium block">Dashboard</span>
        </Link>

        {/* EVENTI */}
        <Link href="/eventi" className={`order-2 md:order-3 flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/eventi" ? "text-[#0ea5e9] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] md:text-base font-medium block">Eventi</span>
        </Link>

        {/* Placeholder div on mobile to reserve space for the absolute centered button */}
        <div className="flex-1 md:hidden pointer-events-none order-3"></div>

        {/* MATCH */}
        <Link href="/match" className={`order-4 md:order-5 flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/match" ? "text-[#0ea5e9] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          <span className="text-[10px] md:text-base font-medium block">Match</span>
        </Link>

        {/* NOTIFICHE */}
        <div id="notifiche-dropdown-container" className="order-5 md:order-6 flex-1 md:flex-none relative flex items-center justify-center md:justify-start w-full">
          <button
            onClick={() => {
              if (notifiche.length === 0) {
                setShowEmptyPopup(true);
                setShowDropdown(false);
              } else {
                setShowDropdown(!showDropdown);
              }
            }}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors w-full justify-center md:justify-start ${showDropdown ? "text-white md:bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            title="Notifiche"
          >
            <div className="relative">
              <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0ea5e9] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-[3px] border border-[#1e1e24]">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] md:text-base font-medium block">Notifiche</span>
          </button>

          {/* Menu Dropdown Notifiche */}
          {showDropdown && (
            <div className="absolute bottom-[calc(100%+1rem)] right-0 md:top-auto md:top-0 md:right-auto md:left-[calc(100%+1rem)] w-[90vw] md:w-80 max-w-[350px] bg-[#2d2d3a] border border-[#3f3f50] rounded-xl shadow-2xl z-[100] text-white overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#3f3f50] flex justify-between items-center bg-[#22222a]">
                <span className="font-semibold text-sm">Notifiche</span>
                {unreadCount > 0 && (
                  <button onClick={segnaTutteComeLette} className="text-blue-400 text-xs hover:underline">
                    Segna lette
                  </button>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-[60vh] md:max-h-72 overflow-y-auto">
                {notifiche.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Non hai notifiche
                  </div>
                ) : (
                  notifiche.slice(0, 5).map((n) => (
                    <div key={n.idNotifica} className={`p-4 border-b border-[#3f3f50] flex flex-col gap-2 transition-colors ${n.letta ? "hover:bg-white/5" : "bg-blue-500/10 hover:bg-blue-500/20"}`}>
                      <div className="flex justify-between gap-3">
                        <p className={`text-sm m-0 leading-relaxed ${n.letta ? "text-gray-300 font-normal" : "text-white font-semibold"}`}>
                          {n.messaggio}
                        </p>
                        {!n.letta && (
                          <button onClick={() => segnaComeLetta(n.idNotifica)} className="shrink-0 p-1 mt-1" title="Segna come letta">
                            <span className="block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formattaData(n.dataCreazione)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 text-center border-t border-[#3f3f50] bg-[#22222a]">
                <Link href="/notifiche" onClick={() => setShowDropdown(false)} className="text-blue-400 text-sm font-semibold hover:underline">
                  Vedi tutte le notifiche
                </Link>
              </div>
            </div>
          )}

          {/* Popup Nessuna Notifica */}
          {showEmptyPopup && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowEmptyPopup(false)}>
              <div className="bg-[#1e1e24] border border-[#3f3f50] p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="bg-[#0ea5e9]/10 text-[#0ea5e9] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0ea5e9]/30">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tutto tranquillo!</h3>
                <p className="text-gray-400 mb-6 text-sm">Non hai ancora ricevuto nessuna notifica.</p>
                <button 
                  onClick={() => setShowEmptyPopup(false)}
                  className="w-full py-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white rounded-xl font-bold shadow-lg shadow-[#0ea5e9]/20 transition-all cursor-pointer"
                >
                  Ho capito
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shortcuts Desktop (Sidebar) */}
        {dashboard && (dashboard.recentMatches?.length > 0 || dashboard.upcomingEvents?.length > 0) && (
          <div className="hidden md:flex flex-col gap-5 mt-6 pt-6 border-t border-[#3f3f50] w-full px-1 order-10">
            
            {dashboard.recentMatches?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">Chat Recenti</span>
                {dashboard.recentMatches.map((m: any) => (
                  <Link href="/match" key={m.idMatch} className="flex items-center gap-2.5 p-1.5 -mx-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title={m.otherUser.username}>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-[#2d2d3a] shrink-0 border border-[#3f3f50]">
                      {m.otherUser.immagineProfilo ? <img src={m.otherUser.immagineProfilo} alt="Profilo" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-400">{m.otherUser.username.charAt(0).toUpperCase()}</div>}
                    </div>
                    <span className="text-[13px] text-gray-300 font-medium truncate">{m.otherUser.username}</span>
                  </Link>
                ))}
              </div>
            )}

            {dashboard.upcomingEvents?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1">Prossimi Eventi</span>
                {dashboard.upcomingEvents.map((e: any) => (
                  <Link href="/eventi" key={e.idEvento} className="flex flex-col gap-1 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title={e.titolo}>
                    <span className="text-[13px] text-gray-300 font-medium truncate">{e.titolo}</span>
                    <span className="text-[10px] text-[#0ea5e9] truncate opacity-90">{new Date(e.data).toLocaleDateString()} • {e.citta?.nome || "Online"}</span>
                  </Link>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Logout (Fondo Sidebar Desktop) */}
      <div className="contents md:flex md:flex-col md:w-full md:items-stretch md:gap-4 md:mt-auto">

        {/* Tasto Logout (Solo Desktop, in fondo alla sidebar) */}
        <button
          onClick={() => {
            localStorage.removeItem("utente");
            window.location.href = "/login";
          }}
          className="hidden md:flex flex-row items-center gap-3 p-2 rounded-lg transition-colors w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
          title="Esci dall'account"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="text-base font-medium block">Logout</span>
        </button>

      </div>

    </nav>
  );
}
