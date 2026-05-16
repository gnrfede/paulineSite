import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";

const MANUAL_TOKEN = "pauline-reminders-2026";

// Called daily by Vercel Cron at 12:00 UTC (9:00 AM Buenos Aires).
// Vercel authenticates with Authorization: Bearer <CRON_SECRET> (auto-injected at build time).
// Manual trigger: GET /api/cron/reminders?token=pauline-reminders-2026
// Override date:  GET /api/cron/reminders?token=pauline-reminders-2026&date=2026-05-18
export async function GET(req: NextRequest) {
  const params      = new URL(req.url).searchParams;
  const queryToken  = params.get("token");
  const cronSecret  = process.env.CRON_SECRET;
  const authHeader  = req.headers.get("authorization");

  // Allow: Vercel cron (Bearer CRON_SECRET), manual token, or no-secret env (dev/unconfigured)
  const fromVercel  = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;
  const fromManual  = queryToken === MANUAL_TOKEN;
  const noSecretSet = !cronSecret; // allow if secret not yet configured

  if (!fromVercel && !fromManual && !noSecretSet) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use ?date= override if provided, otherwise calculate 2 days ahead in Buenos Aires time (UTC-3)
  let targetStr = params.get("date");
  if (!targetStr) {
    const now = new Date();
    now.setTime(now.getTime() - 3 * 60 * 60 * 1000); // adjust to UTC-3
    now.setDate(now.getDate() + 2);
    targetStr = now.toISOString().split("T")[0];
  }

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
