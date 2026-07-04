"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GestioneAdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [amministratori, setAmministratori] = useState<any[]>([]);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a || !a.isSuperAdmin) {
      router.push("/admin/segnalazioni");
    } else {
      setAdmin(a);
      caricaAmministratori(a);
    }
  }, [router]);

  async function caricaAmministratori(adminSession: any) {
    try {
      const response = await fetch("/api/admin/gestione-admin", {
        headers: {
          "admin-id": adminSession.idAdmin.toString(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAmministratori(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function creaAmministratore(e: React.FormEvent) {
    e.preventDefault();

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
        alert("Amministratore creato con successo");
        setEmail("");
        setUsername("");
        setPassword("");
        setIsSuperAdmin(false);
        caricaAmministratori(admin);
      } else {
        const data = await response.json();
        alert(data.error || "Errore durante la creazione");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante la creazione");
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
        alert("Amministratore eliminato");
        caricaAmministratori(admin);
      } else {
        alert("Errore durante l'eliminazione");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'eliminazione");
    }
  }

  if (!admin) return <p>Caricamento...</p>;

  return (
    <main style={{ padding: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestione Amministratori</h1>
        <div>
          <button onClick={() => router.push("/admin/segnalazioni")} style={{ padding: "8px 16px", marginRight: "10px" }}>Torna a Segnalazioni</button>
        </div>
      </div>

      <section style={{ marginTop: "30px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
        <h2>Crea nuovo Amministratore</h2>
        <form onSubmit={creaAmministratore} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px", marginTop: "10px" }}>
          <input required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label>
            <input type="checkbox" checked={isSuperAdmin} onChange={(e) => setIsSuperAdmin(e.target.checked)} />
            Rendi Super Admin
          </label>
          <button type="submit" style={{ padding: "8px" }}>Crea Amministratore</button>
        </form>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h2>Elenco Amministratori</h2>
        {amministratori.length === 0 ? (
          <p>Nessun amministratore trovato.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Username</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Email</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Super Admin</th>
                <th style={{ padding: "12px", border: "1px solid #ddd" }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {amministratori.map((a) => (
                <tr key={a.idAdmin}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{a.idAdmin}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{a.username}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{a.email}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{a.isSuperAdmin ? "Sì" : "No"}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {a.idAdmin !== admin.idAdmin && (
                      <button
                        onClick={() => eliminaAmministratore(a.idAdmin)}
                        style={{ backgroundColor: "#ff4d4f", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Elimina
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
