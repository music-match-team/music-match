"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [ultimeSegnalazioni, setUltimeSegnalazioni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("admin") || "null");
    if (!a) {
      router.push("/admin/login");
      return;
    }
    setAdmin(a);
    caricaDati();
  }, [router]);

  async function caricaDati() {
    try {
      const [segnRes, sanRes, utentiRes, eventiRes] = await Promise.all([
        fetch("/api/admin/segnalazioni"),
        fetch("/api/sanzioni"),
        fetch("/api/admin/utenti"),
        fetch("/api/admin/eventi"),
      ]);

      const [segnalazioni, sanzioni, utenti, eventi] = await Promise.all([
        segnRes.json(),
        sanRes.json(),
        utentiRes.json(),
        eventiRes.json(),
      ]);

      const banAttivi = sanzioni.filter(
        (s: any) => s.tipo === "BAN" || (s.tipo === "SOSPENSIONE" && (!s.dataFine || new Date(s.dataFine) > new Date()))
      ).length;

      setStats({
        segnalazioni: segnalazioni.length,
        sanzioniTotali: sanzioni.length,
        banAttivi,
        utenti: utenti.length,
        eventi: eventi.length,
      });

      setUltimeSegnalazioni(segnalazioni.slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!admin) return null;

  const statCards = [
    {
      label: "Segnalazioni",
      value: stats?.segnalazioni ?? "–",
      href: "/admin/segnalazioni",
      color: "from-amber-600/20 to-amber-700/10 border-amber-700/40",
      textColor: "text-amber-400",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: "Sanzioni Totali",
      value: stats?.sanzioniTotali ?? "–",
      href: "/admin/sanzioni",
      color: "from-orange-600/20 to-orange-700/10 border-orange-700/40",
      textColor: "text-orange-400",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: "Ban Attivi",
      value: stats?.banAttivi ?? "–",
      href: "/admin/sanzioni",
      color: "from-red-600/20 to-red-700/10 border-red-700/40",
      textColor: "text-red-400",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Utenti Totali",
      value: stats?.utenti ?? "–",
      href: "/admin/utenti",
      color: "from-[#0ea5e9]/20 to-[#0284c7]/10 border-[#0ea5e9]/40",
      textColor: "text-[#0ea5e9]",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: "Eventi Totali",
      value: stats?.eventi ?? "–",
      href: "/admin/eventi",
      color: "from-blue-600/20 to-blue-700/10 border-blue-700/40",
      textColor: "text-blue-400",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#12121a] text-white flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 min-w-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Benvenuto, <span className="text-[#0ea5e9] font-semibold">{admin.username}</span>. Panoramica generale di MusicMatch.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} border rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-pointer`}
            >
              <div className={`${card.textColor} mb-3`}>{card.icon}</div>
              <p className="text-2xl font-extrabold text-white">
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-[#3f3f50]/50 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Ultime Segnalazioni */}
        <div className="bg-[#1e1e24] border border-[#2d2d3a] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Ultime Segnalazioni
            </h2>
            <Link href="/admin/segnalazioni" className="text-xs text-[#0ea5e9] hover:text-[#38bdf8] font-semibold transition-colors hover:underline">
              Vedi tutte →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[#2d2d3a]/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : ultimeSegnalazioni.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">Nessuna segnalazione presente.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {ultimeSegnalazioni.map((s) => (
                <div key={s.idSegnalazione} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-200 font-medium">
                      <span className="text-gray-400">Da</span> {s.mittente.username}{" "}
                      <span className="text-gray-400">→</span>{" "}
                      <span className="text-amber-300">{s.destinatario.username}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.motivo}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(s.data).toLocaleDateString("it-IT")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick nav */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/admin/segnalazioni", label: "Gestisci Segnalazioni", color: "bg-amber-600/10 border-amber-700/30 hover:bg-amber-600/20" },
            { href: "/admin/sanzioni", label: "Emetti Sanzione", color: "bg-red-600/10 border-red-700/30 hover:bg-red-600/20" },
            { href: "/admin/utenti", label: "Cerca Utente", color: "bg-[#0ea5e9]/10 border-violet-700/30 hover:bg-[#0ea5e9]/20" },
            { href: "/admin/eventi", label: "Controlla Eventi", color: "bg-blue-600/10 border-blue-700/30 hover:bg-blue-600/20" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${item.color} border rounded-xl px-4 py-3 text-sm font-semibold text-gray-200 transition-all text-center hover:scale-[1.02]`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}