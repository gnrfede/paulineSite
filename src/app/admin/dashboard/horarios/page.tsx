"use client";

import { useState, useEffect } from "react";

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  const [savingScheduleId, setSavingScheduleId] = useState<string | null>(null);

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

  async function updateSchedule(schedule: Schedule) {
    setSavingScheduleId(schedule.id);
    await fetch(`/api/schedules/${schedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        active: schedule.active,
      }),
    });
    setSavingScheduleId(null);
  }

  function handleScheduleChange(id: string, field: keyof Schedule, value: string | boolean) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  async function addBlockedDate() {
    if (!newBlockedDate) return;
    const res = await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newBlockedDate, reason: newBlockedReason || undefined }),
    });
    if (res.ok) {
      setNewBlockedDate("");
      setNewBlockedReason("");
      fetchAll();
    }
  }

  async function removeBlockedDate(id: string) {
    await fetch(`/api/blocked-dates/${id}`, { method: "DELETE" });
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-cream-300 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-800">Horarios</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">
          Configurá los días y horarios de atención
        </p>
      </div>

      {/* Working schedule */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-sm mb-6">
        <div className="p-5 border-b border-cream-200">
          <h2 className="font-serif text-lg text-gray-800">Horarios por día</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const schedule = schedules.find((s) => s.dayOfWeek === dayIndex);
            if (!schedule) {
              return (
                <div key={dayIndex} className="px-5 py-4 flex items-center justify-between">
                  <span className="font-sans text-sm text-gray-700 w-28">{dayName}</span>
                  <span className="font-sans text-xs text-gray-400">Sin horario configurado</span>
                </div>
              );
            }

            return (
              <div key={dayIndex} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <span className="font-sans text-sm text-gray-700 w-28">{dayName}</span>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule.active}
                    onChange={(e) => handleScheduleChange(schedule.id, "active", e.target.checked)}
                    className="w-4 h-4 text-teal-400 rounded border-cream-300"
                  />
                  <span className="font-sans text-xs text-gray-500">Activo</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => handleScheduleChange(schedule.id, "startTime", e.target.value)}
                    disabled={!schedule.active}
                    className="input-field w-28 py-2 text-xs disabled:opacity-50"
                  />
                  <span className="font-sans text-xs text-gray-400">–</span>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => handleScheduleChange(schedule.id, "endTime", e.target.value)}
                    disabled={!schedule.active}
                    className="input-field w-28 py-2 text-xs disabled:opacity-50"
                  />
                </div>

                <button
                  onClick={() => updateSchedule(schedule)}
                  disabled={savingScheduleId === schedule.id}
                  className="font-sans text-xs text-teal-500 hover:text-teal-600 px-3 py-1.5 rounded-full border border-teal-200 hover:bg-teal-50 transition-colors disabled:opacity-50"
                >
                  {savingScheduleId === schedule.id ? "Guardando..." : "Guardar"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-sm">
        <div className="p-5 border-b border-cream-200">
          <h2 className="font-serif text-lg text-gray-800">Fechas bloqueadas</h2>
          <p className="font-sans text-xs text-gray-400 mt-1">
            Vacaciones, feriados o días sin atención
          </p>
        </div>

        <div className="p-5">
          {/* Add new */}
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
            <button
              onClick={addBlockedDate}
              disabled={!newBlockedDate}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
            >
              Bloquear fecha
            </button>
          </div>

          {/* List */}
          {blockedDates.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 text-center py-6">
              No hay fechas bloqueadas
            </p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div
                  key={bd.id}
                  className="flex items-center justify-between p-3 bg-cream-100 rounded-xl"
                >
                  <div>
                    <span className="font-sans text-sm text-gray-700 font-medium">{bd.date}</span>
                    {bd.reason && (
                      <span className="font-sans text-xs text-gray-500 ml-2">· {bd.reason}</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlockedDate(bd.id)}
                    className="font-sans text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
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
