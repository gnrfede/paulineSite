import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/availability";

// GET /api/availability?serviceIds=id1,id2&date=YYYY-MM-DD
// Also accepts legacy ?serviceId=xxx for backwards compatibility
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // Support both ?serviceIds=id1,id2 and legacy ?serviceId=xxx
  const rawIds = searchParams.get("serviceIds") || searchParams.get("serviceId");

  if (!rawIds || !date) {
    return NextResponse.json(
      { error: "serviceIds y date son requeridos" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(date + "T00:00:00") < today) {
    return NextResponse.json({ date, slots: [] });
  }

  const serviceIdList = rawIds.split(",").map((s) => s.trim()).filter(Boolean);

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIdList }, active: true },
  });

  if (services.length === 0) {
    return NextResponse.json({ error: "Servicios no encontrados" }, { status: 404 });
  }

  // Total duration = sum of all selected services
  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

  const slots = await getAvailableSlots(date, totalDuration);
  return NextResponse.json({ date, slots });
}
