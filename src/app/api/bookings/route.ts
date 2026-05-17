import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations";
import { getAdminFromCookie } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/availability";
import { sendBookingRequestEmail, sendAdminNotificationEmail } from "@/lib/email";

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
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { serviceIds, date, timeSlot, name, email, phone, notes, newsletterConsent } = parsed.data;

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

    // Verify the slot is still free (availability is slot-based, not duration-based)
    const available = await getAvailableSlots(date);
    if (!available.includes(timeSlot)) {
      return NextResponse.json(
        { error: "El horario seleccionado ya no está disponible" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId: serviceIds[0],
        serviceIds: JSON.stringify(serviceIds),
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

    const serviceNames = services.map((s) => s.name);

    // Save newsletter consent if given
    if (newsletterConsent) {
      await prisma.newsletterConsent.upsert({
        where: { email },
        update: { active: true, consentedAt: new Date(), name },
        create: { email, name, active: true },
      });
    }

    // Email al cliente
    try {
      await sendBookingRequestEmail({ to: email, name, serviceNames, date, timeSlot, phone, notes });
      console.log("[email] booking request sent to", email);
    } catch (err) {
      console.error("[email] booking request failed:", err);
    }

    // Notificación al admin
    try {
      await sendAdminNotificationEmail({ bookingId: booking.id, name, email, phone, serviceNames, date, timeSlot, notes });
      console.log("[email] admin notification sent");
    } catch (err) {
      console.error("[email] admin notification failed:", err);
    }

    // Attach full services list to the response
    return NextResponse.json({ ...booking, allServices: services }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
