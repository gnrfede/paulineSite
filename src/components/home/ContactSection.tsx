import Link from "next/link";

const DAYS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export function ContactSection() {
  return (
    <section id="contacto" className="py-24 bg-cream-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Info */}
          <div>
            <p className="section-label mb-5">Contacto</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-tight text-gray-800 mb-8">
              Reservá tu{" "}
              <em className="italic text-teal-500">turno hoy</em>
            </h2>

            <div className="space-y-5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/5491134193424"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-cream-300 hover:border-teal-200 hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans text-xs text-gray-400 tracking-wide uppercase">WhatsApp</p>
                  <p className="font-sans text-sm font-medium text-gray-700">11 3419 3424</p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/cosmiatra.paulaspinelli/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-cream-300 hover:border-teal-200 hover:shadow-sm transition-all group"
              >
                <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth={1.5} />
                    <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="#6BBFB5" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans text-xs text-gray-400 tracking-wide uppercase">Instagram</p>
                  <p className="font-sans text-sm font-medium text-gray-700">@cosmiatra.paulaspinelli</p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-cream-300">
                <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans text-xs text-gray-400 tracking-wide uppercase mb-1">Ubicación</p>
                  <p className="font-sans text-sm text-gray-700">Av. del Barco Centenera 150, Local 64</p>
                  <p className="font-sans text-sm text-gray-500">Caballito, CABA</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-8 p-5 bg-white rounded-2xl border border-cream-300">
              <h3 className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-gray-400 mb-4">
                Horarios de atención
              </h3>
              <div className="space-y-2">
                {[
                  { days: "Lunes a Viernes", hours: "9:00 – 19:00" },
                  { days: "Sábados", hours: "9:00 – 14:00" },
                  { days: "Domingos", hours: "Cerrado" },
                ].map((h) => (
                  <div key={h.days} className="flex justify-between items-center">
                    <span className="font-sans text-sm text-gray-600">{h.days}</span>
                    <span className={`font-sans text-sm ${h.hours === "Cerrado" ? "text-gray-400" : "text-teal-600 font-medium"}`}>
                      {h.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA card */}
          <div className="flex flex-col justify-center">
            <div className="bg-teal-400 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-8 -translate-x-8" />

              <div className="relative z-10">
                <p className="font-sans text-xs tracking-[0.25em] uppercase opacity-70 mb-4">
                  Primera consulta
                </p>
                <h3 className="font-serif text-3xl font-normal leading-snug mb-4">
                  Tu piel merece un{" "}
                  <em className="italic">diagnóstico real.</em>
                </h3>
                <p className="font-sans text-sm opacity-80 leading-relaxed mb-8">
                  Sin compromiso. Evaluamos tu piel en profundidad y diseñamos el protocolo exacto que necesitás.
                </p>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/reservar"
                    className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 font-sans font-medium text-sm tracking-wide px-6 py-3.5 rounded-full hover:bg-teal-50 transition-colors"
                  >
                    Reservar turno online
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="https://wa.me/5491134193424"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-sans font-medium text-sm tracking-wide px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    Escribir por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
