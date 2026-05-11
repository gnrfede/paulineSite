"use client";

import { useState, useEffect, useCallback } from "react";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlots } from "./TimeSlots";
import type { Service } from "@/types";

type Step = 1 | 2 | 3;

interface FormData {
  serviceIds: string[];
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const INITIAL_FORM: FormData = {
  serviceIds: [],
  date: "",
  timeSlot: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
};

interface ConfirmedBooking {
  id: string;
  service: Service;
  allServices?: Service[];
  date: string;
  timeSlot: string;
  name: string;
  status: string;
}

const MONTH_NAMES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} de ${MONTH_NAMES_ES[month - 1]} de ${year}`;
}

export function BookingForm({ services }: { services: Service[] }) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);
  const [serverError, setServerError] = useState("");
  const [monthAvailability, setMonthAvailability] = useState<Record<string, number>>({});
  const [availLoading, setAvailLoading] = useState(false);

  const selectedServices = services.filter((s) => form.serviceIds.includes(s.id));

  function toggleService(id: string) {
    setForm((f) => {
      const already = f.serviceIds.includes(id);
      return {
        ...f,
        serviceIds: already
          ? f.serviceIds.filter((sid) => sid !== id)
          : [...f.serviceIds, id],
        date: "",
        timeSlot: "",
      };
    });
    setErrors((e) => ({ ...e, serviceIds: "" }));
    setSlots([]);
  }

  const fetchSlots = useCallback(async () => {
    if (form.serviceIds.length === 0 || !form.date) return;
    setSlotsLoading(true);
    setForm((f) => ({ ...f, timeSlot: "" }));
    try {
      const ids = form.serviceIds.join(",");
      const res = await fetch(`/api/availability?serviceIds=${ids}&date=${form.date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [form.serviceIds, form.date]);

  const fetchMonthAvailability = useCallback(async (year: number, month: number) => {
    setAvailLoading(true);
    try {
      const res = await fetch(`/api/availability/month?year=${year}&month=${month}`);
      const data = await res.json();
      setMonthAvailability((prev) => ({ ...prev, ...data.availability }));
    } catch {
      // silently ignore — calendar degrades gracefully
    } finally {
      setAvailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (form.serviceIds.length > 0 && form.date) fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (form.serviceIds.length > 0) {
      const now = new Date();
      fetchMonthAvailability(now.getFullYear(), now.getMonth() + 1);
    } else {
      setMonthAvailability({});
    }
  }, [form.serviceIds, fetchMonthAvailability]);

  function setField(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (form.serviceIds.length === 0) errs.serviceIds = "Seleccioná al menos un servicio";
    if (!form.date) errs.date = "Seleccioná una fecha";
    if (!form.timeSlot) errs.timeSlot = "Seleccioná un horario";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Ingresá tu nombre completo";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Email inválido";
    if (!form.phone.match(/^[\d\s\+\-\(\)]{8,20}$/)) errs.phone = "Teléfono inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds: form.serviceIds,
          date: form.date,
          timeSlot: form.timeSlot,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Error al crear el turno. Intentá de nuevo.");
        return;
      }
      setConfirmed(data);
    } catch {
      setServerError("Error de conexión. Verificá tu internet e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    const serviceNames = (confirmed.allServices ?? [confirmed.service])
      .map((s) => s.name)
      .join(", ");

    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl text-gray-800 mb-3">¡Solicitud enviada!</h2>
        <p className="font-sans text-sm text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Tu turno está en estado <strong className="text-amber-600">pendiente de confirmación</strong>. Paula te avisa por email o WhatsApp.
        </p>

        <div className="bg-cream-100 rounded-2xl p-5 max-w-sm mx-auto text-left mb-8 space-y-3">
          <div>
            <p className="font-sans text-xs text-gray-400">Servicios</p>
            <p className="font-sans text-sm font-medium text-gray-700">{serviceNames}</p>
          </div>
          <div>
            <p className="font-sans text-xs text-gray-400">Fecha y hora</p>
            <p className="font-sans text-sm font-medium text-gray-700">
              {formatDate(confirmed.date)} · {confirmed.timeSlot} hs
            </p>
          </div>
          <div>
            <p className="font-sans text-xs text-gray-400">Código de reserva</p>
            <p className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded mt-1 inline-block">
              {confirmed.id}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/5491134193424?text=Hola Paula! Hice una reserva online: ${serviceNames} para el ${formatDate(confirmed.date)} a las ${confirmed.timeSlot} hs. Código: ${confirmed.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Confirmar por WhatsApp
          </a>
          <button
            onClick={() => { setConfirmed(null); setForm(INITIAL_FORM); setStep(1); }}
            className="btn-outline"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-sans transition-colors ${
              step === s ? "bg-teal-400 text-white" : step > s ? "bg-teal-100 text-teal-600" : "bg-cream-200 text-gray-400"
            }`}>
              {step > s ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : s}
            </div>
            <span className={`font-sans text-xs ${step === s ? "text-teal-600 font-medium" : "text-gray-400"}`}>
              {s === 1 ? "Servicios y fecha" : s === 2 ? "Tus datos" : "Confirmación"}
            </span>
            {s < 3 && <div className="w-6 h-px bg-cream-300 hidden sm:block" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <div>
            <label className="block font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-1">
              Elegí uno o más servicios
            </label>
            <p className="font-sans text-xs text-gray-400 mb-3">Podés combinar varios tratamientos en un mismo turno.</p>

            <div className="grid grid-cols-1 gap-2">
              {services.map((srv) => {
                const selected = form.serviceIds.includes(srv.id);
                return (
                  <button
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 ${
                      selected
                        ? "border-teal-400 bg-teal-50"
                        : "border-cream-300 bg-white hover:border-teal-200 hover:bg-cream-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected ? "bg-teal-400 border-teal-400" : "border-gray-300"
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-sans text-sm font-medium ${selected ? "text-teal-700" : "text-gray-700"}`}>
                        {srv.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedServices.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-xs font-sans px-2.5 py-1 rounded-full">
                    {s.name}
                    <button
                      onClick={() => toggleService(s.id)}
                      className="ml-0.5 hover:text-teal-900"
                      aria-label={`Quitar ${s.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.serviceIds && <p className="font-sans text-xs text-red-500 mt-2">{errors.serviceIds}</p>}
          </div>

          {form.serviceIds.length > 0 && (
            <div>
              <label className="block font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">
                Elegí una fecha
              </label>
              <BookingCalendar
                selectedDate={form.date}
                onSelectDate={(d) => setField("date", d)}
                availabilityMap={form.serviceIds.length > 0 ? monthAvailability : undefined}
                loadingAvailability={availLoading}
                onMonthChange={(year, month) => fetchMonthAvailability(year, month)}
              />
              {errors.date && <p className="font-sans text-xs text-red-500 mt-2">{errors.date}</p>}
            </div>
          )}

          {form.date && (
            <div>
              <label className="block font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">
                Elegí un horario
              </label>
              <TimeSlots
                slots={slots}
                selected={form.timeSlot}
                onSelect={(t) => setField("timeSlot", t)}
                loading={slotsLoading}
              />
              {errors.timeSlot && <p className="font-sans text-xs text-red-500 mt-2">{errors.timeSlot}</p>}
            </div>
          )}

          <button
            onClick={nextStep}
            disabled={form.serviceIds.length === 0 || !form.date || !form.timeSlot}
            className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
            <p className="font-sans text-xs text-teal-600 font-medium mb-1">
              {selectedServices.map((s) => s.name).join(" + ")}
            </p>
            <p className="font-sans text-sm text-gray-600">
              {formatDate(form.date)} · {form.timeSlot} hs
            </p>
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Nombre completo *</label>
            <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
              placeholder="Tu nombre completo"
              className={`input-field ${errors.name ? "border-red-300" : ""}`} />
            {errors.name && <p className="font-sans text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)}
              placeholder="tu@email.com"
              className={`input-field ${errors.email ? "border-red-300" : ""}`} />
            {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">WhatsApp / Teléfono *</label>
            <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)}
              placeholder="+54 11 1234 5678"
              className={`input-field ${errors.phone ? "border-red-300" : ""}`} />
            {errors.phone && <p className="font-sans text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">Notas (opcional)</label>
            <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)}
              placeholder="Contame sobre tu piel, alergias, o cualquier consulta..."
              rows={3} className="input-field resize-none" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">Atrás</button>
            <button onClick={nextStep} className="btn-primary flex-1 justify-center">Revisar reserva</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-cream-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-lg text-gray-800">Resumen de tu reserva</h3>
            <div className="divide-y divide-cream-200">
              {[
                { label: "Servicios", value: selectedServices.map((s) => s.name).join(", ") },
                { label: "Fecha", value: formatDate(form.date) },
                { label: "Horario", value: `${form.timeSlot} hs` },
                { label: "Nombre", value: form.name },
                { label: "Email", value: form.email },
                { label: "Teléfono", value: form.phone },
                ...(form.notes ? [{ label: "Notas", value: form.notes }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2.5">
                  <span className="font-sans text-xs text-gray-400">{row.label}</span>
                  <span className="font-sans text-sm text-gray-700 text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-sans text-xs text-amber-700 leading-relaxed">
              <strong>Importante:</strong> Tu reserva quedará <em>pendiente</em> hasta que Paula la confirme. Te avisamos por email o WhatsApp.
            </p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-sans text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 justify-center">Editar</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : "Confirmar reserva"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
