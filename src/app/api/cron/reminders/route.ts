import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";

const MANUAL_TOKEN = "pauline-reminders-2026";

// Called daily by Vercel Cron at 12:00 UTC (9:00 AM Buenos Aires).
// Can also be triggered manually: GET /api/cron/reminders?token=pauline-reminders-2026
export async function GET(req: NextRequest) {
  const isVercelCron   = req.headers.get("x-vercel-cron") === "1";
  const queryToken     = new URL(req.url).searchParams.get("token");
  const secret         = process.env.CRON_SECRET;
  const hasValidSecret = secret && req.headers.get("authorization") === `Bearer ${secret}`;

  if (!isVercelCron && queryToken !== MANUAL_TOKEN && !hasValidSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = new Date();
  target.setDate(target.getDate() + 2);
  const targetStr = target.toISOString().split("T")[0];

  const bookings = await prisma.booking.findMany({
    where: { date: targetStr, status: "CONFIRMED" },
    include: { service: true },
  });

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
      console.log(`[reminder] sent to ${booking.email} for ${booking.date}`);
    } catch (err) {
      console.error(`[reminder] failed for booking ${booking.id}:`, err);
      results.push({ id: booking.id, email: booking.email, status: "failed" });
    }
  }

  return NextResponse.json({ date: targetStr, total: bookings.length, results });
}
