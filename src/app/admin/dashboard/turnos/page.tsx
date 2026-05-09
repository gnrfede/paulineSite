"use client";

import { useState, useEffect, useCallback } from "react";
import type { Booking, BookingStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

const MONTH_NAMES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

type StatusFilter = "all" | BookingStatus;

export default function TurnosAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const url =
      statusFilter === "all"
        ? "/api/bookings"
        : `/api/bookings?status=${statusFilter}`;
    const res = await fetch(url);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function updateStatus(id: string, status: BookingStatus, note?: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(note !== undefined ? { adminNote: note } : {}) }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status, adminNote: note ?? b.adminNote } : b))
        );
        setExpandedId(null);
        setAdminNote("");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const filterCounts = {
    all: bookings.length,
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-800">Turnos</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">Gestioná las reservas de clientes</p>
        </div>
        <button
          onClick={fetchBookings}
          className="btn-outline text-xs px-4 py-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "PENDING", "CONFIRMED", "REJECTED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`font-sans text-xs px-4 py-2 rounded-full border transition-all ${
              statusFilter === s
                ? "bg-teal-400 text-white border-teal-400"
                : "bg-white text-gray-500 border-cream-300 hover:border-teal-200"
            }`}
          >
            {s === "all" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-cream-300 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
          <p className="font-sans text-sm text-gray-400">No hay turnos con este filtro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-sans text-sm text-teal-600 font-medium">
                      {booking.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans text-sm font-medium text-gray-800">{booking.name}</h3>
                      <span className={`status-badge ${STATUS_COLORS[booking.status as BookingStatus]}`}>
                        {STATUS_LABELS[booking.status as BookingStatus]}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-gray-500 mt-0.5">
                      {booking.serviceIds
                        ? (JSON.parse(booking.serviceIds) as string[]).length > 1
                          ? `${booking.service?.name} +${(JSON.parse(booking.serviceIds) as string[]).length - 1} más`
                          : booking.service?.name
                        : booking.service?.name} · {formatDate(booking.date)} · {booking.timeSlot} hs
                    </p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">
                      {booking.email} · {booking.phone}
                    </p>
                    {booking.notes && (
                      <p className="font-sans text-xs text-gray-500 italic mt-1 bg-cream-100 rounded-lg px-2 py-1">
                        &ldquo;{booking.notes}&rdquo;
                      </p>
                    )}
                    {booking.adminNote && (
                      <p className="font-sans text-xs text-teal-600 mt-1">
                        <strong>Nota:</strong> {booking.adminNote}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, "CONFIRMED")}
                          disabled={updatingId === booking.id}
                          className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-500 text-white font-sans text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmar
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 font-sans text-xs px-3 py-1.5 rounded-full transition-colors border border-red-200"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </button>
                      </>
                    )}
                    {(booking.status === "CONFIRMED" || booking.status === "REJECTED") && (
                      <button
                        onClick={() => updateStatus(booking.id, "CANCELLED")}
                        className="font-sans text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-full border border-cream-300 hover:bg-cream-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reject panel */}
              {expandedId === booking.id && (
                <div className="px-5 pb-5 border-t border-cream-200 pt-4">
                  <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">
                    Motivo del rechazo (opcional, se mostrará al cliente)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ej: No hay disponibilidad para ese horario. Te contacto para reprogramar."
                    rows={2}
                    className="input-field resize-none mb-3 text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(booking.id, "REJECTED", adminNote)}
                      disabled={updatingId === booking.id}
                      className="font-sans text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                    >
                      Confirmar rechazo
                    </button>
                    <button
                      onClick={() => { setExpandedId(null); setAdminNote(""); }}
                      className="font-sans text-xs text-gray-400 hover:text-gray-600 px-4 py-2 rounded-full border border-cream-300 transition-colors"
                    >
                      Cancelar
                    </button>
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
