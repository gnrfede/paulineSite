import Link from "next/link";

// Decorative botanical leaf SVG
function LeafDecor({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M60 190 C60 190 60 20 60 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 160 C60 160 30 130 20 110" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M60 130 C60 130 85 105 95 88" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M60 100 C60 100 32 75 24 58" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M60 70 C60 70 82 50 90 36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="20" cy="110" rx="18" ry="10" transform="rotate(-35 20 110)" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="95" cy="88" rx="18" ry="10" transform="rotate(35 95 88)" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="24" cy="58" rx="16" ry="9" transform="rotate(-30 24 58)" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="90" cy="36" rx="16" ry="9" transform="rotate(30 90 36)" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const treatments = [
  { label: "Peeling Químico", icon: "⚗️" },
  { label: "Microneedling", icon: "✦" },
  { label: "Higiene Profunda", icon: "✿" },
  { label: "Radiofrecuencia", icon: "〰" },
  { label: "Dermaplaning", icon: "✧" },
  { label: "Punta de Diamante", icon: "💎" },
  { label: "Peeling Enzimático", icon: "🌿" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream-100">
      {/* Background blobs */}
      <div
        className="absolute top-0 right-0 w-[55vw] h-[55vw] max-w-3xl max-h-3xl rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8E6E3 0%, transparent 70%)", transform: "translate(25%, -25%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-xl max-h-xl rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F8E4E0 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
      />

      {/* Decorative leaves */}
      <LeafDecor className="leaf-decoration absolute top-20 right-8 w-16 h-28 text-teal-300" />
      <LeafDecor className="leaf-decoration absolute bottom-24 left-4 w-12 h-20 text-teal-300 scale-x-[-1]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-20 w-full text-center">
        <p className="section-label justify-center mb-5">
          Cosmetóloga · Cosmiatra · Buenos Aires
        </p>

        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] text-gray-800 mb-6">
          Tu piel,{" "}
          <em className="italic text-teal-500">sin filtros.</em>
        </h1>

        <p className="font-sans text-base text-gray-500 leading-relaxed max-w-md mx-auto mb-8">
          +13 años de experiencia. Atención 100% personalizada. Protocolos diseñados para <em>tu</em> piel, no para las tendencias.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/reservar" className="btn-primary">
            Reservar turno
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link href="/#servicios" className="btn-outline">
            Ver servicios
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-10 mt-12 justify-center">
          {[
            { n: "+13", label: "Años" },
            { n: "100%", label: "Personalizado" },
            { n: "3.8k", label: "Seguidores" },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="font-serif text-2xl text-teal-500">{s.n}</div>
              <div className="font-sans text-xs text-gray-400 tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Treatment pills */}
        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {treatments.map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-1.5 bg-white border border-cream-300 rounded-full px-4 py-1.5 font-sans text-xs text-gray-600 shadow-sm"
            >
              <span className="text-teal-400">{t.icon}</span>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
