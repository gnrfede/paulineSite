import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations";
import { getAdminFromCookie } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/availability";

// GET /api/bookings — admin only, returns all bookings
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

// POST /api/bookings — public, create a new booking
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

    const { serviceId, date, timeSlot, name, email, phone, notes } = parsed.data;

    // Verify service exists and is active
    const service = await prisma.service.findFirst({
      where: { id: serviceId, active: true },
    });
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Verify slot is still available
    const available = await getAvailableSlots(date, service.duration);
    if (!available.includes(timeSlot)) {
      return NextResponse.json(
        { error: "El horario seleccionado ya no está disponible" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: { serviceId, date, timeSlot, name, email, phone, notes, status: "PENDING" },
      include: { service: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
