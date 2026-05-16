import Link from "next/link";
import type { Service } from "@/types";

// Fixed icon set mapped by display order (1-based)
const ICONS: Record<number, React.ReactNode> = {
  1: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  2: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  3: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
  4: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  5: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  6: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0c0 4.97-4.03 9-9 9" />
    </svg>
  ),
  7: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  8: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

interface ServicesProps {
  services: Service[];
}

export function Services({ services }: ServicesProps) {
  return (
    <section id="servicios" className="py-24 bg-cream-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="section-label mb-4">Qué hago</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-tight text-gray-800">
              Tratamientos{" "}
              <em className="italic text-teal-500">especializados</em>
            </h2>
          </div>
          <p className="font-sans text-sm text-gray-400 max-w-xs md:text-right leading-relaxed">
            Cada servicio parte de un diagnóstico real de tu piel.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="group bg-white rounded-2xl border border-cream-300 p-6 hover:border-teal-200 hover:shadow-md transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 group-hover:bg-teal-100 transition-colors">
                  {ICONS[srv.order] ?? ICONS[1]}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-300 font-medium">
                    {String(srv.order).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-[10px] bg-teal-50 text-teal-500 px-2 py-0.5 rounded-full">
                    Facial
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-lg text-gray-800 mb-2">{srv.name}</h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed mb-4">
                {srv.description}
              </p>

              <div className="flex items-center justify-end pt-4 border-t border-cream-200">
                <Link
                  href="/reservar"
                  className="font-sans text-xs text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Reservar
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/reservar" className="btn-primary">
            Reservar mi turno
          </Link>
        </div>
      </div>
    </section>
  );
}
