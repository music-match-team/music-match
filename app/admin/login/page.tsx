"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    if (admin) {
      router.push("/admin/segnalazioni");
    }
  }, [router]);

  async function login() {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        alert("Credenziali errate");
        return;
      }

      const admin = await response.json();
      localStorage.setItem("admin", JSON.stringify(admin));
      router.push("/admin/segnalazioni");
    } catch (error) {
      console.error(error);
      alert("Errore durante il login");
    }
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Login Amministratore</h1>
      
      <input
        placeholder="Email Admin"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />
      
      <input
        type="password"
        placeholder="Password Admin"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />
      
      <button onClick={login}>
        Accedi come Amministratore
      </button>
    </main>
  );
}
