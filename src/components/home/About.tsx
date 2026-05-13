export function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <p className="section-label mb-5">Sobre mí</p>

        <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-tight text-gray-800 mb-6">
          Ciencia real para{" "}
          <em className="italic text-teal-500">tu piel</em>
        </h2>

        <p className="font-sans text-sm text-gray-500 leading-relaxed mb-4">
          Soy Paula Spinelli, cosmetóloga y cosmiatra con base en Caballito, Buenos Aires. Durante más de 13 años trabajé para entender que no existe una fórmula universal: cada piel es un ecosistema único.
        </p>
        <p className="font-sans text-sm text-gray-500 leading-relaxed mb-8">
          En Pauline Studio, el diagnóstico va primero. Nada de protocolos genéricos. Te veo a vos, evaluamos tu piel en profundidad y diseñamos el camino juntas.
        </p>

        <div className="space-y-3 mb-8">
          {[
            "Diagnóstico personalizado antes de cualquier tratamiento",
            "Protocolos adaptados a tu tipo de piel específico",
            "Activos de alta calidad y técnicas actualizadas",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-sans text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>

        <div className="bg-cream-100 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-sans text-xs text-gray-500">Av. del Barco Centenera 150, Local 64 · Caballito, CABA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
