"use client";

import { useState } from "react";

interface BookingCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availabilityMap?: Record<string, number>; // dateStr → available slot count
  loadingAvailability?: boolean;
  onMonthChange?: (year: number, month: number) => void; // month is 1-indexed
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

function toLocalDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  availabilityMap,
  loadingAvailability = false,
  onMonthChange,
}: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  function changeMonth(dir: 1 | -1) {
    let newYear  = viewYear;
    let newMonth = viewMonth + dir;
    if (newMonth < 0)  { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0;  newYear++; }
    setViewYear(newYear);
    setViewMonth(newMonth);
    onMonthChange?.(newYear, newMonth + 1);
  }

  const cells: Array<{
    day: number | null;
    dateStr: string | null;
    isPast: boolean;
    isToday: boolean;
    slots: number | null;
  }> = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push({ day: null, dateStr: null, isPast: false, isToday: false, slots: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date    = new Date(viewYear, viewMonth, d);
    date.setHours(0, 0, 0, 0);
    const dateStr = toLocalDateStr(viewYear, viewMonth, d);
    const slots   = availabilityMap ? (availabilityMap[dateStr] ?? 0) : null;
    cells.push({
      day: d,
      dateStr,
      isPast:  date < today,
      isToday: date.getTime() === today.getTime(),
      slots,
    });
  }

  function handleDayClick(cell: typeof cells[number]) {
    if (!cell.day || !cell.dateStr || cell.isPast) return;
    if (availabilityMap && (availabilityMap[cell.dateStr] ?? 0) === 0) return;
    onSelectDate(cell.dateStr);
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-300 p-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => changeMonth(-1)}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h3 className="font-serif text-base text-gray-700 capitalize">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          {loadingAvailability && (
            <svg className="w-3.5 h-3.5 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        <button
          onClick={() => changeMonth(1)}
          disabled={!canGoNext}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center font-sans text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (!cell.day) return <div key={`pad-${i}`} />;

          const isSelected  = cell.dateStr === selectedDate;
          const hasSlots    = availabilityMap ? (availabilityMap[cell.dateStr!] ?? 0) > 0 : true;
          const fullyBooked = availabilityMap !== undefined && !hasSlots && !cell.isPast;
          const isDisabled  = cell.isPast || fullyBooked;

          let dayClass = "calendar-day mx-auto ";

          if (isSelected) {
            dayClass += "selected ";
          } else if (cell.isPast) {
            dayClass += "past ";
          } else if (fullyBooked) {
            dayClass += "unavailable ";
          } else if (hasSlots) {
            dayClass += "available ";
            if (cell.isToday) dayClass += "today ";
          } else {
            if (cell.isToday) dayClass += "today ";
          }

          return (
            <div key={cell.dateStr} className="flex flex-col items-center">
              <button
                onClick={() => handleDayClick(cell)}
                disabled={isDisabled}
                className={dayClass.trim()}
              >
                {cell.day}
              </button>
              {!isSelected && !cell.isPast && availabilityMap && (
                <span
                  className={`mt-0.5 w-1 h-1 rounded-full ${
                    hasSlots ? "bg-teal-400" : "bg-transparent"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-cream-200 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 font-sans">
        {availabilityMap && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-50 border border-teal-300 inline-block" />
            Disponible
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
          Seleccionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-teal-300 inline-block" />
          Hoy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />
          Sin turnos
        </span>
      </div>
    </div>
  );
}
