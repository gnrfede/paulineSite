"use client";

import { useState, useEffect } from "react";

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slots: string | null;
  active: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string | null;
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function HorariosAdminPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [scRes, bdRes] = await Promise.all([
      fetch("/api/schedules"),
      fetch("/api/blocked-dates"),
    ]);
    setSchedules(await scRes.json());
    setBlockedDates(await bdRes.json());
    setLoading(false);
  }

  function handleChange(id: string, field: keyof Schedule, value: string | boolean | null) {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function saveSchedule(schedule: Schedule) {
    setSavingId(schedule.id);
    await fetch(`/api/schedules/${schedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active: schedule.active,
        slots: schedule.slots || null,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      }),
    });
    setSavingId(null);
  }

  async function addBlockedDate() {
    if (!newBlockedDate) return;
    await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newBlockedDate, reason: newBlockedReason || undefined }),
    });
    setNewBlockedDate("");
    setNewBlockedReason("");
    fetchAll();
  }

  async function removeBlockedDate(id: string) {
    await fetch(`/api/blocked-dates/${id}`, { method: "DELETE" });
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-2xl border border-cream-300 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-800">Horarios</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">
          Configurá los turnos disponibles por día. Podés usar horarios específicos o un rango automático.
        </p>
      </div>

      {/* Schedule per day */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-sm mb-6">
        <div className="p-5 border-b border-cream-200">
          <h2 className="font-serif text-lg text-gray-800">Turnos por día</h2>
          <p className="font-sans text-xs text-gray-400 mt-1">
            <strong>Turnos específicos</strong>: ingresá horarios separados por coma, ej: <code className="bg-cream-100 px-1 rounded">16:00,17:30</code> &nbsp;·&nbsp;
            <strong>Automático</strong>: dejá vacío y configurá el rango horario.
          </p>
        </div>

        <div className="divide-y divide-cream-100">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const schedule = schedules.find((s) => s.dayOfWeek === dayIndex);
            if (!schedule) {
              return (
                <div key={dayIndex} className="px-5 py-4 flex items-center justify-between">
                  <span className="font-sans text-sm text-gray-500 w-28">{dayName}</span>
                  <span className="font-sans text-xs text-gray-300 italic">Sin configuración</span>
                </div>
              );
            }

            return (
              <div key={dayIndex} className="px-5 py-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Day name + active toggle */}
                  <div className="flex items-center gap-3 w-36">
                    <input
                      type="checkbox"
                      checked={schedule.active}
                      onChange={(e) => handleChange(schedule.id, "active", e.target.checked)}
                      className="w-4 h-4 text-teal-400 rounded border-cream-300 focus:ring-teal-400"
                    />
                    <span className={`font-sans text-sm font-medium ${schedule.active ? "text-gray-700" : "text-gray-400"}`}>
                      {dayName}
                    </span>
                  </div>

                  {schedule.active && (
                    <>
                      {/* Specific slots */}
                      <div className="flex-1 min-w-48">
                        <label className="block font-sans text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
                          Turnos específicos (separados por coma)
                        </label>
                        <input
                          type="text"
                          value={schedule.slots ?? ""}
                          onChange={(e) => handleChange(schedule.id, "slots", e.target.value || null)}
                          placeholder="16:00,17:30"
                          className="input-field py-2 text-sm w-full"
                        />
                      </div>

                      {/* Range fallback — only shown when no specific slots */}
                      {!schedule.slots && (
                        <div className="flex items-center gap-2">
                          <div>
                            <label className="block font-sans text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Desde</label>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => handleChange(schedule.id, "startTime", e.target.value)}
                              className="input-field w-28 py-2 text-xs"
                            />
                          </div>
                          <span className="font-sans text-xs text-gray-400 mt-4">–</span>
                          <div>
                            <label className="block font-sans text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Hasta</label>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => handleChange(schedule.id, "endTime", e.target.value)}
                              className="input-field w-28 py-2 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => saveSchedule(schedule)}
                    disabled={savingId === schedule.id}
                    className="font-sans text-xs text-teal-500 hover:text-teal-600 px-3 py-1.5 rounded-full border border-teal-200 hover:bg-teal-50 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {savingId === schedule.id ? "Guardando..." : "Guardar"}
                  </button>
                </div>

                {/* Preview of configured slots */}
                {schedule.active && schedule.slots && (
                  <div className="mt-2 ml-[156px] flex flex-wrap gap-1.5">
                    {schedule.slots.split(",").map((s) => s.trim()).filter(Boolean).map((slot) => (
                      <span key={slot} className="font-sans text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full">
                        {slot} hs
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-sm">
        <div className="p-5 border-b border-cream-200">
          <h2 className="font-serif text-lg text-gray-800">Fechas bloqueadas</h2>
          <p className="font-sans text-xs text-gray-400 mt-1">Vacaciones, feriados o días sin atención.</p>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-5 flex-wrap">
            <input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="input-field w-40 py-2 text-sm"
            />
            <input
              type="text"
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              placeholder="Motivo (opcional)"
              className="input-field flex-1 min-w-32 py-2 text-sm"
            />
            <button onClick={addBlockedDate} disabled={!newBlockedDate} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
              Bloquear fecha
            </button>
          </div>

          {blockedDates.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 text-center py-6">No hay fechas bloqueadas</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between p-3 bg-cream-100 rounded-xl">
                  <div>
                    <span className="font-sans text-sm text-gray-700 font-medium">{bd.date}</span>
                    {bd.reason && <span className="font-sans text-xs text-gray-500 ml-2">· {bd.reason}</span>}
                  </div>
                  <button onClick={() => removeBlockedDate(bd.id)} className="font-sans text-xs text-red-400 hover:text-red-600 transition-colors">
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
