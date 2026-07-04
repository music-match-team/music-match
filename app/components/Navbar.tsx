"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("utente") || "null");
    setUtente(u);
  }, [pathname]);

  if (!utente || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#333",
      color: "white",
      position: "relative"
    }}>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
        <Link href="/eventi" style={{ color: "white", textDecoration: "none" }}>Eventi</Link>
        <Link href="/match" style={{ color: "white", textDecoration: "none" }}>Match</Link>
      </div>
      
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontWeight: "bold", fontSize: "1.2rem" }}>
        <Link href="/musicisti" style={{ color: "white", textDecoration: "none" }}>Musicisti</Link>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link href="/notifiche" style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Notifiche
        </Link>
        <Link href="/profilo" style={{ color: "white", textDecoration: "none" }}>Profilo</Link>
      </div>
    </nav>
  );
}
