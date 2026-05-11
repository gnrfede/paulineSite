import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/availability/month?year=2024&month=5
// Returns { availability: { "YYYY-MM-DD": slotCount } } for days with open slots
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-indexed

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "year y month son requeridos" }, { status: 400 });
  }

  const pad   = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const startDate = `${year}-${pad(month)}-01`;
  const endDate   = `${year}-${pad(month)}-${pad(lastDay)}`;

  // Batch all DB reads
  const [blockedRows, schedules, bookings] = await Promise.all([
    prisma.blockedDate.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { date: true },
    }),
    prisma.schedule.findMany({ where: { active: true } }),
    prisma.booking.findMany({
      where: { date: { gte: startDate, lte: endDate }, status: { in: ["PENDING", "CONFIRMED"] } },
      select: { date: true, timeSlot: true },
    }),
  ]);

  const blockedSet    = new Set(blockedRows.map((b) => b.date));
  const scheduleByDow = new Map(schedules.map((s) => [s.dayOfWeek, s]));

  // Group taken slots by date
  const takenByDate = new Map<string, Set<string>>();
  for (const b of bookings) {
    if (!takenByDate.has(b.date)) takenByDate.set(b.date, new Set());
    takenByDate.get(b.date)!.add(b.timeSlot);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availability: Record<string, number> = {};

  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    const date    = new Date(dateStr + "T00:00:00");

    if (date < today)         continue;
    if (blockedSet.has(dateStr)) continue;

    const schedule = scheduleByDow.get(date.getDay());
    if (!schedule) continue;

    const taken = takenByDate.get(dateStr) ?? new Set<string>();
    let count = 0;

    if (schedule.slots) {
      count = schedule.slots.split(",")
        .map((s) => s.trim())
        .filter((s) => /^\d{2}:\d{2}$/.test(s) && !taken.has(s))
        .length;
    } else {
      const [sh, sm] = schedule.startTime.split(":").map(Number);
      const [eh, em] = schedule.endTime.split(":").map(Number);
      for (let t = sh * 60 + sm; t < eh * 60 + em; t += 30) {
        const slot = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
        if (!taken.has(slot)) count++;
      }
    }

    if (count > 0) availability[dateStr] = count;
  }

  return NextResponse.json({ year, month, availability });
}
