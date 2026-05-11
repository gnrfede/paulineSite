import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/my-bookings?email=xxx — public, looks up bookings by email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("email");

  if (!raw) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const parsed = z.string().email().safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: { email: parsed.data.toLowerCase() },
    include: { service: true },
    orderBy: [{ date: "desc" }, { timeSlot: "desc" }],
  });

  return NextResponse.json(bookings);
}
