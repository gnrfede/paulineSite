const items = [
  "Peeling Químico",
  "Microneedling",
  "Higiene Profunda",
  "Radiofrecuencia",
  "Dermaplaning",
  "Peeling Enzimático",
  "Punta de Diamante",
  "Consulta de Diagnóstico",
];

export function Ticker() {
  const doubled = [...items, ...items];

  return (
    <div className="bg-teal-400 overflow-hidden py-3" aria-hidden="true">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 font-sans text-xs font-medium tracking-[0.22em] uppercase text-white px-8"
          >
            <span className="opacity-60">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
