import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations";
import { getAdminFromCookie } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/availability";

// GET /api/bookings — admin only
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) where.date = date;

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });

  return NextResponse.json(bookings);
}

// POST /api/bookings — public
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { serviceIds, date, timeSlot, name, email, phone, notes } = parsed.data;

    // Fetch all selected services
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, active: true },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "Uno o más servicios no están disponibles" },
        { status: 404 }
      );
    }

    // Total duration = sum of all services
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

    // Verify the slot is still available for the total duration
    const available = await getAvailableSlots(date, totalDuration);
    if (!available.includes(timeSlot)) {
      return NextResponse.json(
        { error: "El horario seleccionado ya no está disponible" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: serviceIds[0],             // primary for DB relation
        serviceIds: JSON.stringify(serviceIds), // all selected
        date,
        timeSlot,
        name,
        email,
        phone,
        notes,
        status: "PENDING",
      },
      include: { service: true },
    });

    // Attach full services list to the response
    return NextResponse.json({ ...booking, allServices: services }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
