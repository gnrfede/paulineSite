"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Booking, BookingStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

// ── Types & constants ─────────────────────────────────────────────────────────
type ViewMode     = "list" | "day" | "week" | "month";
type StatusFilter = "all" | BookingStatus;

const MONTHS_LONG  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_SHORT = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const DAYS_SHORT   = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const STATUS_KEYS  = ["all","PENDING","CONFIRMED","REJECTED","CANCELLED"] as const;
const VIEW_LABELS  = { list:"Lista", day:"Día", week:"Semana", month:"Mes" } as const;

// ── Date helpers ──────────────────────────────────────────────────────────────
const toDate   = (s: string) => new Date(s + "T00:00:00");
const toISO    = (d: Date)   => d.toISOString().split("T")[0];
const todayStr = ()           => toISO(new Date());

function addDays(s: string, n: number): string {
  const d = toDate(s); d.setDate(d.getDate() + n); return toISO(d);
}
function weekDays(s: string): string[] {
  const mon = addDays(s, -((toDate(s).getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}
function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const pad   = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = Array(pad).fill(null);
  for (let d = 1; d <= last.getDate(); d++)
    cells.push(`${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
function fmtShort(s: string) {
  const [, m, d] = s.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}
function fmtLong(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}
function serviceSummary(b: Booking): string {
  try {
    if (b.serviceIds) {
      const ids: string[] = JSON.parse(b.serviceIds);
      if (ids.length > 1) return `${b.service?.name} +${ids.length - 1} más`;
    }
  } catch { /* ignore */ }
  return b.service?.name ?? "";
}

// ── BookingCard ───────────────────────────────────────────────────────────────
interface CardProps {
  booking:    Booking;
  compact?:   boolean;
  expandedId: string | null;
  adminNote:  string;
  updatingId: string | null;
  onExpand:   (id: string | null) => void;
  onNote:     (note: string) => void;
  onUpdate:   (id: string, status: BookingStatus, note?: string) => void;
}

function BookingCard({ booking: b, compact, expandedId, adminNote, updatingId, onExpand, onNote, onUpdate }: CardProps) {
  const isExpanded = expandedId === b.id;
  return (
    <div className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
      <div className={compact ? "p-3" : "p-5"}>
        <div className="flex items-start gap-3">
          <div className={`${compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} bg-teal-100 rounded-full flex items-center justify-center shrink-0 font-sans font-medium text-teal-600`}>
            {b.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-sans ${compact ? "text-xs" : "text-sm"} font-medium text-gray-800`}>{b.name}</h3>
              <span className={`status-badge ${STATUS_COLORS[b.status as BookingStatus]}`}>
                {STATUS_LABELS[b.status as BookingStatus]}
              </span>
            </div>
            <p className="font-sans text-xs text-gray-500 mt-0.5 truncate">
              {serviceSummary(b)}{!compact && ` · ${fmtLong(b.date)}`} · {b.timeSlot} hs
            </p>
            {!compact && (
              <>
                <p className="font-sans text-xs text-gray-400">{b.email} · {b.phone}</p>
                {b.notes && (
                  <p className="font-sans text-xs text-gray-500 italic mt-1.5 bg-cream-100 rounded-lg px-2 py-1">
                    &ldquo;{b.notes}&rdquo;
                  </p>
                )}
                {b.adminNote && (
                  <p className="font-sans text-xs text-teal-600 mt-1">
                    <strong>Nota:</strong> {b.adminNote}
                  </p>
                )}
              </>
            )}
          </div>
          {!compact && (
            <div className="flex gap-2 shrink-0">
              {b.status === "PENDING" && (
                <>
                  <button
                    onClick={() => onUpdate(b.id, "CONFIRMED")}
                    disabled={updatingId === b.id}
                    className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-500 text-white font-sans text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar
                  </button>
                  <button
                    onClick={() => onExpand(isExpanded ? null : b.id)}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 font-sans text-xs px-3 py-1.5 rounded-full transition-colors border border-red-200"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rechazar
                  </button>
                </>
              )}
              {(b.status === "CONFIRMED" || b.status === "REJECTED") && (
                <button
                  onClick={() => onUpdate(b.id, "CANCELLED")}
                  className="font-sans text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-full border border-cream-300 hover:bg-cream-100 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {!compact && isExpanded && (
        <div className="px-5 pb-5 border-t border-cream-200 pt-4">
          <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">
            Motivo del rechazo (opcional, se enviará al cliente)
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => onNote(e.target.value)}
            placeholder="Ej: No hay disponibilidad para ese horario."
            rows={2}
            className="input-field resize-none mb-3 text-xs"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(b.id, "REJECTED", adminNote)}
              disabled={updatingId === b.id}
              className="font-sans text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              Confirmar rechazo
            </button>
            <button
              onClick={() => { onExpand(null); onNote(""); }}
              className="font-sans text-xs text-gray-400 hover:text-gray-600 px-4 py-2 rounded-full border border-cream-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TurnosAdminPage() {
  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState<ViewMode>("list");
  const [refDate,      setRefDate]      = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search,       setSearch]       = useState("");
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [adminNote,    setAdminNote]    = useState("");
  const [selectedDay,  setSelectedDay]  = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/bookings").then((r) => r.json());
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = useMemo(() => bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
    }
    return true;
  }), [bookings, statusFilter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length, PENDING: 0, CONFIRMED: 0, REJECTED: 0, CANCELLED: 0 };
    bookings.forEach((b) => { c[b.status] = (c[b.status] ?? 0) + 1; });
    return c;
  }, [bookings]);

  const sortedFiltered = useMemo(() =>
    [...filtered].sort((a, b) =>
      a.date !== b.date ? a.date.localeCompare(b.date) : a.timeSlot.localeCompare(b.timeSlot)
    ), [filtered]);

  async function updateStatus(id: string, status: BookingStatus, note?: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(note !== undefined && { adminNote: note }) }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status, adminNote: note ?? b.adminNote } : b));
        setExpandedId(null);
        setAdminNote("");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function navigate(dir: 1 | -1) {
    if (view === "day")   { setRefDate((d) => addDays(d, dir)); return; }
    if (view === "week")  { setRefDate((d) => addDays(d, dir === 1 ? 7 : -7)); return; }
    if (view === "month") {
      const [y, m] = refDate.split("-").map(Number);
      setRefDate(toISO(new Date(y, m - 1 + dir, 1)));
    }
  }

  const navLabel = useMemo(() => {
    if (view === "day") return fmtLong(refDate);
    if (view === "week") {
      const days = weekDays(refDate);
      const [y2, m2] = days[6].split("-").map(Number);
      const [,  m1, d1] = days[0].split("-").map(Number);
      const [, ,  d2]   = days[6].split("-").map(Number);
      return m1 === m2
        ? `${d1}–${d2} ${MONTHS_SHORT[m1 - 1]} ${y2}`
        : `${fmtShort(days[0])} – ${fmtShort(days[6])} ${y2}`;
    }
    if (view === "month") {
      const [y, m] = refDate.split("-").map(Number);
      return `${MONTHS_LONG[m - 1]} ${y}`;
    }
    return "";
  }, [view, refDate]);

  const cardProps = {
    expandedId, adminNote, updatingId,
    onExpand: setExpandedId,
    onNote:   setAdminNote,
    onUpdate: updateStatus,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Turnos</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">Gestioná las reservas de clientes</p>
        </div>
        <button onClick={fetchBookings} className="btn-outline text-xs px-4 py-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* View switcher + date navigator */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex bg-cream-100 rounded-xl p-1 gap-1">
          {(["list","day","week","month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); setSelectedDay(null); }}
              className={`font-sans text-xs px-3 py-1.5 rounded-lg transition-all ${
                view === v ? "bg-white text-gray-800 shadow-sm font-medium" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>

        {view !== "list" && (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg border border-cream-300 bg-white hover:bg-cream-100 text-gray-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-sans text-sm text-gray-700 min-w-[160px] text-center capitalize">{navLabel}</span>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg border border-cream-300 bg-white hover:bg-cream-100 text-gray-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={() => setRefDate(todayStr())} className="font-sans text-xs text-teal-600 px-2.5 py-1 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 transition-colors">
              Hoy
            </button>
          </div>
        )}
      </div>

      {/* List: search + status filters with counts */}
      {view === "list" && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nombre o email…"
              className="input-field pl-9 text-sm py-2"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_KEYS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`font-sans text-xs px-3 py-2 rounded-full border transition-all flex items-center gap-1.5 ${
                  statusFilter === s ? "bg-teal-400 text-white border-teal-400" : "bg-white text-gray-500 border-cream-300 hover:border-teal-200"
                }`}
              >
                {s === "all" ? "Todos" : STATUS_LABELS[s]}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  statusFilter === s ? "bg-white/25 text-white" : "bg-cream-100 text-gray-400"
                }`}>{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar views: status filter */}
      {view !== "list" && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          {STATUS_KEYS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-all ${
                statusFilter === s ? "bg-teal-400 text-white border-teal-400" : "bg-white text-gray-500 border-cream-300 hover:border-teal-200"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-cream-300 animate-pulse" />
          ))}
        </div>

      ) : view === "list" ? (
        sortedFiltered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
            <p className="font-sans text-sm text-gray-400">No hay turnos con este filtro.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedFiltered.map((b) => <BookingCard key={b.id} booking={b} {...cardProps} />)}
          </div>
        )

      ) : view === "day" ? (
        (() => {
          const day = filtered
            .filter((b) => b.date === refDate)
            .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
          return day.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
              <p className="font-sans text-sm text-gray-400">Sin turnos para este día.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {day.map((b) => (
                <div key={b.id} className="flex gap-4 items-start">
                  <div className="w-14 shrink-0 pt-[22px] text-right">
                    <span className="font-sans text-sm font-semibold text-teal-600">{b.timeSlot}</span>
                  </div>
                  <div className="flex-1"><BookingCard booking={b} {...cardProps} /></div>
                </div>
              ))}
            </div>
          );
        })()

      ) : view === "week" ? (
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="grid grid-cols-7 gap-2 min-w-[560px]">
            {weekDays(refDate).map((day) => {
              const [, m, d] = day.split("-").map(Number);
              const dow      = (toDate(day).getDay() + 6) % 7;
              const isToday  = day === todayStr();
              const dayBkgs  = filtered.filter((b) => b.date === day).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
              return (
                <div key={day} className={`rounded-2xl border p-2 min-h-[140px] ${isToday ? "border-teal-300 bg-teal-50/40" : "border-cream-300 bg-white"}`}>
                  <div className={`text-center mb-2 pb-2 border-b ${isToday ? "border-teal-200" : "border-cream-200"}`}>
                    <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wide">{DAYS_SHORT[dow]}</p>
                    <p className={`font-sans text-xl font-bold ${isToday ? "text-teal-500" : "text-gray-700"}`}>{d}</p>
                    <p className="font-sans text-[10px] text-gray-400">{MONTHS_SHORT[m - 1]}</p>
                  </div>
                  <div className="space-y-1">
                    {dayBkgs.length === 0
                      ? <p className="font-sans text-[10px] text-gray-300 text-center py-3">—</p>
                      : dayBkgs.map((b) => (
                          <div
                            key={b.id}
                            title={`${b.timeSlot} · ${b.name} · ${b.service?.name}`}
                            className={`rounded-lg px-1.5 py-1 text-[10px] font-sans ${
                              b.status === "CONFIRMED" ? "bg-teal-100 text-teal-700" :
                              b.status === "PENDING"   ? "bg-amber-100 text-amber-700" :
                              b.status === "CANCELLED" ? "bg-gray-100 text-gray-400" :
                                                         "bg-red-100 text-red-600"
                            }`}
                          >
                            <span className="font-semibold">{b.timeSlot}</span> {b.name.split(" ")[0]}
                            <div className="truncate opacity-75 text-[9px]">{b.service?.name}</div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      ) : (
        (() => {
          const [y, m] = refDate.split("-").map(Number);
          const cells  = monthGrid(y, m - 1);
          const td     = todayStr();
          return (
            <div>
              <div className="grid grid-cols-7 mb-1">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center font-sans text-[11px] font-medium text-gray-400 py-2 tracking-wide">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const [, , d]   = day.split("-").map(Number);
                  const dayBkgs   = filtered.filter((b) => b.date === day);
                  const pending   = dayBkgs.filter((b) => b.status === "PENDING").length;
                  const confirmed = dayBkgs.filter((b) => b.status === "CONFIRMED").length;
                  const isToday   = day === td;
                  const isSel     = day === selectedDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSel ? null : day)}
                      className={`rounded-xl p-2 min-h-[72px] text-left transition-all ${
                        isSel   ? "ring-2 ring-teal-400 bg-teal-50" :
                        isToday ? "bg-teal-50 border-2 border-teal-300" :
                                  "bg-white border border-cream-300 hover:border-teal-200 hover:shadow-sm"
                      }`}
                    >
                      <span className={`font-sans text-xs font-semibold ${isToday ? "text-teal-600" : "text-gray-600"}`}>{d}</span>
                      <div className="mt-1 space-y-0.5">
                        {confirmed > 0 && (
                          <div className="font-sans text-[10px] bg-teal-100 text-teal-700 rounded px-1 leading-4">
                            {confirmed} conf.
                          </div>
                        )}
                        {pending > 0 && (
                          <div className="font-sans text-[10px] bg-amber-100 text-amber-700 rounded px-1 leading-4">
                            {pending} pend.
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (() => {
                const dayBkgs = filtered
                  .filter((b) => b.date === selectedDay)
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
                return (
                  <div className="mt-4 bg-white rounded-2xl border border-cream-300 shadow-sm">
                    <div className="flex items-center justify-between p-5 border-b border-cream-200">
                      <h3 className="font-sans text-sm font-medium text-gray-700 capitalize">{fmtLong(selectedDay)}</h3>
                      <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-5">
                      {dayBkgs.length === 0 ? (
                        <p className="font-sans text-sm text-gray-400">Sin turnos para este día.</p>
                      ) : (
                        <div className="space-y-3">
                          {dayBkgs.map((b) => <BookingCard key={b.id} booking={b} {...cardProps} />)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()
      )}
    </div>
  );
}
