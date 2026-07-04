"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SegnalazioniPage() {
  const router = useRouter();
  const [segnalazioni, setSegnalazioni] = useState<any[]>([]);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a) {
      router.push("/admin/login");
    } else {
      setAdmin(a);
      caricaSegnalazioni();
    }
  }, [router]);

  async function caricaSegnalazioni() {
    try {
      const response = await fetch("/api/admin/segnalazioni");
      if (response.ok) {
        const data = await response.json();
        setSegnalazioni(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function eliminaSegnalazione(idSegnalazione: number) {
    if (!confirm("Sei sicuro di voler eliminare questa segnalazione?")) return;

    try {
      const response = await fetch("/api/admin/segnalazioni", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idSegnalazione })
      });

      if (response.ok) {
        alert("Segnalazione eliminata");
        caricaSegnalazioni();
      } else {
        alert("Errore durante l'eliminazione");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'eliminazione");
    }
  }

  async function sanzionaUtente(idUtente: number, tipo: "BAN" | "SOSPENSIONE") {
    let motivo = prompt(`Inserisci il motivo del ${tipo === 'BAN' ? 'ban' : 'sospensione'}:`);
    if (!motivo) return;

    let giorniSospensione = 0;
    if (tipo === "SOSPENSIONE") {
      const giorni = prompt("Inserisci il numero di giorni di sospensione:");
      if (!giorni || isNaN(parseInt(giorni))) {
        alert("Giorni non validi.");
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
        body: JSON.stringify({
          idUtente,
          tipo,
          motivo,
          giorniSospensione
        })
      });

      if (response.ok) {
        alert(`Sanzione (${tipo}) applicata con successo!`);
      } else {
        const data = await response.json();
        alert(data.error || "Errore durante l'applicazione della sanzione");
      }
    } catch (error) {
      console.error(error);
      alert("Errore durante l'applicazione della sanzione");
    }
  }

  function logout() {
    localStorage.removeItem("admin");
    router.push("/admin/login");
  }

  if (!admin) return <p>Caricamento...</p>;

  return (
    <main style={{ padding: "20px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestione Segnalazioni</h1>
        <div>
          {admin.isSuperAdmin && (
            <button onClick={() => router.push("/admin/gestione-admin")} style={{ padding: "8px 16px", marginRight: "10px" }}>Gestione Amministratori</button>
          )}
          <button onClick={logout} style={{ padding: "8px 16px" }}>Logout</button>
        </div>
      </div>

      {segnalazioni.length === 0 ? (
        <p>Nessuna segnalazione presente.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>ID</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Data</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Mittente</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Destinatario</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Motivo</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {segnalazioni.map((s) => (
              <tr key={s.idSegnalazione}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{s.idSegnalazione}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {new Date(s.data).toLocaleString()}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {s.mittente.username} ({s.mittente.email})
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {s.destinatario.username} ({s.destinatario.email})
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{s.motivo}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => sanzionaUtente(s.destinatario.idUtente, "SOSPENSIONE")}
                      style={{ backgroundColor: "#faad14", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Sospendi
                    </button>
                    <button
                      onClick={() => sanzionaUtente(s.destinatario.idUtente, "BAN")}
                      style={{ backgroundColor: "#820014", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Banna
                    </button>
                    <button
                      onClick={() => eliminaSegnalazione(s.idSegnalazione)}
                      style={{ backgroundColor: "#ff4d4f", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Elimina Segnalazione
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
