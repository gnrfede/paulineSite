"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { TimeSlots } from "@/components/booking/TimeSlots";
import type { Service } from "@/types";

const MONTHS_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function fmtDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${MONTHS_ES[m - 1]} ${y}`;
}

export default function NuevaReservaPage() {
  const router = useRouter();

  const [services,         setServices]         = useState<Service[]>([]);
  const [servicesLoading,  setServicesLoading]  = useState(true);
  const [serviceIds,       setServiceIds]       = useState<string[]>([]);
  const [date,             setDate]             = useState("");
  const [timeSlot,         setTimeSlot]         = useState("");
  const [name,             setName]             = useState("");
  const [email,            setEmail]            = useState("");
  const [phone,            setPhone]            = useState("");
  const [notes,            setNotes]            = useState("");
  const [confirmed,        setConfirmed]        = useState(true);
  const [slots,            setSlots]            = useState<string[]>([]);
  const [slotsLoading,     setSlotsLoading]     = useState(false);
  const [monthAvail,       setMonthAvail]       = useState<Record<string, number>>({});
  const [availLoading,     setAvailLoading]     = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [errors,           setErrors]           = useState<Record<string, string>>({});
  const [success,          setSuccess]          = useState<{ id: string; name: string; date: string; timeSlot: string } | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d.filter((s: Service) => s.active) : []))
      .finally(() => setServicesLoading(false));
  }, []);

  useEffect(() => {
    if (serviceIds.length === 0 || !date) { setSlots([]); return; }
    setSlotsLoading(true);
    setTimeSlot("");
    fetch(`/api/availability?serviceIds=${serviceIds.join(",")}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [serviceIds, date]);

  const fetchMonthAvail = useCallback(async (year: number, month: number) => {
    setAvailLoading(true);
    try {
      const d = await fetch(`/api/availability/month?year=${year}&month=${month}`).then((r) => r.json());
      setMonthAvail((prev) => ({ ...prev, ...d.availability }));
    } catch { /* ignore */ }
    finally { setAvailLoading(false); }
  }, []);

  useEffect(() => {
    if (serviceIds.length > 0) {
      const now = new Date();
      fetchMonthAvail(now.getFullYear(), now.getMonth() + 1);
    } else {
      setMonthAvail({});
      setDate("");
      setTimeSlot("");
    }
  }, [serviceIds, fetchMonthAvail]);

  function toggleService(id: string) {
    setServiceIds((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
    setErrors((e) => ({ ...e, serviceIds: "" }));
    setDate("");
    setTimeSlot("");
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (serviceIds.length === 0) errs.serviceIds = "Seleccioná al menos un servicio";
    if (!date)     errs.date     = "Seleccioná una fecha";
    if (!timeSlot) errs.timeSlot = "Seleccioná un horario";
    if (!name.trim() || name.trim().length < 2) errs.name = "Nombre requerido";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Email inválido";
    if (!phone.match(/^[\d\s\+\-\(\)]{8,20}$/))     errs.phone = "Teléfono inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds, date, timeSlot,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ _: data.error || "Error al crear el turno" }); return; }

      if (confirmed) {
        await fetch(`/api/bookings/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CONFIRMED" }),
        });
      }

      setSuccess({ id: data.id, name: name.trim(), date, timeSlot });
    } catch {
      setErrors({ _: "Error de conexión" });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 max-w-lg">
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-gray-800 mb-2">Turno creado</h2>
          <p className="font-sans text-sm text-gray-500 mb-6">
            {success.name} · {fmtDate(success.date)} · {success.timeSlot} hs
          </p>
          <p className="font-mono text-xs text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg inline-block mb-6">
            {success.id}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(null);
                setServiceIds([]); setDate(""); setTimeSlot("");
                setName(""); setEmail(""); setPhone(""); setNotes("");
                setErrors({});
              }}
              className="btn-outline"
            >
              Nueva reserva
            </button>
            <button onClick={() => router.push("/admin/dashboard/turnos")} className="btn-primary">
              Ver turnos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-800">Nueva reserva</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">Creá un turno en nombre de un cliente</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: service + date + time */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-5">
              <h2 className="font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">Servicios</h2>
              {servicesLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map((i) => <div key={i} className="h-10 bg-cream-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((srv) => {
                    const sel = serviceIds.includes(srv.id);
                    return (
                      <button key={srv.id} type="button" onClick={() => toggleService(srv.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                          sel ? "border-teal-400 bg-teal-50" : "border-cream-300 bg-white hover:border-teal-200"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          sel ? "bg-teal-400 border-teal-400" : "border-gray-300"
                        }`}>
                          {sel && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-sans text-sm ${sel ? "text-teal-700 font-medium" : "text-gray-700"}`}>{srv.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.serviceIds && <p className="font-sans text-xs text-red-500 mt-2">{errors.serviceIds}</p>}
            </div>

            {serviceIds.length > 0 && (
              <div>
                <p className="font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-2">Fecha</p>
                <BookingCalendar
                  selectedDate={date}
                  onSelectDate={(d) => { setDate(d); setErrors((e) => ({ ...e, date: "" })); }}
                  availabilityMap={monthAvail}
                  loadingAvailability={availLoading}
                  onMonthChange={fetchMonthAvail}
                />
                {errors.date && <p className="font-sans text-xs text-red-500 mt-2">{errors.date}</p>}
              </div>
            )}

            {date && (
              <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-5">
                <h2 className="font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">Horario</h2>
                <TimeSlots
                  slots={slots}
                  selected={timeSlot}
                  onSelect={(t) => { setTimeSlot(t); setErrors((e) => ({ ...e, timeSlot: "" })); }}
                  loading={slotsLoading}
                />
                {errors.timeSlot && <p className="font-sans text-xs text-red-500 mt-2">{errors.timeSlot}</p>}
              </div>
            )}
          </div>

          {/* Right: customer info + submit */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-5 space-y-4">
              <h2 className="font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500">Datos del cliente</h2>

              <div>
                <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Nombre completo *</label>
                <input type="text" value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((err) => ({ ...err, name: "" })); }}
                  placeholder="Nombre y apellido"
                  className={`input-field ${errors.name ? "border-red-300" : ""}`} />
                {errors.name && <p className="font-sans text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((err) => ({ ...err, email: "" })); }}
                  placeholder="cliente@email.com" inputMode="email"
                  className={`input-field ${errors.email ? "border-red-300" : ""}`} />
                {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Teléfono *</label>
                <input type="tel" value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((err) => ({ ...err, phone: "" })); }}
                  placeholder="+54 11 1234 5678"
                  className={`input-field ${errors.phone ? "border-red-300" : ""}`} />
                {errors.phone && <p className="font-sans text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Notas (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Consultas, alergias, preferencias..."
                  rows={3} className="input-field resize-none" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream-300 shadow-sm p-5">
              <h2 className="font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">Estado del turno</h2>
              <div className="flex gap-3">
                {[
                  { value: true,  label: "Confirmado", desc: "El cliente recibe email de confirmación" },
                  { value: false, label: "Pendiente",  desc: "Queda en espera de confirmación manual" },
                ].map((opt) => (
                  <button key={String(opt.value)} type="button" onClick={() => setConfirmed(opt.value)}
                    className={`flex-1 text-left p-3 rounded-xl border transition-all ${
                      confirmed === opt.value ? "border-teal-400 bg-teal-50" : "border-cream-300 bg-white hover:border-teal-200"
                    }`}
                  >
                    <p className={`font-sans text-sm font-medium ${confirmed === opt.value ? "text-teal-700" : "text-gray-700"}`}>{opt.label}</p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {(serviceIds.length > 0 || date || timeSlot) && (
              <div className="bg-cream-100 rounded-2xl p-4 space-y-2">
                <p className="font-sans text-xs font-medium tracking-[0.1em] uppercase text-gray-400">Resumen</p>
                {serviceIds.length > 0 && (
                  <p className="font-sans text-sm text-gray-700">
                    {services.filter((s) => serviceIds.includes(s.id)).map((s) => s.name).join(" + ")}
                  </p>
                )}
                {date && timeSlot && (
                  <p className="font-sans text-sm text-teal-600 font-medium">{fmtDate(date)} · {timeSlot} hs</p>
                )}
                {name && <p className="font-sans text-sm text-gray-600">{name}</p>}
              </div>
            )}

            {errors._ && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="font-sans text-sm text-red-600">{errors._}</p>
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando turno...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear turno
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
