import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/availability";

// GET /api/availability?serviceId=xxx&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "serviceId y date son requeridos" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 });
  }

  // Don't allow past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(date + "T00:00:00");
  if (selected < today) {
    return NextResponse.json({ date, slots: [] });
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });

  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  const slots = await getAvailableSlots(date, service.duration);
  return NextResponse.json({ date, slots });
}
