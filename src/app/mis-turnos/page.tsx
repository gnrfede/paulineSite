"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Booking, BookingStatus } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}

export default function MisTurnosPage() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Ingresá un email válido");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const res = await fetch(`/api/my-bookings?email=${encodeURIComponent(emailTrimmed)}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-100 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="section-label justify-center mb-4">Mis reservas</p>
            <h1 className="font-serif text-4xl font-normal text-gray-800 mb-3">
              Consultá tus <em className="italic text-teal-500">turnos</em>
            </h1>
            <p className="font-sans text-sm text-gray-500">
              Ingresá el email con el que hiciste tu reserva para ver tu historial.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-cream-300 p-6 shadow-sm mb-6">
            <label className="block font-sans text-xs font-medium text-gray-500 mb-2">
              Tu email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@email.com"
                className="input-field flex-1"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary shrink-0 disabled:opacity-60"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Buscar"
                )}
              </button>
            </div>
            {error && <p className="font-sans text-xs text-red-500 mt-2">{error}</p>}
          </form>

          {/* Results */}
          {searched && (
            <div>
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-cream-300">
                  <div className="w-12 h-12 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm text-gray-500">No encontramos reservas para este email.</p>
                  <p className="font-sans text-xs text-gray-400 mt-1">
                    ¿Querés hacer una nueva reserva?{" "}
                    <a href="/reservar" className="text-teal-500 hover:underline">Reservar turno</a>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-sans text-xs text-gray-400">
                    {bookings.length} reserva{bookings.length !== 1 ? "s" : ""} encontrada{bookings.length !== 1 ? "s" : ""}
                  </p>
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-sans text-sm font-medium text-gray-800">
                            {booking.service?.name}
                          </h3>
                          <p className="font-sans text-xs text-gray-500 mt-0.5">
                            {formatDate(booking.date)} · {booking.timeSlot} hs
                          </p>
                        </div>
                        <span className={`status-badge ${STATUS_COLORS[booking.status as BookingStatus]}`}>
                          {STATUS_LABELS[booking.status as BookingStatus]}
                        </span>
                      </div>

                      {booking.adminNote && (
                        <div className="bg-cream-100 rounded-xl px-3 py-2 mt-2">
                          <p className="font-sans text-xs text-gray-500">
                            <strong>Nota:</strong> {booking.adminNote}
                          </p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-cream-200 mt-3 flex items-center justify-between">
                        <p className="font-mono text-xs text-gray-300">{booking.id}</p>
                        {booking.status === "PENDING" && (
                          <a
                            href={`https://wa.me/5491134193424?text=Hola Paula, tengo una reserva pendiente. Código: ${booking.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-xs text-teal-500 hover:text-teal-600"
                          >
                            Consultar por WhatsApp →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
