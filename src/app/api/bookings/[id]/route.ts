import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateBookingSchema } from "@/lib/validations";
import { getAdminFromCookie } from "@/lib/auth";

// GET /api/bookings/:id — admin only
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true },
  });

  if (!booking) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(booking);
}

// PATCH /api/bookings/:id — admin only, update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: parsed.data,
    include: { service: true },
  });

  return NextResponse.json(booking);
}

// DELETE /api/bookings/:id — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
