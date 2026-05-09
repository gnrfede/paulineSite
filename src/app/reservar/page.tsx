import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { BookingForm } from "@/components/booking/BookingForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reservar turno | Pauline Studio",
  description: "Reservá tu turno online con Paula Spinelli, cosmiatra en Caballito, Buenos Aires.",
};

export default async function ReservarPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-100 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="section-label justify-center mb-4">Turnos online</p>
            <h1 className="font-serif text-4xl lg:text-5xl font-normal text-gray-800 mb-4">
              Reservá tu{" "}
              <em className="italic text-teal-500">turno</em>
            </h1>
            <p className="font-sans text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Elegí tu servicio, la fecha y el horario. Tu reserva quedará pendiente de confirmación por Paula.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-cream-300 p-6 lg:p-8 shadow-sm">
              <BookingForm services={services} />
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Info card */}
              <div className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm">
                <h3 className="font-serif text-lg text-gray-800 mb-4">¿Cómo funciona?</h3>
                <ol className="space-y-3">
                  {[
                    "Elegí el servicio, la fecha y el horario.",
                    "Completá tus datos de contacto.",
                    "Tu reserva queda en estado pendiente.",
                    "Paula confirma por email o WhatsApp.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium font-sans shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="font-sans text-sm text-gray-500 leading-snug">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>


              {/* Location */}
              <div className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm">
                <p className="font-sans text-xs font-medium text-gray-400 tracking-wide uppercase mb-2">Ubicación</p>
                <p className="font-sans text-sm text-gray-600 leading-relaxed">
                  Av. del Barco Centenera 150, Local 64<br />
                  <span className="text-gray-400">Caballito, CABA</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
