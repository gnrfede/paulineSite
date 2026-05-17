"use client";

import { useState, useEffect, useMemo } from "react";
import type { ClientStat } from "@/app/api/admin/clients/route";

const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function fmtDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function RiskBadge({ days, hasNext }: { days: number; hasNext: boolean }) {
  if (hasNext)
    return <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-sans px-2 py-0.5 rounded-full">Turno próximo</span>;
  if (days < 0)
    return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-xs font-sans px-2 py-0.5 rounded-full">Sin visitas</span>;
  if (days <= 30)
    return <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-sans px-2 py-0.5 rounded-full">Activa — {days}d</span>;
  if (days <= 60)
    return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-sans px-2 py-0.5 rounded-full">Hace {days}d</span>;
  return <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-sans px-2 py-0.5 rounded-full font-medium">En riesgo — {days}d</span>;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<"all" | "active" | "risk" | "next">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((d) => setClients(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      if (filter === "active") return c.daysSinceLast >= 0 && c.daysSinceLast <= 30 && !c.nextBooking;
      if (filter === "risk")   return c.daysSinceLast > 60 && !c.nextBooking;
      if (filter === "next")   return !!c.nextBooking;
      return true;
    });
  }, [clients, search, filter]);

  const stats = useMemo(() => ({
    total:  clients.length,
    risk:   clients.filter((c) => c.daysSinceLast > 60 && !c.nextBooking).length,
    next:   clients.filter((c) => !!c.nextBooking).length,
    avgVisits: clients.length
      ? Math.round(clients.reduce((s, c) => s + c.totalVisits, 0) / clients.length * 10) / 10
      : 0,
  }), [clients]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-800">Clientes</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">Estadísticas y seguimiento de clientas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total clientas", value: stats.total, color: "bg-white", icon: "👥" },
          { label: "Con turno próximo", value: stats.next, color: "bg-teal-50", textColor: "text-teal-700", icon: "📅" },
          { label: "En riesgo (+60 días)", value: stats.risk, color: "bg-red-50", textColor: "text-red-600", icon: "⚠️" },
          { label: "Visitas promedio", value: stats.avgVisits, color: "bg-white", icon: "✶" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl border border-cream-300 p-5 shadow-sm`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className={`font-serif text-3xl ${s.textColor ?? "text-gray-800"}`}>{s.value}</div>
            <div className="font-sans text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nombre o email…" className="input-field pl-9 text-sm py-2" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { key: "all",    label: "Todas" },
            { key: "next",   label: `Con turno (${stats.next})` },
            { key: "active", label: "Activas" },
            { key: "risk",   label: `En riesgo (${stats.risk})` },
          ] as const).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`font-sans text-xs px-3 py-2 rounded-full border transition-all ${
                filter === f.key ? "bg-teal-400 text-white border-teal-400" : "bg-white text-gray-500 border-cream-300 hover:border-teal-200"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl border border-cream-300 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
          <p className="font-sans text-sm text-gray-400">No hay clientas con este filtro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.email} className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(expanded === c.email ? null : c.email)} className="w-full text-left p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-sans text-sm text-teal-600 font-medium">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans text-sm font-medium text-gray-800">{c.name}</h3>
                      <RiskBadge days={c.daysSinceLast} hasNext={!!c.nextBooking} />
                    </div>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">{c.email} · {c.phone}</p>
                  </div>
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="font-sans text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{c.totalVisits}</span> visita{c.totalVisits !== 1 ? "s" : ""}
                    </p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">{c.topService}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded === c.email ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expanded === c.email && (
                <div className="border-t border-cream-200 px-5 pb-5 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="font-sans text-xs text-gray-400">Visitas totales</p>
                      <p className="font-sans text-sm font-medium text-gray-700">{c.totalVisits}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-gray-400">Servicio favorito</p>
                      <p className="font-sans text-sm font-medium text-gray-700">{c.topService}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-gray-400">Última visita</p>
                      <p className="font-sans text-sm font-medium text-gray-700">
                        {c.daysSinceLast >= 0 ? fmtDate(c.visits.find(v => v.date <= new Date().toISOString().split("T")[0])?.date ?? c.lastBooking) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-gray-400">Próximo turno</p>
                      <p className="font-sans text-sm font-medium text-teal-600">
                        {c.nextBooking ? fmtDate(c.nextBooking) : "—"}
                      </p>
                    </div>
                  </div>

                  <p className="font-sans text-xs font-medium tracking-[0.1em] uppercase text-gray-400 mb-2">Historial</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {c.visits.map((v, i) => {
                      const tod = new Date().toISOString().split("T")[0];
                      const isFuture = v.date > tod;
                      return (
                        <div key={i} className={`flex items-center gap-3 text-xs font-sans py-1.5 px-3 rounded-lg ${isFuture ? "bg-teal-50" : "bg-cream-100"}`}>
                          <span className={isFuture ? "text-teal-600 font-medium" : "text-gray-500"}>{fmtDate(v.date)}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">{v.timeSlot} hs</span>
                          <span className="text-gray-400">·</span>
                          <span className={isFuture ? "text-teal-700" : "text-gray-600"}>{v.service}</span>
                          {isFuture && <span className="ml-auto text-teal-500 font-medium">próximo</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="font-sans text-xs text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      WhatsApp
                    </a>
                    <a href={`mailto:${c.email}`}
                      className="font-sans text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-full border border-cream-300 bg-white hover:bg-cream-100 transition-colors">
                      {c.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
