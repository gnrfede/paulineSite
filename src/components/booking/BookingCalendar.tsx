"use client";

import { useState } from "react";

interface BookingCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  unavailableDays?: number[]; // day-of-week indices with no schedule
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

// Business closed on Sundays (day 0) by default
const CLOSED_DAYS = [0];

function toLocalDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function BookingCalendar({ selectedDate, onSelectDate, unavailableDays = CLOSED_DAYS }: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // Prevent navigating to past months
  const isCurrentMonthOrLater =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Max 3 months ahead
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 3);
  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  function handleDayClick(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    if (date < today) return;
    if (unavailableDays.includes(date.getDay())) return;
    onSelectDate(toLocalDateStr(viewYear, viewMonth, day));
  }

  const cells: Array<{ day: number | null; dateStr: string | null; isPast: boolean; isClosed: boolean; isToday: boolean }> = [];

  // Padding before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push({ day: null, dateStr: null, isPast: false, isClosed: false, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    date.setHours(0, 0, 0, 0);
    cells.push({
      day: d,
      dateStr: toLocalDateStr(viewYear, viewMonth, d),
      isPast: date < today,
      isClosed: unavailableDays.includes(date.getDay()),
      isToday: date.getTime() === today.getTime(),
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-cream-300 p-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="font-serif text-base text-gray-700 capitalize">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>

        <button
          onClick={nextMonth}
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

          const isSelected = cell.dateStr === selectedDate;
          const isDisabled = cell.isPast || cell.isClosed;

          return (
            <button
              key={cell.dateStr}
              onClick={() => cell.day && handleDayClick(cell.day)}
              disabled={isDisabled}
              className={`
                calendar-day mx-auto
                ${isSelected ? "selected" : ""}
                ${cell.isToday && !isSelected ? "today" : ""}
                ${isDisabled ? "past" : ""}
                ${!isDisabled && !isSelected ? "hover:bg-teal-50 hover:text-teal-700" : ""}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-cream-200 flex gap-4 text-xs text-gray-400 font-sans">
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
          No disponible
        </span>
      </div>
    </div>
  );
}
