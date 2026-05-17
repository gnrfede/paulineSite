import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";

const TOKEN = "pauline-reminders-2026";

// Called daily by Vercel Cron at 12:00 UTC (9:00 AM Buenos Aires).
// vercel.json includes the token in the path: /api/cron/reminders?token=pauline-reminders-2026
// Manual trigger: GET /api/cron/reminders?token=pauline-reminders-2026
// Override date:  GET /api/cron/reminders?token=pauline-reminders-2026&date=2026-05-20
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;

  if (params.get("token") !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use ?date= override if provided, otherwise 2 days ahead in Buenos Aires time (UTC-3)
  let targetStr = params.get("date");
  if (!targetStr) {
    const now = new Date();
    // Argentina is UTC-3 year-round (no DST)
    const bsas = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const y = bsas.getUTCFullYear();
    const m = bsas.getUTCMonth();
    const d = bsas.getUTCDate();
    const target = new Date(Date.UTC(y, m, d + 2));
    targetStr = target.toISOString().split("T")[0];
  }

  const bookings = await prisma.booking.findMany({
    where: { date: targetStr, status: "CONFIRMED" },
    include: { service: true },
  });

  console.log(`[cron/reminders] date=${targetStr} bookings=${bookings.length}`);

  const results: { id: string; email: string; status: string }[] = [];

  for (const booking of bookings) {
    try {
      let serviceNames: string[];
      if (booking.serviceIds) {
        const ids: string[] = JSON.parse(booking.serviceIds);
        const services = await prisma.service.findMany({
          where: { id: { in: ids } },
          select: { name: true },
        });
        serviceNames = services.map((s) => s.name);
      } else {
        serviceNames = [booking.service.name];
      }

      await sendReminderEmail({
        to: booking.email,
        name: booking.name,
        serviceNames,
        date: booking.date,
        timeSlot: booking.timeSlot,
      });

      results.push({ id: booking.id, email: booking.email, status: "sent" });
      console.log(`[cron/reminders] sent to ${booking.email} for ${booking.date}`);
    } catch (err) {
      console.error(`[cron/reminders] FAILED for booking ${booking.id}:`, err);
      results.push({ id: booking.id, email: booking.email, status: "failed" });
    }
  }

  return NextResponse.json({ date: targetStr, total: bookings.length, results });
}
