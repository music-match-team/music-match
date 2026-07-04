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

      <div>
        <Link href="/profilo" style={{ color: "white", textDecoration: "none" }}>Profilo</Link>
      </div>
    </nav>
  );
}
