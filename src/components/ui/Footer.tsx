import Link from "next/link";
import { LogoFull } from "./LogoSVG";

export function Footer() {
  return (
    <footer className="bg-white border-t border-cream-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <LogoFull className="mb-4" />
            <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-xs">
              Cosmetóloga y cosmiatra con +13 años de experiencia. Atención 100% personalizada en Caballito, Buenos Aires.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-gray-400 mb-4">
              Navegación
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/#about", label: "Sobre mí" },
                { href: "/#servicios", label: "Servicios" },
                { href: "/#galeria", label: "Resultados" },
                { href: "/#contacto", label: "Contacto" },
                { href: "/reservar", label: "Reservar turno" },
                { href: "/mis-turnos", label: "Mis turnos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-gray-500 hover:text-teal-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-xs font-medium tracking-[0.2em] uppercase text-gray-400 mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Av. del Barco Centenera 150, Local 64 · Caballito, CABA</span>
              </li>
              <li>
                <a
                  href="https://wa.me/5491134193424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-500 transition-colors"
                >
                  <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  11 3419 3424
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/cosmiatra.paulaspinelli/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-500 transition-colors"
                >
                  <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth={1.5} />
                    <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                  @cosmiatra.paulaspinelli
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-gray-400">
            © {new Date().getFullYear()} Pauline Studio · Paula Spinelli. Todos los derechos reservados.
          </p>
          <Link
            href="/admin/login"
            className="font-sans text-xs text-gray-300 hover:text-gray-400 transition-colors"
          >
            Panel admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
