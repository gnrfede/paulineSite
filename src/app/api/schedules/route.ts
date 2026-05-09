import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createScheduleSchema } from "@/lib/validations";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET() {
  const schedules = await prisma.schedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = createScheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Find existing schedule for this day and update, or create new
  const existing = await prisma.schedule.findFirst({
    where: { dayOfWeek: parsed.data.dayOfWeek },
  });

  let schedule;
  if (existing) {
    schedule = await prisma.schedule.update({
      where: { id: existing.id },
      data: {
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        active: parsed.data.active ?? true,
      },
    });
  } else {
    schedule = await prisma.schedule.create({ data: parsed.data });
  }

  return NextResponse.json(schedule, { status: 201 });
}
