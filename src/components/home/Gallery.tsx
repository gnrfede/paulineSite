import Image from "next/image";
import Link from "next/link";

const galleryImages = [
  { src: "/images/inst publication 3.jpeg", alt: "Resultado tratamiento facial" },
  { src: "/images/inst publication 4.jpeg", alt: "Peeling resultados" },
  { src: "/images/inst publication 6.jpeg", alt: "Tratamiento dermapen" },
  { src: "/images/inst publication 7.jpeg", alt: "Limpieza facial" },
  { src: "/images/inst publication 8.jpeg", alt: "Resultado radiofrecuencia" },
  { src: "/images/inst publication 9.jpeg", alt: "Antes y después" },
];

export function Gallery() {
  return (
    <section id="galeria" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="section-label mb-4">Resultados reales</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-normal leading-tight text-gray-800">
              El trabajo habla{" "}
              <em className="italic text-teal-500">por sí solo</em>
            </h2>
          </div>
          <a
            href="https://www.instagram.com/cosmiatra.paulaspinelli/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-sans text-sm text-teal-500 hover:text-teal-600 transition-colors border-b border-teal-200 pb-0.5 self-start md:self-auto"
          >
            @cosmiatra.paulaspinelli
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {galleryImages.map((img, i) => (
            <a
              key={i}
              href="https://www.instagram.com/cosmiatra.paulaspinelli/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-cream-200"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
                  <svg className="w-5 h-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth={1.5} />
                    <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
