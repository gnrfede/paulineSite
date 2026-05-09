import Image from "next/image";

export function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-cream-200 relative row-span-2">
                <Image
                  src="/images/tratamiento 5.jpeg"
                  alt="Paula Spinelli trabajando"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-teal-50 relative">
                <Image
                  src="/images/tratamiento 6.jpeg"
                  alt="Tratamiento facial"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-blush-100 relative">
                <Image
                  src="/images/tratamiento 7.jpeg"
                  alt="Resultado"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Quote card */}
            <div className="absolute -bottom-6 -right-4 max-w-[220px] bg-teal-400 text-white rounded-2xl p-4 shadow-lg">
              <p className="font-serif text-sm italic leading-snug">
                &ldquo;Cada piel cuenta una historia. Mi trabajo es escucharla.&rdquo;
              </p>
              <p className="font-sans text-xs opacity-70 mt-2">— Paula Spinelli</p>
            </div>
          </div>

          {/* Text */}
          <div>
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

            <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-500 bg-cream-100 rounded-xl p-4">
              <div className="flex items-start gap-2 flex-1">
                <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-sans text-xs">Av. del Barco Centenera 150, Local 64 · Caballito, CABA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
