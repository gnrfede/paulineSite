"use client";

interface TimeSlotsProps {
  slots: string[];
  selected: string | null;
  onSelect: (slot: string) => void;
  loading: boolean;
}

function formatSlot(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function TimeSlots({ slots, selected, onSelect, loading }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-cream-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-sans text-sm text-gray-500">
          No hay horarios disponibles para este día.
        </p>
        <p className="font-sans text-xs text-gray-400 mt-1">
          Probá con otra fecha.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`
            h-10 rounded-xl font-sans text-sm font-medium transition-all duration-150
            ${
              selected === slot
                ? "bg-teal-400 text-white shadow-sm"
                : "bg-cream-100 border border-cream-300 text-gray-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600"
            }
          `}
        >
          {formatSlot(slot)}
        </button>
      ))}
    </div>
  );
}
