import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard | Admin Pauline Studio" };

async function getStats() {
  const [total, pending, confirmed, rejected, services] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "REJECTED" } }),
    prisma.service.count({ where: { active: true } }),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = await prisma.booking.findMany({
    where: { date: today, status: { in: ["PENDING", "CONFIRMED"] } },
    include: { service: true },
    orderBy: { timeSlot: "asc" },
  });

  const recent = await prisma.booking.findMany({
    include: { service: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { total, pending, confirmed, rejected, services, todayBookings, recent };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

export default async function DashboardPage() {
  const { total, pending, confirmed, rejected, services, todayBookings, recent } = await getStats();

  const todayFormatted = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-800">Resumen</h1>
        <p className="font-sans text-sm text-gray-400 mt-1 capitalize">{todayFormatted}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total reservas", value: total, icon: "📅", color: "bg-white" },
          { label: "Pendientes", value: pending, icon: "⏳", color: "bg-amber-50", textColor: "text-amber-700" },
          { label: "Confirmadas", value: confirmed, icon: "✅", color: "bg-teal-50", textColor: "text-teal-700" },
          { label: "Servicios activos", value: services, icon: "✦", color: "bg-white" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl border border-cream-300 p-5 shadow-sm`}>
            <div className="text-xl mb-2">{stat.icon}</div>
            <div className={`font-serif text-3xl ${stat.textColor || "text-gray-800"}`}>{stat.value}</div>
            <div className="font-sans text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm">
          <div className="p-5 border-b border-cream-200">
            <h2 className="font-serif text-lg text-gray-800">Agenda de hoy</h2>
          </div>
          <div className="p-5">
            {todayBookings.length === 0 ? (
              <p className="font-sans text-sm text-gray-400 text-center py-6">
                Sin turnos para hoy
              </p>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <div className="w-12 shrink-0 text-center">
                      <span className="font-sans text-sm font-medium text-teal-600">{b.timeSlot}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-gray-700 truncate">{b.name}</p>
                      <p className="font-sans text-xs text-gray-400 truncate">{b.service.name}</p>
                    </div>
                    <span className={`shrink-0 status-badge ${STATUS_COLORS[b.status]}`}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm">
          <div className="p-5 border-b border-cream-200 flex items-center justify-between">
            <h2 className="font-serif text-lg text-gray-800">Últimas reservas</h2>
            <a href="/admin/dashboard/turnos" className="font-sans text-xs text-teal-500 hover:text-teal-600">
              Ver todas →
            </a>
          </div>
          <div className="p-5 space-y-3">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cream-200 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-sans text-xs text-gray-500 font-medium">
                    {b.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-gray-700 truncate">{b.name}</p>
                  <p className="font-sans text-xs text-gray-400">
                    {b.date} · {b.timeSlot} hs
                  </p>
                </div>
                <span className={`shrink-0 status-badge ${STATUS_COLORS[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
