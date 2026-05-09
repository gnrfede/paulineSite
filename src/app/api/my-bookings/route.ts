import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/my-bookings?email=xxx — public, looks up bookings by email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: { email: email.toLowerCase() },
    include: { service: true },
    orderBy: [{ date: "desc" }, { timeSlot: "desc" }],
  });

  return NextResponse.json(bookings);
}
