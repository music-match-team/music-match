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
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#1e1e24",
      color: "white",
      position: "relative",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      zIndex: 40
    }}>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: pathname === "/dashboard" ? "bold" : "normal" }}>Dashboard</Link>
        <Link href="/eventi" style={{ color: "white", textDecoration: "none", fontWeight: pathname === "/eventi" ? "bold" : "normal" }}>Eventi</Link>
        <Link href="/match" style={{ color: "white", textDecoration: "none", fontWeight: pathname === "/match" ? "bold" : "normal" }}>Match</Link>
      </div>
      
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontWeight: "bold", fontSize: "1.2rem" }}>
        <Link href="/musicisti" style={{ color: "white", textDecoration: "none" }}>MusicMatch</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Dropdown Notifiche */}
        <div id="notifiche-dropdown-container" style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              position: "relative",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background-color 0.2s"
            }}
            className="hover:bg-slate-700/50"
            title="Notifiche"
          >
            {/* SVG Campanella */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            {/* Badge Notifiche Non Lette */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontSize: "9px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  minWidth: "15px",
                  height: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  border: "1.5px solid #1e1e24"
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Menu Dropdown */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "40px",
                width: "320px",
                backgroundColor: "#2d2d3a",
                border: "1px solid #3f3f50",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                zIndex: 50,
                color: "white",
                overflow: "hidden"
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #3f3f50",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#22222a"
                }}
              >
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Notifiche</span>
                {unreadCount > 0 && (
                  <button
                    onClick={segnaTutteComeLette}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#60a5fa",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: "500",
                      padding: 0
                    }}
                    className="hover:underline"
                  >
                    Segna tutte come lette
                  </button>
                )}
              </div>

              {/* Lista */}
              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifiche.length === 0 ? (
                  <div style={{ padding: "30px 15px", textAlign: "center", color: "#9ca3af" }}>
                    <p style={{ fontSize: "13px", margin: 0 }}>Non hai notifiche</p>
                  </div>
                ) : (
                  notifiche.slice(0, 5).map((n) => (
                    <div
                      key={n.idNotifica}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #3f3f50",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        backgroundColor: n.letta ? "transparent" : "rgba(59, 130, 246, 0.08)",
                        transition: "background-color 0.2s"
                      }}
                      className="hover:bg-slate-700/30"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <p style={{
                          fontSize: "12px",
                          margin: 0,
                          color: n.letta ? "#cbd5e1" : "#f1f5f9",
                          fontWeight: n.letta ? "normal" : "600",
                          wordBreak: "break-word",
                          lineHeight: "1.4"
                        }}>
                          {n.messaggio}
                        </p>
                        {!n.letta && (
                          <button
                            onClick={() => segnaComeLetta(n.idNotifica)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px",
                              alignSelf: "flex-start",
                              display: "flex"
                            }}
                            title="Segna come letta"
                          >
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block" }}></span>
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {formattaData(n.dataCreazione)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "10px",
                  textAlign: "center",
                  borderTop: "1px solid #3f3f50",
                  backgroundColor: "#22222a"
                }}
              >
                <Link
                  href="/notifiche"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    color: "#60a5fa",
                    fontSize: "12px",
                    fontWeight: "600",
                    textDecoration: "none"
                  }}
                  className="hover:underline"
                >
                  Vedi tutte le notifiche
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link href="/profilo" style={{ color: "white", textDecoration: "none", fontWeight: pathname === "/profilo" ? "bold" : "normal" }}>Profilo</Link>
      </div>
    </nav>
  );
}
