"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [utente, setUtente] = useState<any>(null);
  const [notifiche, setNotifiche] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, [pathname]);

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

  useEffect(() => {
    if (!utente) return;
    caricaNotifiche(utente.idUtente);

    const interval = setInterval(() => {
      caricaNotifiche(utente.idUtente);
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

  if (!utente || pathname.startsWith("/admin")) {
    return null;
  }

  const unreadCount = notifiche.filter(n => !n.letta).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:static md:w-64 md:h-screen bg-[#1e1e24] flex flex-row md:flex-col items-center md:items-start justify-around md:justify-start px-2 py-3 md:p-6 z-50 border-t md:border-t-0 md:border-r border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.3)] md:shadow-none transition-all duration-300">
      
      {/* Logo Desktop Solo */}
      <div className="hidden md:flex mb-10 w-full items-center justify-start">
        <Link href="/musicisti" className="text-2xl font-bold tracking-wide no-underline">
          <div className="bg-gradient-to-r from-[#3b38f6] to-[#c314f5] text-white px-3 py-1">
            MusicMatch
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-full justify-around md:justify-start flex-1">
        
        <Link href="/dashboard" className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/dashboard" ? "text-[#c314f5] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-[10px] md:text-base font-medium hidden md:block">Dashboard</span>
        </Link>

        <Link href="/musicisti" className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/musicisti" ? "text-[#c314f5] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] md:text-base font-medium hidden md:block">Musicisti</span>
        </Link>

        <Link href="/eventi" className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/eventi" ? "text-[#c314f5] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] md:text-base font-medium hidden md:block">Eventi</span>
        </Link>

        <Link href="/match" className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/match" ? "text-[#c314f5] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <span className="text-[10px] md:text-base font-medium hidden md:block">Match</span>
        </Link>

      </div>

      {/* Notifiche & Profilo */}
      <div className="flex flex-row md:flex-col md:w-full items-center md:items-stretch gap-2 md:gap-4 md:mt-auto">
        
        <div id="notifiche-dropdown-container" className="relative flex items-center justify-center md:justify-start w-full">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors w-full justify-center md:justify-start ${showDropdown ? "text-white md:bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            title="Notifiche"
          >
            <div className="relative">
              <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c314f5] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-[3px] border border-[#1e1e24]">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] md:text-base font-medium hidden md:block">Notifiche</span>
          </button>

          {/* Menu Dropdown Notifiche */}
          {showDropdown && (
            <div className="absolute bottom-14 md:bottom-auto md:top-0 left-1/2 md:left-full -translate-x-1/2 md:translate-x-0 md:ml-4 w-[90vw] md:w-80 bg-[#2d2d3a] border border-[#3f3f50] rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-[60] text-white overflow-hidden max-w-[320px]">
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
        </div>

        <Link href="/profilo" className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-lg transition-colors ${pathname === "/profilo" ? "text-[#c314f5] md:bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] md:text-base font-medium hidden md:block">Profilo</span>
        </Link>

      </div>
    </nav>
  );
}
