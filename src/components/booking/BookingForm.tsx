"use client";

import { useState, useEffect, useCallback } from "react";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlots } from "./TimeSlots";
import type { Service } from "@/types";

type Step = 1 | 2 | 3;

interface FormData {
  serviceId: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const INITIAL_FORM: FormData = {
  serviceId: "",
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

  const selectedService = services.find((s) => s.id === form.serviceId);

  // Fetch available slots when date or service changes
  const fetchSlots = useCallback(async () => {
    if (!form.serviceId || !form.date) return;
    setSlotsLoading(true);
    setForm((f) => ({ ...f, timeSlot: "" }));
    try {
      const res = await fetch(
        `/api/availability?serviceId=${form.serviceId}&date=${form.date}`
      );
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [form.serviceId, form.date]);

  useEffect(() => {
    if (form.serviceId && form.date) fetchSlots();
  }, [fetchSlots]);

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!form.serviceId) errs.serviceId = "Seleccioná un servicio";
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
          serviceId: form.serviceId,
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

  // Success screen
  if (confirmed) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl text-gray-800 mb-3">¡Solicitud enviada!</h2>
        <p className="font-sans text-sm text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Tu turno está en estado <strong className="text-amber-600">pendiente de confirmación</strong>. Te avisamos por email o WhatsApp cuando Paula lo confirme.
        </p>

        <div className="bg-cream-100 rounded-2xl p-5 max-w-sm mx-auto text-left mb-8 space-y-3">
          <div>
            <p className="font-sans text-xs text-gray-400 tracking-wide">Servicio</p>
            <p className="font-sans text-sm font-medium text-gray-700">{confirmed.service?.name}</p>
          </div>
          <div>
            <p className="font-sans text-xs text-gray-400 tracking-wide">Fecha y hora</p>
            <p className="font-sans text-sm font-medium text-gray-700">
              {formatDate(confirmed.date)} · {confirmed.timeSlot} hs
            </p>
          </div>
          <div>
            <p className="font-sans text-xs text-gray-400 tracking-wide">Código de reserva</p>
            <p className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded mt-1 inline-block">
              {confirmed.id}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/5491134193424?text=Hola Paula! Hice una reserva online: ${confirmed.service?.name} para el ${formatDate(confirmed.date)} a las ${confirmed.timeSlot} hs. Código: ${confirmed.id}`}
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
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-sans transition-colors ${
                step === s
                  ? "bg-teal-400 text-white"
                  : step > s
                  ? "bg-teal-100 text-teal-600"
                  : "bg-cream-200 text-gray-400"
              }`}
            >
              {step > s ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s
              )}
            </div>
            <span className={`font-sans text-xs ${step === s ? "text-teal-600 font-medium" : "text-gray-400"}`}>
              {s === 1 ? "Servicio y fecha" : s === 2 ? "Tus datos" : "Confirmación"}
            </span>
            {s < 3 && <div className="w-6 h-px bg-cream-300 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step 1: Service + Date + Time */}
      {step === 1 && (
        <div className="space-y-8">
          {/* Service selector */}
          <div>
            <label className="block font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">
              Elegí tu servicio
            </label>
            <div className="grid grid-cols-1 gap-2">
              {services.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => set("serviceId", srv.id)}
                  className={`
                    text-left p-4 rounded-xl border transition-all duration-150
                    ${
                      form.serviceId === srv.id
                        ? "border-teal-400 bg-teal-50"
                        : "border-cream-300 bg-white hover:border-teal-200 hover:bg-cream-50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-sans text-sm font-medium ${form.serviceId === srv.id ? "text-teal-700" : "text-gray-700"}`}>
                        {srv.name}
                      </p>
                    </div>
                    {form.serviceId === srv.id && (
                      <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.serviceId && <p className="font-sans text-xs text-red-500 mt-2">{errors.serviceId}</p>}
          </div>

          {/* Calendar */}
          {form.serviceId && (
            <div>
              <label className="block font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">
                Elegí una fecha
              </label>
              <BookingCalendar
                selectedDate={form.date}
                onSelectDate={(d) => set("date", d)}
              />
              {errors.date && <p className="font-sans text-xs text-red-500 mt-2">{errors.date}</p>}
            </div>
          )}

          {/* Time slots */}
          {form.date && (
            <div>
              <label className="block font-sans text-xs font-medium tracking-[0.12em] uppercase text-gray-500 mb-3">
                Elegí un horario
              </label>
              <TimeSlots
                slots={slots}
                selected={form.timeSlot}
                onSelect={(t) => set("timeSlot", t)}
                loading={slotsLoading}
              />
              {errors.timeSlot && <p className="font-sans text-xs text-red-500 mt-2">{errors.timeSlot}</p>}
            </div>
          )}

          <button
            onClick={nextStep}
            disabled={!form.serviceId || !form.date || !form.timeSlot}
            className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )}

      {/* Step 2: Customer details */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
            <p className="font-sans text-xs text-teal-600 font-medium mb-1">{selectedService?.name}</p>
            <p className="font-sans text-sm text-gray-600">
              {formatDate(form.date)} · {form.timeSlot} hs
            </p>
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Tu nombre completo"
              className={`input-field ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            {errors.name && <p className="font-sans text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="tu@email.com"
              className={`input-field ${errors.email ? "border-red-300" : ""}`}
            />
            {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">
              WhatsApp / Teléfono *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+54 11 1234 5678"
              className={`input-field ${errors.phone ? "border-red-300" : ""}`}
            />
            {errors.phone && <p className="font-sans text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-gray-500 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Contame sobre tu piel, alergias, o cualquier consulta..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="btn-outline flex-1 justify-center"
            >
              Atrás
            </button>
            <button
              onClick={nextStep}
              className="btn-primary flex-1 justify-center"
            >
              Revisar reserva
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review + Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-cream-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-lg text-gray-800">Resumen de tu reserva</h3>

            <div className="divide-y divide-cream-200">
              {[
                { label: "Servicio", value: selectedService?.name || "" },
                { label: "Fecha", value: formatDate(form.date) },
                { label: "Horario", value: `${form.timeSlot} hs` },
                { label: "Duración", value: `${selectedService?.duration} min` },
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
              <strong>Importante:</strong> Tu reserva quedará en estado <em>pendiente</em> hasta que Paula la confirme. Recibirás una notificación por email o WhatsApp.
            </p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-sans text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 justify-center">
              Editar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                "Confirmar reserva"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
